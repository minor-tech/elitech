// Reads every voice file in src/audio/dialogueData.ts and writes src/audio/voiceTimings.json:
//   - per-word start frames for the captions (exact if <id>.words.json exists from
//     make_voices.py, otherwise estimated from the audio's loudness + punctuation)
//   - a per-frame loudness track that drives the talking mouths
// Re-run after replacing any voice file:  npm run timings
import {execFileSync, spawnSync} from 'node:child_process';
import {existsSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FPS = 30;
const RATE = 16000;
// usage: node scripts/build-voice-timings.mjs [dialogue.ts] [out.json]   (defaults: the Enamel short)
const dialogueFile = process.argv[2] ?? 'src/audio/dialogueData.ts';
const outFile = process.argv[3] ?? 'src/audio/voiceTimings.json';
const src = readFileSync(join(root, dialogueFile), 'utf8');
const lines = [...src.matchAll(/\{id: '(\w+)'.*?text: (?:"([^"]*)"|'([^']*)'), fromFrame: (\d+), toFrame: (\d+), voiceFile: '([^']+)'(?:, delay: (\d+))?/g)].map((m) => ({
  id: m[1],
  text: m[2] ?? m[3],
  from: Number(m[4]),
  to: Number(m[5]),
  file: m[6],
  delay: Number(m[7] ?? 0),
}));

const decode = (file) => {
  const args = ['-loglevel', 'error', '-i', file, '-ac', '1', '-ar', String(RATE), '-f', 'f32le', '-'];
  const out = spawnSync('ffmpeg', ['-version']).status === 0
    ? execFileSync('ffmpeg', args, {maxBuffer: 1 << 28})
    : execFileSync('npx', ['remotion', 'ffmpeg', ...args], {maxBuffer: 1 << 28, cwd: root, shell: process.platform === 'win32'});
  return new Float32Array(out.buffer, out.byteOffset, out.byteLength / 4);
};

const norm = (w) => w.toLowerCase().replace(/[^a-z0-9']/g, '');
const pauseAfter = (w) => (/\.\.\.$/.test(w) ? 7 : /[.?!]$/.test(w) ? 5 : /,$/.test(w) ? 3 : 0);

const result = {};
let problems = 0;
for (const l of lines) {
  const path = join(root, 'public', l.file);
  if (!existsSync(path)) {
    console.error(`MISSING ${l.file}`);
    problems++;
    continue;
  }
  const pcm = decode(path);
  const per = RATE / FPS;
  const nFrames = Math.ceil(pcm.length / per);
  const rms = Array.from({length: nFrames}, (_, f) => {
    let s = 0;
    const a = Math.floor(f * per);
    const b = Math.min(pcm.length, Math.floor((f + 1) * per));
    for (let i = a; i < b; i++) s += pcm[i] * pcm[i];
    return Math.sqrt(s / Math.max(1, b - a));
  });
  const peak = Math.max(...rms) || 1;
  const mouth = rms.map((v) => Math.round(Math.min(1, (v / peak) * 1.4) * 100) / 100);
  const voiced = mouth.map((v) => v > 0.12);
  const first = voiced.indexOf(true);
  const last = voiced.lastIndexOf(true);

  const display = l.text.split(/\s+/);
  let words;
  const wordsJson = path.replace(/\.mp3$/, '.words.json');
  let source = 'estimated';
  if (existsSync(wordsJson) && statSync(wordsJson).mtimeMs >= statSync(path).mtimeMs - 5000) {
    // exact edge-tts boundaries: align them to the display words in order
    const tts = JSON.parse(readFileSync(wordsJson, 'utf8'));
    let j = 0;
    words = display.map((w) => {
      const key = norm(w);
      while (j < tts.length && norm(tts[j].text) !== key && !key.startsWith(norm(tts[j].text))) j++;
      const hit = tts[Math.min(j, tts.length - 1)];
      j++;
      return {text: w, frame: Math.round((hit.startMs / 1000) * FPS)};
    });
    if (words.every((w, i) => i === 0 || w.frame >= words[i - 1].frame)) source = 'exact (word timestamps)';
    else words = null;
  }
  if (!words) {
    // estimate: spread words over the voiced span, weighted by length, with pauses at punctuation
    const weights = display.map((w) => norm(w).length + 2);
    const pauses = display.map(pauseAfter);
    const total = weights.reduce((a, b) => a + b, 0) + pauses.slice(0, -1).reduce((a, b) => a + b, 0);
    const span = Math.max(1, last - first);
    let acc = 0;
    words = display.map((w, i) => {
      const frame = Math.round(first + (acc / total) * span);
      acc += weights[i] + (i < display.length - 1 ? pauses[i] : 0);
      return {text: w, frame};
    });
  }
  const window = l.to - l.from;
  const endsAt = l.delay + nFrames;
  if (endsAt > window) {
    console.warn(`WARN ${l.id}: voice ends ${endsAt - window} frames after its window (${(nFrames / FPS).toFixed(2)}s audio)`);
    problems++;
  }
  result[l.id] = {durationFrames: nFrames, voicedFrom: first, voicedTo: last, source, words, mouth};
  console.log(`${l.id.padEnd(15)} ${(nFrames / FPS).toFixed(2)}s  words: ${source}`);
}
writeFileSync(join(root, outFile), JSON.stringify(result));
console.log(problems ? `\n${problems} issue(s) above` : '\nall voice lines fit their windows');

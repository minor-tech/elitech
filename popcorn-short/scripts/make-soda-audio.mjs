// Creates the synthesised SFX for the soda short under public/assets/audio/soda/sfx/.
// Existing files are never overwritten (pass --force to regenerate), so your real
// voiceovers / Pixabay SFX / Uppbeat BGM dropped in at the same paths are safe.
//   voiceover/*.mp3  -> espeak-ng robot voices (timing stand-ins; replace with edge-tts)
//   sfx/*.mp3        -> synthesised
//   bgm/lofi_bgm.mp3 -> synthesised 80 BPM lo-fi loop, 30s
import {execFileSync, spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const force = process.argv.includes('--force');
const SR = 44100;

// ---- ffmpeg: system one, else the one bundled with Remotion -------------
const ffmpeg = (args) => {
  const sys = spawnSync('ffmpeg', ['-version']);
  if (sys.status === 0) return execFileSync('ffmpeg', args, {stdio: 'pipe'});
  return execFileSync('npx', ['remotion', 'ffmpeg', ...args], {stdio: 'pipe', cwd: root, shell: process.platform === 'win32'});
};

const want = (rel) => {
  const p = join(pub, rel);
  mkdirSync(dirname(p), {recursive: true});
  if (existsSync(p) && !force) {
    console.log(`keep   ${rel}`);
    return null;
  }
  return p;
};

let seed = 777;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

const wavBuffer = (samples) => {
  const peak = samples.reduce((m, v) => Math.max(m, Math.abs(v)), 0) || 1;
  const norm = 0.89 / peak;
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + samples.length * 2, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((v, i) => buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v * norm)) * 32767), 44 + i * 2));
  return buf;
};
const toMp3 = (wavPath, out) => {
  ffmpeg(['-y', '-loglevel', 'error', '-i', wavPath, '-codec:a', 'libmp3lame', '-q:a', '3', out]);
  unlinkSync(wavPath);
};
const save = (rel, samples) => {
  const out = want(rel);
  if (!out) return;
  const tmp = join(tmpdir(), `v2-${Date.now()}-${Math.random().toString(36).slice(2)}.wav`);
  writeFileSync(tmp, wavBuffer(samples));
  toMp3(tmp, out);
  console.log(`made   ${rel}  ${(samples.length / SR).toFixed(2)}s (stand-in)`);
};

// ---- tiny synth kit --------------------------------------------------------
const buf = (dur) => new Float32Array(Math.floor(SR * dur));
const add = (b, at, s, g = 1) => {
  const o = Math.floor(at * SR);
  for (let i = 0; i < s.length && o + i < b.length; i++) b[o + i] += s[i] * g;
};
const gen = (dur, fn) => {
  const s = buf(dur);
  for (let i = 0; i < s.length; i++) s[i] = fn(i / SR, i);
  return s;
};
const fadeTail = (s, ms = 10) => {
  const n = Math.floor((SR * ms) / 1000);
  for (let i = 0; i < n; i++) s[s.length - 1 - i] *= i / n;
  return s;
};
const hp = () => {
  let p = 0;
  return (x) => {
    const y = x - p;
    p = x;
    return y;
  };
};
const lp = (fc) => {
  let y = 0;
  const a = 1 - Math.exp((-2 * Math.PI * fc) / SR);
  return (x) => (y += a * (x - y));
};
const reson = (fc, q) => {
  let y1 = 0, y2 = 0;
  const w = (2 * Math.PI * fc) / SR;
  const r = 1 - w / (2 * q);
  return (x) => {
    const y = x * (1 - r) + 2 * r * Math.cos(w) * y1 - r * r * y2;
    y2 = y1;
    y1 = y;
    return y;
  };
};
const midi = (m) => 440 * 2 ** ((m - 69) / 12);



const P = (n) => `assets/audio/soda/sfx/${n}.mp3`;
{ // hiss: can opening PSSHHT
  const h = hp(), l = lp(9000);
  save(P('hiss'), fadeTail(gen(0.75, (t) => l(h(rnd())) * 3 * (t < 0.02 ? t / 0.02 : Math.exp(-(t - 0.02) * 3.2))), 40));
}
{ // fizz: dense tiny bubble pops
  const s = buf(1.6);
  for (let k = 0; k < 220; k++) {
    const at = Math.abs(rnd()) * 1.5, f0 = 2500 + Math.abs(rnd()) * 6000;
    add(s, at, gen(0.012, (t) => Math.sin(2 * Math.PI * f0 * t) * Math.exp(-t * 400)), 0.25 * (1 - at / 1.7));
  }
  save(P('fizz'), fadeTail(s, 60));
}
{ // burp: low voiced croak with wobble
  let ph = 0; const f1 = reson(500, 3), f2 = reson(1100, 4);
  save(P('burp'), fadeTail(gen(0.55, (t) => {
    const f0 = 95 + 25 * Math.sin(2 * Math.PI * 7 * t) - 30 * t;
    ph += f0 / SR;
    const pulse = (ph % 1) < 0.12 ? 1 : 0;
    const e = Math.min(1, t * 25) * (t < 0.4 ? 1 : Math.exp(-(t - 0.4) * 14));
    return (f1(pulse) * 4 + f2(pulse) * 2 + rnd() * 0.15) * e;
  }), 30));
}
{ // sip: slurp (noise through a falling band)
  let y1 = 0, y2 = 0;
  save(P('sip'), fadeTail(gen(0.45, (t) => {
    const fc = 2600 - 2200 * (t / 0.45), w = (2 * Math.PI * fc) / SR, r = 1 - w / 6;
    const y = rnd() * (1 - r) * 3 + 2 * r * Math.cos(w) * y1 - r * r * y2; y2 = y1; y1 = y;
    return y * Math.sin(Math.PI * t / 0.45) * (0.7 + 0.3 * Math.sin(2 * Math.PI * 18 * t));
  }), 20));
}
{ // splash: burst + droplets
  const s = buf(0.9); const l = lp(3500);
  add(s, 0, gen(0.4, (t) => l(rnd()) * Math.exp(-t * 9)), 1.2);
  for (let k = 0; k < 14; k++) {
    const at = 0.05 + Math.abs(rnd()) * 0.6, f0 = 700 + Math.abs(rnd()) * 1500;
    add(s, at, gen(0.08, (t) => Math.sin(2 * Math.PI * (f0 + 900 * t / 0.08) * t) * Math.exp(-t * 50)), 0.3);
  }
  save(P('splash'), fadeTail(s, 40));
}
{ // whistle: lifeguard double toot (with a rattle)
  const s = buf(0.75);
  [[0, 0.22], [0.3, 0.38]].forEach(([at, d]) => {
    let ph = 0;
    add(s, at, fadeTail(gen(d, (t) => {
      ph += (2 * Math.PI * 2800 * (1 + 0.02 * Math.sin(2 * Math.PI * 30 * t))) / SR;
      return Math.sin(ph) * Math.min(1, t * 80) * Math.min(1, (d - t) * 40);
    }), 10), 0.6);
  });
  save(P('whistle'), fadeTail(s));
}

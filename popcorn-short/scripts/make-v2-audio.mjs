// Creates STAND-IN audio for EnamelShortV2 under public/assets/audio/.
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
  return execFileSync('npx', ['remotion', 'ffmpeg', ...args], {stdio: 'pipe', cwd: root});
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

// ---- SFX ---------------------------------------------------------------------
save('assets/audio/sfx/pop.mp3', fadeTail(gen(0.14, (t) => Math.sin(2 * Math.PI * (260 * t + (900 / 45) * (1 - Math.exp(-t * 45)))) * Math.exp(-t * 32) + (t < 0.004 ? rnd() * 0.5 : 0))));

// "hmm?" - nasal hum, pitch dips then rises (skeptical)
{
  const f1 = reson(260, 4), f2 = reson(2300, 8);
  let ph = 0;
  save('assets/audio/sfx/skeptical_grunt.mp3', fadeTail(gen(0.7, (t) => {
    const f0 = t < 0.35 ? 200 - t * 40 : 186 + (t - 0.35) * 260;
    ph += f0 / SR;
    const pulse = (ph % 1) < 0.08 ? 1 : 0; // glottal pulse train
    const e = Math.min(1, t * 15) * Math.min(1, (0.7 - t) * 8);
    return (f1(pulse) * 3 + f2(pulse) * 0.6) * e;
  }), 30));
}

// ICE CRACK - sharp brittle snap + glassy ring
{
  const s = buf(0.45);
  [0, 0.004, 0.009, 0.017].forEach((at, k) => {
    const h = hp();
    add(s, at, gen(0.03, (t) => h(rnd()) * Math.exp(-t * 260)), 1 - k * 0.15);
  });
  add(s, 0, gen(0.45, (t) => [3100, 4470, 6230, 7900].reduce((a, f, k) => a + Math.sin(2 * Math.PI * f * t) * Math.exp(-t * (14 + 6 * k)), 0) * 0.18));
  save('assets/audio/sfx/ice_crack.mp3', fadeTail(s));
}

// NUT CRUNCH - irregular crunchy bursts + woody knock
{
  const s = buf(0.5);
  let at = 0;
  for (let k = 0; k < 9; k++) {
    const b = reson(900 + Math.abs(rnd()) * 2400, 2);
    const g = 1 - k * 0.09;
    add(s, at, gen(0.05, (t) => b(rnd()) * Math.exp(-t * 90)), g * 3);
    at += 0.025 + Math.abs(rnd()) * 0.03;
  }
  add(s, 0, gen(0.25, (t) => Math.sin(2 * Math.PI * (110 * t + 3 * (1 - Math.exp(-t * 40)))) * Math.exp(-t * 25)), 0.6);
  save('assets/audio/sfx/nut_crunch.mp3', fadeTail(s));
}

// GLASS SHATTER - crack, then a spray of tinkling shards
{
  const s = buf(1.1);
  const h = hp();
  add(s, 0, gen(0.06, (t) => h(rnd()) * Math.exp(-t * 120)), 1.2);
  for (let k = 0; k < 26; k++) {
    const at = 0.02 + Math.abs(rnd()) ** 1.6 * 0.7;
    const f = 2500 + Math.abs(rnd()) * 6000;
    const d = 18 + Math.abs(rnd()) * 30;
    add(s, at, gen(0.3, (t) => (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * f * 1.47 * t)) * Math.exp(-t * d)), 0.22 * (1 - at));
  }
  save('assets/audio/sfx/glass_shatter.mp3', fadeTail(s, 40));
}

// GASP - quick breathy inhale
{
  const f1 = reson(1100, 5), f2 = reson(2600, 6);
  save('assets/audio/sfx/gasp.mp3', fadeTail(gen(0.4, (t) => {
    const x = rnd();
    const e = Math.min(1, t / 0.05) ** 2 * (t < 0.28 ? 1 : Math.exp(-(t - 0.28) * 30));
    return (f1(x) + 0.6 * f2(x)) * e;
  })));
}

// SAD TROMBONE (short, ~1.1s): "wah-waaah"
{
  const s = buf(1.15);
  const note = (f0, at, dur, vib) => {
    let ph = 0;
    add(s, at, fadeTail(gen(dur, (t) => {
      const v = vib && t > 0.2 ? Math.sin(2 * Math.PI * 6 * t) * 0.03 : 0;
      ph += (2 * Math.PI * f0 * (1 + v) * (1 - 0.03 * (t / dur))) / SR;
      const bright = Math.sin(Math.PI * Math.min(1, t / Math.min(dur, 0.5))) * 0.8 + 0.2;
      let y = 0;
      for (let h = 1; h <= 9; h++) y += (Math.sin(h * ph) / h) * bright ** (h * 0.6);
      return y * Math.min(1, t * 40) * Math.min(1, (dur - t) * 6);
    }), 20));
  };
  note(midi(58), 0, 0.33, false); // Bb3
  note(midi(55), 0.34, 0.8, true); // G3
  save('assets/audio/sfx/sad_trombone.mp3', fadeTail(s, 40));
}

// ---- BGM: 80 BPM lo-fi, 30s (10 bars of 4/4) --------------------------------
{
  const BPM = 80;
  const beat = 60 / BPM;
  const s = buf(30);
  const ep = (f, dur) => {
    const l = lp(1800);
    return fadeTail(gen(dur, (t) => l((Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 3)) * (1 + 0.15 * Math.sin(2 * Math.PI * 4.5 * t)) * Math.min(1, t * 60) * Math.exp(-t * 0.9))), 60);
  };
  const kick = () => gen(0.3, (t) => Math.sin(2 * Math.PI * (48 * t + 2.2 * (1 - Math.exp(-t * 30)))) * Math.exp(-t * 11));
  const snare = () => {
    const l = lp(3500);
    return gen(0.25, (t) => (l(rnd()) * 0.8 + Math.sin(2 * Math.PI * 190 * t) * 0.3) * Math.exp(-t * 18));
  };
  const hat = () => {
    const h = hp();
    return gen(0.05, (t) => h(rnd()) * Math.exp(-t * 80) * 0.5);
  };
  // Dm9 - G13 - Cmaj9 - Am9 (ii-V-I-vi), voiced around middle C
  const chords = [
    [50, 53, 57, 60, 64],
    [43, 53, 59, 64, 65],
    [48, 52, 55, 59, 62],
    [45, 52, 55, 59, 60],
  ];
  for (let bar = 0; bar < 10; bar++) {
    const t0 = bar * 4 * beat;
    const ch = chords[bar % 4];
    add(s, t0, ep(midi(ch[0] - 12), 4 * beat), 0.5); // bass
    ch.slice(1).forEach((n, i) => add(s, t0 + i * 0.012, ep(midi(n), 4 * beat), 0.16)); // lazy strum
    add(s, t0 + 2.5 * beat, ep(midi(ch[3] + 12), 1.2), 0.05); // little sparkle
    // drums (laid back): kick 1, 2.75 ; snare 2, 4 ; swung hats
    if (bar > 0) {
      add(s, t0, kick(), 0.9);
      add(s, t0 + 1.75 * beat, kick(), 0.6);
      add(s, t0 + 1 * beat + 0.02, snare(), 0.35);
      add(s, t0 + 3 * beat + 0.02, snare(), 0.35);
      for (let e = 0; e < 8; e++) add(s, t0 + e * 0.5 * beat + (e % 2 ? 0.09 : 0), hat(), e % 2 ? 0.25 : 0.4);
    }
  }
  // vinyl crackle
  for (let i = 0; i < 260; i++) add(s, Math.abs(rnd()) * 29.9, gen(0.003, () => rnd()), 0.08 + Math.abs(rnd()) * 0.08);
  const end = Math.floor(SR * 1.5);
  for (let i = 0; i < end; i++) s[s.length - 1 - i] *= i / end;
  save('assets/audio/bgm/lofi_bgm.mp3', s);
}

// ---- Voice stand-ins (espeak-ng) ------------------------------------------
const lines = [...readFileSync(join(root, 'src/audio/dialogueData.ts'), 'utf8').matchAll(/id: '(\w+)', character: '(\w+)', text: (?:"([^"]*)"|'([^']*)')/g)].map((m) => ({
  id: m[1],
  character: m[2],
  text: m[3] ?? m[4],
}));
const espeak = spawnSync('espeak-ng', ['--version']).status === 0;
for (const l of lines) {
  const rel = `assets/audio/voiceover/${l.id}.mp3`;
  const out = want(rel);
  if (!out) continue;
  if (!espeak) {
    console.warn(`MISSING ${rel}: install espeak-ng for stand-ins, or run "npm run voices" (edge-tts)`);
    continue;
  }
  const tmp = join(tmpdir(), `${l.id}.wav`);
  const args = l.character === 'hero' ? ['-v', 'en-us+m3', '-s', '150', '-p', '28'] : ['-v', 'en-us+f4', '-s', '175', '-p', '72'];
  execFileSync('espeak-ng', [...args, '-w', tmp, l.text.replace(/\.\.\./g, ', ')]);
  toMp3(tmp, out);
  console.log(`made   ${rel}  (espeak stand-in)`);
}

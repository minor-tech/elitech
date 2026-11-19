// Creates the synthesised SFX + music for "The Gap" under public/assets/audio/gap/.
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


const P = (n) => `assets/audio/gap/sfx/${n}.mp3`;
// ---- SFX ---------------------------------------------------------------------
save(P('pop'), fadeTail(gen(0.14, (t) => Math.sin(2 * Math.PI * (260 * t + (900 / 45) * (1 - Math.exp(-t * 45)))) * Math.exp(-t * 32) + (t < 0.004 ? rnd() * 0.5 : 0))));
save(P('thump'), fadeTail(gen(0.25, (t) => Math.sin(2 * Math.PI * (55 * t + 3.5 * (1 - Math.exp(-t * 30)))) * Math.exp(-t * 14))));
{ // heartbeat: lub-dub
  const s = buf(0.42);
  const beat = gen(0.16, (t) => Math.sin(2 * Math.PI * (48 * t + 2.5 * (1 - Math.exp(-t * 35)))) * Math.exp(-t * 22));
  add(s, 0, beat, 1); add(s, 0.17, beat, 0.7);
  save(P('heartbeat'), fadeTail(s));
}
{ // alarm: two-tone square beeps
  const s = buf(1.3);
  for (let k = 0; k < 4; k++) {
    const f0 = k % 2 ? 660 : 880;
    add(s, k * 0.3, fadeTail(gen(0.24, (t) => (Math.sin(2 * Math.PI * f0 * t) > 0 ? 0.5 : -0.5) * Math.min(1, t * 200)), 8), 1);
  }
  save(P('alarm'), fadeTail(s));
}
{ // exhale: long breathy deflate
  const f1 = reson(700, 2);
  save(P('exhale'), fadeTail(gen(0.8, (t) => f1(rnd()) * Math.min(1, t * 30) * Math.exp(-t * 2.5)), 40));
}
{ // whoosh
  const s = buf(0.5); let y1 = 0, y2 = 0;
  for (let i = 0; i < s.length; i++) {
    const t = i / SR, x = t / 0.5, fc = 300 + 2400 * Math.sin(Math.PI * x) ** 2, w = (2 * Math.PI * fc) / SR, r = 1 - w / 8;
    const y = rnd() * Math.sin(Math.PI * x) ** 1.5 * (1 - r) * 3 + 2 * r * Math.cos(w) * y1 - r * r * y2; y2 = y1; y1 = y; s[i] = y;
  }
  save(P('whoosh'), fadeTail(s));
}
{ // creak: slow stick-slip friction
  const s = buf(0.7);
  let t = 0;
  while (t < 0.62) {
    const b = reson(320 + Math.abs(rnd()) * 260, 6);
    add(s, t, gen(0.03, (u) => b(rnd()) * Math.exp(-u * 120)), 2.5);
    t += 0.018 + Math.abs(rnd()) * 0.012;
  }
  save(P('creak'), fadeTail(s, 30));
}
{ // sad violin: short descending phrase with vibrato
  const s = buf(1.6);
  [[659, 0, 0.45], [587, 0.45, 0.45], [523, 0.9, 0.7]].forEach(([f0, at, d]) => {
    let ph = 0;
    add(s, at, fadeTail(gen(d, (t) => {
      ph += (2 * Math.PI * f0 * (1 + 0.012 * Math.sin(2 * Math.PI * 6 * t))) / SR;
      let v = 0; for (let h = 1; h < 8; h++) v += Math.sin(h * ph) / h;
      return v * Math.min(1, t * 12) * Math.min(1, (d - t) * 8);
    }), 20), 0.5);
  });
  save(P('violin'), fadeTail(s, 40));
}
{ // tok: little hammer tap
  const b = reson(1800, 8);
  save(P('tok'), fadeTail(gen(0.12, (t) => b(t < 0.004 ? rnd() : 0) * 6 + Math.sin(2 * Math.PI * 900 * t) * Math.exp(-t * 60) * 0.5)));
}
save(P('ding'), fadeTail(gen(1.2, (t) => [1, 2.0, 2.76, 5.4].reduce((a, r, k) => a + Math.sin(2 * Math.PI * 1046.5 * r * t) * Math.exp(-t * 2.4 * (1 + k)) / (1 + k), 0) * Math.min(1, t * 2000)), 20));
{ // boing
  let ph = 0;
  save(P('boing'), fadeTail(gen(0.6, (t) => {
    ph += (2 * Math.PI * (150 + 90 * Math.exp(-t * 3) + 70 * Math.sin(2 * Math.PI * 14 * t) * Math.exp(-t * 4))) / SR;
    return (Math.sin(ph) + 0.25 * Math.sin(3 * ph)) * Math.min(1, t * 200) * Math.exp(-t * 5);
  })));
}
{ // tick-tock: 4 seconds of game-show clock
  const s = buf(4.1);
  for (let k = 0; k < 8; k++) {
    const b = reson(k % 2 ? 1300 : 1900, 10);
    add(s, k * 0.5, gen(0.06, (t) => b(t < 0.003 ? rnd() : 0) * 8 * Math.exp(-t * 40)), 1);
  }
  save(P('ticktock'), fadeTail(s));
}
{ // calendar page flips
  const s = buf(0.7);
  for (let k = 0; k < 4; k++) {
    const l = lp(4000);
    add(s, k * 0.14, gen(0.09, (t) => l(rnd()) * Math.sin(Math.PI * t / 0.09)), 1);
  }
  save(P('flip'), fadeTail(s));
}
{ // deflate: falling squeaky pitch + air
  let ph = 0; const l = lp(1500);
  save(P('deflate'), fadeTail(gen(1.0, (t) => {
    ph += (2 * Math.PI * (420 - 300 * t)) / SR;
    return (Math.sin(ph) * 0.4 + l(rnd()) * 0.8) * Math.min(1, t * 40) * (1 - t);
  }), 40));
}
{ // sting: ta-DAH
  const s = buf(1.4);
  const brass = (f0, at, dur) => {
    let ph = 0;
    add(s, at, fadeTail(gen(dur, (t) => {
      ph += (2 * Math.PI * f0) / SR;
      let v = 0; for (let h = 1; h <= 9; h++) v += Math.sin(h * ph) / h * (Math.min(1, t * 12) * 0.8 + 0.2) ** (h * 0.5);
      return v * Math.min(1, t * 30) * Math.min(1, (dur - t) * 6);
    }), 20), 0.35);
  };
  [196, 247, 294].forEach((f) => brass(f, 0, 0.16));
  [262, 330, 392, 523].forEach((f) => brass(f, 0.2, 1.1));
  save(P('sting'), fadeTail(s, 40));
}

// ---- BGM: quirky "sneaky cartoon" loop, 120 BPM, 45 s -------------------------
{
  const s = buf(45);
  const E8 = 0.25;
  const NOTE = (n) => {
    const m = /^([A-G])(b|#)?(-?\d)$/.exec(n);
    const base = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11}[m[1]] + (m[2] === 'b' ? -1 : m[2] === '#' ? 1 : 0);
    return midi(12 * (Number(m[3]) + 1) + base);
  };
  const pluck = (freq, dur) => {
    const n = Math.floor(SR * dur), L = Math.max(2, Math.round(SR / freq));
    const ring = new Float32Array(L).map(() => rnd()); const out = new Float32Array(n); let idx = 0;
    for (let i = 0; i < n; i++) { const a = ring[idx], b = ring[(idx + 1) % L]; ring[idx] = 0.985 * (0.3 * a + 0.7 * 0.5 * (a + b)); out[i] = a; idx = (idx + 1) % L; }
    return fadeTail(out, 15);
  };
  const marimba = (f0, dur = 0.45) => fadeTail(gen(dur, (t) => (Math.sin(2 * Math.PI * f0 * t) + 0.35 * Math.sin(2 * Math.PI * f0 * 4 * t) * Math.exp(-t * 30)) * Math.min(1, t * 400) * Math.exp(-t * 7)));
  const hat = () => { const h = hp(); return gen(0.05, (t) => h(rnd()) * Math.exp(-t * 90) * 0.5); };
  const seq = (t0, notes, fn, g) => notes.forEach((n, i) => n && add(s, t0 + i * E8, fn(NOTE(n)), g));
  const B1 = ['C3', null, 'G2', null, 'C3', null, 'G2', 'Ab2'];
  const B2 = ['F2', null, 'C3', null, 'G2', null, 'D3', 'B2'];
  const M1 = ['G4', null, 'Ab4', 'G4', null, 'Eb4', null, null];
  const M2 = ['F4', null, 'G4', 'F4', null, 'D4', null, 'B3'];
  const M4 = ['C5', 'B4', 'Bb4', 'A4', 'Ab4', 'G4', null, null];
  const MB = ['C5', null, 'Eb5', null, 'G5', 'F5', 'Eb5', 'D5'];
  const mel = [null, M1, M2, M1, M4, MB, M2, M1, M4, M2];
  for (let bar = 0; bar < 22; bar++) {
    const t0 = bar * 2;
    seq(t0, bar % 2 ? B2 : B1, (f) => pluck(f, 0.4), 0.9);
    const m = mel[bar % mel.length];
    if (m) seq(t0, m, (f) => marimba(f), 0.32);
    for (let i = 0; i < 8; i++) add(s, t0 + i * E8 + (i % 2 ? 0.02 : 0), hat(), i % 2 ? 0.32 : 0.16);
  }
  const end = Math.floor(SR * 2);
  for (let i = 0; i < end; i++) s[s.length - 1 - i] *= i / end;
  save('assets/audio/gap/bgm/quirky_bgm.mp3', s);
}

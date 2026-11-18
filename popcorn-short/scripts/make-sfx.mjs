// Synthesises the comedic SFX as 16-bit mono WAVs into public/sfx/.
// No samples or downloads: pure math, so the project is self-contained.
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sfx');
mkdirSync(out, {recursive: true});

let seed = 1234;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

const writeWav = (name, samples) => {
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
  writeFileSync(join(out, `${name}.wav`), buf);
  console.log(`sfx/${name}.wav  ${(samples.length / SR).toFixed(2)}s`);
};

// Fade the last few ms to avoid clicks
const tail = (s, ms = 8) => {
  const n = Math.floor((SR * ms) / 1000);
  for (let i = 0; i < n; i++) s[s.length - 1 - i] *= i / n;
  return s;
};

const synth = (dur, fn) => {
  const n = Math.floor(SR * dur);
  const s = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const r = fn(t, phase);
    phase += (2 * Math.PI * r.freq) / SR;
    s[i] = r.value(phase);
  }
  return tail(s);
};

// POP: fast downward pitch blip + tiny click
writeWav(
  'pop',
  synth(0.14, (t) => ({
    freq: 260 + 900 * Math.exp(-t * 45),
    value: (p) => Math.sin(p) * Math.exp(-t * 32) + (t < 0.004 ? rnd() * 0.6 : 0),
  })),
);

// THUMP: low pop for the throbbing pulse
writeWav(
  'thump',
  synth(0.22, (t) => ({
    freq: 55 + 160 * Math.exp(-t * 30),
    value: (p) => (Math.sin(p) + 0.3 * Math.sin(2 * p)) * Math.exp(-t * 16),
  })),
);

// BOING: springy wobbling pitch
writeWav(
  'boing',
  synth(0.7, (t) => ({
    freq: 140 + 90 * Math.exp(-t * 3) + 70 * Math.sin(2 * Math.PI * 14 * t) * Math.exp(-t * 4),
    value: (p) => (Math.sin(p) + 0.25 * Math.sin(3 * p)) * Math.min(1, t * 200) * Math.exp(-t * 4.5),
  })),
);

// WHOOSH: noise through a resonant band-pass that sweeps up then down
{
  const dur = 0.5;
  const n = Math.floor(SR * dur);
  const s = new Float32Array(n);
  let y1 = 0;
  let y2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const x = t / dur;
    const fc = 300 + 2400 * Math.sin(Math.PI * x) ** 2;
    const q = 4;
    const w = (2 * Math.PI * fc) / SR;
    const r = 1 - w / (2 * q);
    const env = Math.sin(Math.PI * x) ** 1.5;
    const y = rnd() * env * (1 - r) * 3 + 2 * r * Math.cos(w) * y1 - r * r * y2;
    y2 = y1;
    y1 = y;
    s[i] = y;
  }
  writeWav('whoosh', tail(s));
}

// SAD TROMBONE: "wah wah wah waaah" (Bb3 A3 Ab3 G3) with a wah filter + vibrato
{
  const notes = [
    [233.08, 0.42],
    [220.0, 0.42],
    [207.65, 0.42],
    [196.0, 1.35],
  ];
  const total = notes.reduce((a, [, d]) => a + d, 0) + 0.1;
  const s = new Float32Array(Math.floor(SR * total));
  let pos = 0;
  notes.forEach(([f0, d], idx) => {
    const n = Math.floor(SR * d);
    let ph = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const last = idx === notes.length - 1;
      const vib = last && t > 0.25 ? Math.sin(2 * Math.PI * 6 * t) * 0.025 * Math.min(1, (t - 0.25) * 3) : 0;
      const bend = last ? 1 - 0.04 * Math.min(1, t / d) : 1 - 0.02 * (t / d);
      const f = f0 * (1 + vib) * bend;
      ph += (2 * Math.PI * f) / SR;
      // "wah": brightness opens then closes within each note
      const bright = Math.sin(Math.PI * Math.min(1, t / (last ? 0.6 : d))) * 0.85 + 0.15;
      let v = 0;
      for (let h = 1; h <= 10; h++) v += (Math.sin(h * ph) / h) * Math.pow(bright, h * 0.6);
      const env = Math.min(1, t * 40) * Math.min(1, (d - t) * (last ? 3 : 25));
      s[pos + i] += v * env * 0.5;
    }
    pos += n;
  });
  writeWav('trombone', tail(s, 30));
}

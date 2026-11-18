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

// =====================================================================
// Video #2 ("Enamel") sounds + music. 120 BPM so every 6s scene = 12 beats.
// =====================================================================
const mix = (dur) => new Float32Array(Math.floor(SR * dur));
const add = (buf, at, s, gain = 1) => {
  const o = Math.floor(at * SR);
  for (let i = 0; i < s.length && o + i < buf.length; i++) buf[o + i] += s[i] * gain;
};
const midi = (m) => 440 * 2 ** ((m - 69) / 12);
const NOTE = (n) => {
  const m = /^([A-G])(b|#)?(-?\d)$/.exec(n);
  const base = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11}[m[1]] + (m[2] === 'b' ? -1 : m[2] === '#' ? 1 : 0);
  return midi(12 * (Number(m[3]) + 1) + base);
};
const env = (n, fn) => {
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) s[i] = fn(i / SR, i);
  return s;
};
// Karplus-Strong pluck: pizzicato bass
const pluck = (freq, dur, damp = 0.994, bright = 0.5) => {
  const n = Math.floor(SR * dur);
  const L = Math.max(2, Math.round(SR / freq));
  const ring = new Float32Array(L).map(() => rnd());
  const s = new Float32Array(n);
  let idx = 0;
  for (let i = 0; i < n; i++) {
    const a = ring[idx];
    const b = ring[(idx + 1) % L];
    const v = damp * (bright * a + (1 - bright) * 0.5 * (a + b));
    ring[idx] = v;
    s[i] = a;
    idx = (idx + 1) % L;
  }
  return tail(s, 15);
};
const marimba = (freq, dur = 0.5) =>
  tail(env(Math.floor(SR * dur), (t) => (Math.sin(2 * Math.PI * freq * t) + 0.35 * Math.sin(2 * Math.PI * freq * 4 * t) * Math.exp(-t * 30)) * Math.min(1, t * 400) * Math.exp(-t * 7)));
const hat = (dur = 0.05) => {
  let prev = 0;
  return env(Math.floor(SR * dur), (t) => {
    const x = rnd();
    const hp = x - prev;
    prev = x;
    return hp * Math.exp(-t * 90) * 0.5;
  });
};
const kick = () => env(Math.floor(SR * 0.25), (t) => Math.sin(2 * Math.PI * (45 * t + (90 / 25) * (1 - Math.exp(-t * 25)))) * Math.exp(-t * 14));
const clap = () => env(Math.floor(SR * 0.18), (t) => rnd() * (Math.exp(-t * 30) + (t > 0.012 ? 0.6 * Math.exp(-(t - 0.012) * 50) : 0) + (t > 0.024 ? 0.5 * Math.exp(-(t - 0.024) * 25) : 0)) * 0.6);
const bell = (f0, dur, decay = 3, gain = 1) =>
  tail(env(Math.floor(SR * dur), (t) => gain * Math.min(1, t * 2000) * [1, 2.0, 2.76, 5.4].reduce((a, r, k) => a + Math.sin(2 * Math.PI * f0 * r * t) * Math.exp(-t * decay * (1 + k)) / (1 + k), 0)), 20);

// CLINK: metallic armour shine
writeWav('clink', tail(env(Math.floor(SR * 0.6), (t) => [2400, 3720, 5130, 6890].reduce((a, f, k) => a + Math.sin(2 * Math.PI * f * t) * Math.exp(-t * (7 + k * 5)), 0) * Math.min(1, t * 3000) + (t < 0.003 ? rnd() * 0.8 : 0))));
// DING (heroic) + TING (soft text reveal)
writeWav('ding', bell(1046.5, 1.4, 2.2));
writeWav('ting', bell(1568, 0.6, 6, 0.6));
// CRACK: crisp ASMR crack = cluster of sharp clicks + a woody low knock
{
  const s = mix(0.4);
  [0, 0.006, 0.013, 0.021, 0.034, 0.05].forEach((at, k) => {
    let prev = 0;
    add(s, at, env(Math.floor(SR * 0.03), (t) => {
      const x = rnd();
      const v = x - prev; // high-passed noise = crisp
      prev = x;
      return v * Math.exp(-t * (220 - k * 20));
    }), 1 - k * 0.12);
  });
  add(s, 0, env(Math.floor(SR * 0.3), (t) => Math.sin(2 * Math.PI * (160 * t + 4 * (1 - Math.exp(-t * 40)))) * Math.exp(-t * 22) * 0.7));
  writeWav('crack', tail(s));
}
// POOF: soft low-passed puff
{
  let lp = 0;
  writeWav('poof', tail(env(Math.floor(SR * 0.45), (t) => {
    const cutoff = 2500 * Math.exp(-t * 8) + 200;
    const a = 1 - Math.exp((-2 * Math.PI * cutoff) / SR);
    lp += a * (rnd() - lp);
    return lp * Math.min(1, t * 120) * Math.exp(-t * 7);
  })));
}
// GASP: a sharp breathy inhale (formant-filtered noise)
{
  const dur = 0.42;
  const res = (fc, q) => {
    let y1 = 0, y2 = 0;
    return (x) => {
      const w = (2 * Math.PI * fc) / SR;
      const r = 1 - w / (2 * q);
      const y = x * (1 - r) + 2 * r * Math.cos(w) * y1 - r * r * y2;
      y2 = y1;
      y1 = y;
      return y;
    };
  };
  const f1 = res(1100, 5);
  const f2 = res(2600, 6);
  writeWav('gasp', tail(env(Math.floor(SR * dur), (t) => {
    const x = rnd();
    const e = Math.min(1, t / 0.06) ** 2 * (t < 0.3 ? 1 : Math.exp(-(t - 0.3) * 30));
    return (f1(x) + 0.6 * f2(x)) * e;
  })));
}
// RECORD SCRATCH: zig-zag pitch + noise, decelerating to a stop
{
  const dur = 0.55;
  let ph = 0;
  let prev = 0;
  writeWav('scratch', tail(env(Math.floor(SR * dur), (t) => {
    const speed = Math.sin(2 * Math.PI * 7 * t) * (1 - t / dur);
    const f = 180 + 900 * Math.abs(speed);
    ph += (2 * Math.PI * f) / SR;
    const saw = ((ph / (2 * Math.PI)) % 1) * 2 - 1;
    const x = rnd();
    const hp = x - prev;
    prev = x;
    return (0.5 * saw + 0.7 * hp) * Math.abs(speed) * Math.min(1, t * 300);
  })));
}
// TRIUMPHANT STING: "ta-DAH" brass chord (C major), bright swell
{
  const s = mix(1.5);
  const brass = (f0, dur, at) => {
    let ph = 0;
    add(s, at, tail(env(Math.floor(SR * dur), (t) => {
      ph += (2 * Math.PI * f0 * (1 + 0.004 * Math.sin(2 * Math.PI * 5.5 * t))) / SR;
      const bright = Math.min(1, t * 12) * 0.8 + 0.2;
      let v = 0;
      for (let h = 1; h <= 9; h++) v += (Math.sin(h * ph) / h) * bright ** (h * 0.5);
      return v * Math.min(1, t * 30) * Math.min(1, (dur - t) * 6);
    }), 20), 0.35);
  };
  ['G3', 'B3', 'D4'].forEach((n) => brass(NOTE(n), 0.16, 0));
  ['C4', 'E4', 'G4', 'C5'].forEach((n) => brass(NOTE(n), 1.25, 0.2));
  add(s, 0.2, bell(2093, 0.8, 4, 0.25));
  writeWav('sting', tail(s, 40));
}

// ---- Background music --------------------------------------------------
const E8 = 0.25; // eighth note @ 120 BPM
const seq = (buf, t0, notes, fn, gain) =>
  notes.forEach((n, i) => {
    if (n) add(buf, t0 + i * E8, fn(NOTE(n)), gain);
  });
// "Sneaky cartoon" theme in C minor (bars 1-6, 0-12s) + sad half-time tag (bars 7-9, 12-18s)
{
  const s = mix(18);
  const B1 = ['C3', null, 'G2', null, 'C3', null, 'G2', 'Ab2'];
  const B2 = ['F2', null, 'C3', null, 'G2', null, 'D3', 'B2'];
  const M1 = ['G4', null, 'Ab4', 'G4', null, 'Eb4', null, null];
  const M2 = ['F4', null, 'G4', 'F4', null, 'D4', null, 'B3'];
  const M4 = ['C5', 'B4', 'Bb4', 'A4', 'Ab4', 'G4', null, null];
  const melody = [null, M1, M2, M1, M4, M2];
  for (let bar = 0; bar < 6; bar++) {
    const t0 = bar * 2;
    seq(s, t0, bar % 2 ? B2 : B1, (f) => pluck(f, 0.4, 0.985, 0.3), 0.9);
    if (melody[bar]) seq(s, t0, melody[bar], (f) => marimba(f, 0.45), 0.35);
    for (let i = 0; i < 8; i++) add(s, t0 + i * E8 + (i % 2 ? 0.02 : 0), hat(), i % 2 ? 0.35 : 0.18);
  }
  // sad tag: sparse, slow, quiet
  const sad = [
    ['C3', 0], ['Ab2', 1], ['F2', 2], ['G2', 3], ['C3', 4],
  ];
  sad.forEach(([n, beat2]) => add(s, 12 + beat2 * 1.0, pluck(NOTE(n), 1.2, 0.997, 0.2), 0.6));
  [['Eb4', 0], ['D4', 1.5], ['C4', 3], ['B3', 4.5]].forEach(([n, at]) => add(s, 12 + at, marimba(NOTE(n), 0.9), 0.18));
  writeWav('bgm-main', s);
}
// Upbeat outro in C major (bars 13-15, 24-30s)
{
  const s = mix(6);
  const ob1 = ['C3', 'C4', 'G2', 'G3', 'C3', 'C4', 'G2', 'G3'];
  const ob2 = ['F2', 'F3', 'C3', 'C4', 'G2', 'G3', 'G2', 'B2'];
  const om1 = ['C5', 'E5', 'G5', 'E5', 'C6', null, 'G5', null];
  const om2 = ['A5', null, 'F5', 'A5', 'G5', null, 'D5', 'B4'];
  [[ob1, om1], [ob2, om2]].forEach(([b, m], bar) => {
    const t0 = bar * 2;
    seq(s, t0, b, (f) => pluck(f, 0.3, 0.985, 0.4), 0.8);
    seq(s, t0, m, (f) => marimba(f, 0.4), 0.35);
    for (let beat = 0; beat < 4; beat++) {
      add(s, t0 + beat * 0.5, kick(), 0.7);
      if (beat % 2) add(s, t0 + beat * 0.5, clap(), 0.45);
    }
    for (let i = 0; i < 8; i++) add(s, t0 + i * E8, hat(), 0.25);
  });
  // final hit
  add(s, 4, kick(), 0.8);
  add(s, 4, pluck(NOTE('C2'), 1.8, 0.997, 0.4), 0.9);
  ['C5', 'E5', 'G5', 'C6'].forEach((n) => add(s, 4, marimba(NOTE(n), 1.6), 0.22));
  add(s, 4, bell(2093, 1.6, 2.5, 0.25));
  writeWav('bgm-outro', tail(s, 200));
}

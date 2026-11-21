import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {HEIGHT, WIDTH, clamp} from '../theme';
import {dialogue} from '../audio/gap3Dialogue';
import timings from '../audio/gap3Timings.json';
import {CAPTION_FONT, X} from '../enamelv3/style';
import {B, Gap3Scene, POKES} from './Scene';

type TL = Record<string, {durationFrames: number; words: {text: string; frame: number}[]; voicedTo: number}>;
const T = timings as unknown as TL;
export const GAP3_FRAMES = B.total;

// ---------------------------------------------------------------- captions: one beat at a time, stress-weighted
const WEAK = new Set(['A', 'AN', 'OR', 'IT', 'OF', 'TO', 'ON', 'IN', 'MY', 'THE', 'AND', 'FOR', 'IS', 'I', "I'M", "IT'S", 'WE', 'WHO', 'CAN', 'JUST', 'WAS', 'NO', 'YEP.', "THAT'S", 'WHY']);
const STRESS = new Set(['CRACK', 'FORCEPS', 'FINE', 'FIIINE', 'CLOT', 'POKE', 'TOUCH', 'SMOOTH', 'STOP', "CAN'T", "WON'T", 'GAP', "GAP'S", 'MOVES', 'LEANING', 'SLIDING', 'DOWN', 'COMING', 'ALL', 'THEM', 'MELTING', 'OW', 'EARLY', 'IMPLANT', "IMPLANT'S", 'OVER', 'STAY']);
type W = {text: string; start: number; end: number; stress: boolean};
const bare = (s: string) => s.replace(/[^A-Z']/g, '');
const WORDS: W[] = dialogue.flatMap((l) => {
  const t = T[l.id];
  if (!t) return [];
  const lineEnd = Math.min(l.toFrame, l.fromFrame + t.voicedTo + 10);
  const raw = t.words.map((w, i) => ({
    text: w.text.replace(/^\.+/, '').toUpperCase(),
    start: l.fromFrame + w.frame,
    end: i < t.words.length - 1 ? l.fromFrame + t.words[i + 1].frame : lineEnd,
  }));
  const out: W[] = [];
  let carry: {text: string; start: number} | null = null;
  for (let i = 0; i < raw.length; i++) {
    const r = raw[i];
    const text: string = carry ? `${carry.text} ${r.text}` : r.text;
    const start: number = carry ? carry.start : r.start;
    carry = null;
    const endsSentence = /[.!?]$/.test(r.text);
    if ((WEAK.has(bare(r.text)) || WEAK.has(r.text)) && !endsSentence && i < raw.length - 1) {
      carry = {text, start};
      continue;
    }
    out.push({text, start, end: r.end, stress: text.split(" ").some((x: string) => STRESS.has(bare(x)))});
  }
  if (carry) out.push({...carry, end: raw[raw.length - 1].end, stress: false});
  return out;
});

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const w = WORDS.find((x) => f >= x.start && f < x.end);
  if (!w || f >= B.end) return null;
  const inBrain = (f >= B.hq1[0] && f < B.fine) || (f >= B.bonkShot && f < B.implantShot) || (f >= B.early[0] && f < B.end);
  const t = f - w.start;
  const pop = w.stress ? interpolate(t, [0, 3, 6], [1.25, 1.06, 1], clamp) : interpolate(t, [0, 2, 4], [0.85, 1.05, 1], clamp);
  const base = w.stress ? 140 : 116;
  const size = w.text.length > 9 ? Math.max(80, base - (w.text.length - 9) * 8) : base;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 40,
          right: 40,
          top: inBrain ? 1600 : 1520,
          transform: `translateY(-50%) scale(${pop}) skewX(-6deg)`,
          textAlign: 'center',
          fontFamily: CAPTION_FONT,
          fontSize: size,
          lineHeight: 1.05,
          letterSpacing: 2,
          color: w.stress ? X.gold : X.white,
          WebkitTextStroke: `16px ${X.ink}`,
          paintOrder: 'stroke fill',
          textShadow: '0 8px 0 rgba(0,0,0,0.35)',
        }}
      >
        {w.text}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- sound
const g = (n: string) => `assets/audio/gap/sfx/${n}.mp3`;
const s = (n: string) => `assets/audio/sfx/${n}.mp3`;
const CUES: {file: string; at: number; vol: number}[] = [
  {file: g('alarm'), at: 0, vol: 0.5},
  {file: g('thump'), at: B.lever + 2, vol: 0.6},
  {file: g('whoosh'), at: B.clampAt - 10, vol: 0.5},
  ...B.squeaks.map((q) => ({file: g('creak'), at: q, vol: 0.75})),
  {file: g('pop'), at: B.pop, vol: 1},
  {file: s('gasp'), at: B.pop + 3, vol: 0.6},
  {file: g('whoosh'), at: B.pop + 6, vol: 0.55},
  {file: g('flip'), at: B.pop + 16, vol: 0.5}, // FOR RENT sign
  {file: g('tok'), at: B.clot + 4, vol: 0.7}, // clot plop
  {file: g('flip'), at: B.reno, vol: 0.5},
  ...[0, 4, 8].map((d) => ({file: g('tok'), at: B.cells[0] - 6 + d * 2, vol: 0.45})),
  {file: g('thump'), at: B.dont[0], vol: 0.5},
  {file: g('flip'), at: B.weeks[0], vol: 0.6},
  {file: g('ding'), at: B.weeks[1] - 10, vol: 0.4},
  ...POKES.map((p) => ({file: g('boing'), at: p, vol: 0.55})),
  {file: g('whoosh'), at: B.quiz[0], vol: 0.5},
  ...B.countdown.map((c) => ({file: g('tick'), at: c, vol: 0.9})),
  {file: g('flip'), at: B.later[0], vol: 0.7},
  {file: g('creak'), at: B.lefty + 2, vol: 0.6},
  {file: g('creak'), at: B.righty + 2, vol: 0.7},
  {file: g('creak'), at: B.upper + 4, vol: 0.75},
  {file: g('ding'), at: B.reveal + 14, vol: 0.8},
  {file: g('deflate'), at: B.bone[0] + 4, vol: 0.7},
  {file: g('whoosh'), at: B.bonkShot + 4, vol: 0.6},
  {file: g('thump'), at: B.bonk, vol: 1},
  {file: g('boing'), at: B.bonk + 1, vol: 0.7},
  {file: g('pop'), at: B.implant, vol: 0.8},
  {file: g('ding'), at: B.implant + 8, vol: 0.6},
  ...[10, 20, 30].map((d) => ({file: g('ding'), at: B.early[0] + d, vol: 0.4})),
  {file: g('sting'), at: B.end, vol: 0.85},
];

/** "The Gap" v3: the full upgrade (cold open, POP, running sign gag, live quiz, bonk, implant, slam end card). */
export const GapShortV3: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: X.bgDark}}>
    <AbsoluteFill>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Gap3Scene />
      </svg>
    </AbsoluteFill>
    <Sequence name="BGM" layout="none">
      <Html5Audio src={staticFile('assets/audio/gap/bgm/quirky_bgm.mp3')} volume={0.22} />
    </Sequence>
    {dialogue.map((l) => (
      <Sequence key={l.id} name={`VO ${l.id}`} from={l.fromFrame} durationInFrames={Math.max(1, (T[l.id]?.durationFrames ?? 1) + 2)} layout="none">
        <Html5Audio src={staticFile(l.voiceFile)} />
      </Sequence>
    ))}
    {CUES.map((c, i) => (
      <Sequence key={i} name={`SFX ${c.file.split('/').pop()}`} from={Math.max(0, c.at)} layout="none">
        <Html5Audio src={staticFile(c.file)} volume={c.vol} />
      </Sequence>
    ))}
    <Captions />
  </AbsoluteFill>
);

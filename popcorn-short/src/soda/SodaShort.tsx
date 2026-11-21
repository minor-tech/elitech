import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, staticFile} from 'remotion';
import {HEIGHT, WIDTH} from '../theme';
import {dialogue} from '../audio/sodaDialogue';
import timings from '../audio/sodaTimings.json';
import {WordCaptions} from '../enamelv3/WordCaptions';
import {X} from '../enamelv3/style';
import {BEAT, SodaScene} from './Scene';

type TL = Record<string, {durationFrames: number; words: {text: string; frame: number}[]; voicedTo: number}>;
const T = timings as unknown as TL;
export const SODA_FRAMES = BEAT.total;

// One caption at a time, but never a lone weak word ("A", "OR", "IT"): it rides with its neighbour.
const WEAK = new Set(['A', 'AN', 'OR', 'IT', 'OF', 'TO', 'ON', 'IN', 'MY', 'THE', 'AND', 'FOR', 'IS', 'I', "I'LL", "IT'S"]);
const WORDS = dialogue.flatMap((l) => {
  const t = T[l.id];
  if (!t) return [];
  const lineEnd = Math.min(l.toFrame, l.fromFrame + t.voicedTo + 10);
  const raw = t.words.map((w, i) => ({
    text: w.text.replace(/^\.+/, '').toUpperCase(),
    start: l.fromFrame + w.frame,
    end: i < t.words.length - 1 ? l.fromFrame + t.words[i + 1].frame : lineEnd,
  }));
  // a weak word rides forward until it reaches a real word ("A" + "OR" + "B!" -> "A OR B!")
  const out: typeof raw = [];
  let carry: (typeof raw)[number] | null = null;
  for (let i = 0; i < raw.length; i++) {
    const w: (typeof raw)[number] = carry ? {text: `${carry.text} ${raw[i].text}`, start: carry.start, end: raw[i].end} : raw[i];
    carry = null;
    const last = raw[i].text.replace(/[^A-Z']/g, '');
    const endsSentence = /[.!?]$/.test(raw[i].text); // never carry a weak word across the end of a sentence
    if (WEAK.has(last) && !endsSentence && i < raw.length - 1) {
      carry = w;
      continue;
    }
    out.push(w);
  }
  if (carry) out.push(carry);
  return out;
});

const sfx = (n: string) => `assets/audio/soda/sfx/${n}.mp3`;
const gap = (n: string) => `assets/audio/gap/sfx/${n}.mp3`;
const CUES: {file: string; at: number; vol: number}[] = [
  {file: sfx('hiss'), at: BEAT.tab, vol: 0.9},
  {file: sfx('fizz'), at: BEAT.spray, vol: 0.6},
  {file: gap('whoosh'), at: BEAT.waveIn[0], vol: 0.6},
  {file: sfx('fizz'), at: BEAT.waveIn[0] + 6, vol: 0.45},
  {file: gap('alarm'), at: BEAT.brain1[0], vol: 0.5},
  {file: gap('boing'), at: BEAT.bugsIn + 10, vol: 0.45},
  {file: sfx('burp'), at: BEAT.burp1, vol: 0.85},
  {file: sfx('burp'), at: BEAT.burp2, vol: 0.85},
  {file: gap('whoosh'), at: BEAT.quiz[0] + 6, vol: 0.45},
  ...BEAT.countdown.map((c) => ({file: gap('tick'), at: c, vol: 0.9})),
  {file: gap('flip'), at: BEAT.card[0], vol: 0.6},
  ...BEAT.sips.map((s) => ({file: sfx('sip'), at: s, vol: 0.8})),
  {file: sfx('whistle'), at: BEAT.salivaIn + 4, vol: 0.6},
  {file: sfx('splash'), at: BEAT.sipHit, vol: 0.8},
  {file: sfx('sip'), at: BEAT.sipHit - 8, vol: 0.7},
  {file: gap('alarm'), at: BEAT.brain4[0], vol: 0.4},
  {file: gap('deflate'), at: BEAT.molar3[0] + 4, vol: 0.5},
  {file: gap('ding'), at: BEAT.brain5[1] - 10, vol: 0.5},
  {file: sfx('splash'), at: BEAT.water, vol: 0.9},
  {file: sfx('burp'), at: BEAT.smallBurp, vol: 0.35},
  {file: gap('sting'), at: BEAT.endCard, vol: 0.8},
  {file: gap('ding'), at: BEAT.reaction + 2, vol: 0.6},
];

/** "Your Teeth When You Sip Soda All Day" (about 40 s). */
export const SodaShort: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: X.bgDark}}>
    <AbsoluteFill>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <SodaScene />
      </svg>
    </AbsoluteFill>
    <Sequence name="BGM" from={BEAT.inside} layout="none">
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
    <WordCaptions y={1500} words={WORDS} />
  </AbsoluteFill>
);

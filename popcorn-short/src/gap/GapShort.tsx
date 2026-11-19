import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, staticFile} from 'remotion';
import {HEIGHT, WIDTH} from '../theme';
import {gapDialogue} from '../audio/gapDialogue';
import timings from '../audio/gapTimings.json';
import {WordCaptions, buildWords} from '../enamelv3/WordCaptions';
import {X} from '../enamelv3/style';
import {BEAT, GapScene, POKES} from './Scene';

export const GAP_FRAMES = BEAT.total;
const T = timings as Record<string, {durationFrames: number; words: {text: string; frame: number}[]; voicedTo: number}>;
const WORDS = buildWords(gapDialogue, T);
const MUSIC = 'assets/audio/gap/bgm/quirky_bgm.mp3';
const sfx = (name: string) => `assets/audio/gap/sfx/${name}.mp3`;

// SFX cues follow the beats (and so the voices) automatically
const CUES: {file: string; at: number; vol: number}[] = [
  {file: sfx('alarm'), at: 0, vol: 0.55},
  {file: sfx('thump'), at: BEAT.hqEnd + 4, vol: 0.6},
  {file: 'assets/audio/sfx/gasp.mp3', at: gapDialogue.find((l) => l.id === 'mo2')!.fromFrame, vol: 0.7},
  {file: sfx('whoosh'), at: BEAT.forceps, vol: 0.5},
  {file: sfx('creak'), at: BEAT.wiggle, vol: 0.8},
  {file: sfx('pop'), at: BEAT.pop, vol: 1},
  {file: 'assets/audio/sfx/gasp.mp3', at: BEAT.pop + 2, vol: 0.6},
  {file: sfx('whoosh'), at: BEAT.pop + 4, vol: 0.6},
  {file: sfx('violin'), at: BEAT.pop + 20, vol: 0.4},
  ...[0, 14, 28, 42].map((d) => ({file: sfx('tok'), at: BEAT.gums + 10 + d, vol: 0.6})),
  {file: sfx('ding'), at: BEAT.patchEnd, vol: 0.45},
  ...POKES.map((p) => ({file: sfx('boing'), at: p, vol: 0.55})),
  {file: sfx('whoosh'), at: BEAT.quiz[0], vol: 0.5},
  ...BEAT.countdown.map((c) => ({file: sfx('tick'), at: c, vol: 0.9})),
  {file: sfx('flip'), at: BEAT.later, vol: 0.7},
  {file: sfx('creak'), at: BEAT.righty + 2, vol: 0.7},
  {file: sfx('creak'), at: BEAT.lefty + 2, vol: 0.6},
  {file: sfx('creak'), at: BEAT.upper + 4, vol: 0.75},
  {file: sfx('ding'), at: BEAT.reveal + 10, vol: 0.8},
  {file: sfx('deflate'), at: BEAT.bone[0] + 4, vol: 0.7},
  {file: sfx('sting'), at: BEAT.endCard, vol: 0.8},
  {file: 'assets/audio/sfx/gasp.mp3', at: BEAT.reaction, vol: 0.9},
  {file: sfx('boing'), at: BEAT.reaction + 2, vol: 0.5},
];

/** "The Gap" v2: a tooth is pulled and the neighbours move in (35-40 s). */
export const GapShort: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: X.bgDark}}>
    <AbsoluteFill>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <GapScene />
      </svg>
    </AbsoluteFill>
    <Sequence name="BGM" layout="none">
      <Html5Audio src={staticFile(MUSIC)} volume={0.26} />
    </Sequence>
    {gapDialogue.map((l) => (
      <Sequence key={l.id} name={`VO ${l.id}`} from={l.fromFrame + (l.delay ?? 0)} durationInFrames={Math.max(1, (T[l.id]?.durationFrames ?? 1) + 2)} layout="none">
        <Html5Audio src={staticFile(l.voiceFile)} />
      </Sequence>
    ))}
    {CUES.map((c, i) => (
      <Sequence key={i} name={`SFX ${c.file.split('/').pop()}`} from={c.at} layout="none">
        <Html5Audio src={staticFile(c.file)} volume={c.vol} />
      </Sequence>
    ))}
    <WordCaptions y={930} words={WORDS} />
  </AbsoluteFill>
);

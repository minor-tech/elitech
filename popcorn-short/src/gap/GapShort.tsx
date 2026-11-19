import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, staticFile} from 'remotion';
import {HEIGHT, WIDTH} from '../theme';
import {gapDialogue} from '../audio/gapDialogue';
import {GAP_BGM, gapSfx} from '../audio/gapSfx';
import timings from '../audio/gapTimings.json';
import {WordCaptions, buildWords} from '../enamelv3/WordCaptions';
import {X} from '../enamelv3/style';
import {GapScene} from './Scene';

export const GAP_FRAMES = 1350; // 45 s
const T = timings as Record<string, {durationFrames: number; words: {text: string; frame: number}[]; voicedTo: number}>;
const WORDS = buildWords(gapDialogue, T);

/** "The Gap": a tooth is pulled and the neighbours move in. */
export const GapShort: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: X.bgDark}}>
    <AbsoluteFill>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <GapScene />
      </svg>
    </AbsoluteFill>

    <Sequence name="BGM" layout="none">
      <Html5Audio src={staticFile(GAP_BGM.file)} volume={GAP_BGM.volume} />
    </Sequence>
    {gapDialogue.map((l) => (
      <Sequence key={l.id} name={`VO ${l.id}`} from={l.fromFrame + (l.delay ?? 0)} durationInFrames={Math.max(1, (T[l.id]?.durationFrames ?? 1) + 2)} layout="none">
        <Html5Audio src={staticFile(l.voiceFile)} />
      </Sequence>
    ))}
    {gapSfx.map((s) => (
      <Sequence key={s.id} name={`SFX ${s.id}`} from={s.frame} layout="none">
        <Html5Audio src={staticFile(s.file)} volume={s.volume} />
      </Sequence>
    ))}

    {/* one word at a time, in the gap between the two rows of teeth */}
    <WordCaptions y={930} words={WORDS} />
  </AbsoluteFill>
);

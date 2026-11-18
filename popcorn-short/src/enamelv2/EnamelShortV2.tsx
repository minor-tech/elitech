import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile} from 'remotion';
import {Stage} from '../components/Stage';
import {Captions} from '../components/Captions';
import {EndCard} from '../components/EndCard';
import {FactPop} from '../components/FactPop';
import {C, clamp} from '../theme';
import {dialogue} from '../audio/dialogueData';
import {BGM, sfx} from '../audio/sfxData';
import timings from '../audio/voiceTimings.json';
import {ToothScene} from './Scene';

const T = timings as Record<string, {durationFrames: number}>;

const bgmVolume = (f: number) =>
  interpolate(
    f,
    [BGM.duckFrom - BGM.rampFrames, BGM.duckFrom, BGM.duckTo, BGM.duckTo + BGM.rampFrames],
    [BGM.volume, BGM.duckedVolume, BGM.duckedVolume, BGM.volume],
    clamp,
  );

/** Enamel v2: two-character dialogue, word-by-word captions, SFX + ducked lo-fi BGM. */
export const EnamelShortV2: React.FC = () => (
  <AbsoluteFill>
    {/* Background + characters */}
    <Stage bg={C.bg} world={<ToothScene />} />

    {/* BGM layer: full duration, ducks under "I cracked" */}
    <Sequence name="BGM" layout="none">
      <Html5Audio src={staticFile(BGM.file)} volume={bgmVolume} />
    </Sequence>

    {/* Voiceover layer */}
    {dialogue.map((l) => (
      <Sequence key={l.id} name={`VO ${l.id}`} from={l.fromFrame + (l.delay ?? 0)} durationInFrames={Math.max(1, (T[l.id]?.durationFrames ?? 1) + 2)} layout="none">
        <Html5Audio src={staticFile(l.voiceFile)} />
      </Sequence>
    ))}

    {/* SFX layer */}
    {sfx.map((s) => (
      <Sequence key={s.id} name={`SFX ${s.id}`} from={s.frame} layout="none">
        <Html5Audio src={staticFile(s.file)} volume={s.volume} />
      </Sequence>
    ))}

    {/* Text layers */}
    <FactPop text="ENAMEL = hardest tissue" from={120} dur={45} />
    <FactPop text="96% mineral. 0 living cells." from={600} dur={70} rot={3} />
    <Captions />
    <EndCard from={810} />
  </AbsoluteFill>
);

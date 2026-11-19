import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {FPS, SPRING, clamp, HEIGHT, WIDTH} from '../theme';
import {dialogue} from '../audio/dialogueData';
import {BGM, sfx} from '../audio/sfxData';
import timings from '../audio/voiceTimings.json';
import {ToothSceneV3} from './Scene';
import {WordCaptions} from './WordCaptions';
import {CAPTION_FONT, X} from './style';

const T = timings as Record<string, {durationFrames: number}>;
// The reference keeps a music bed audible under the voices the whole time.
const MUSIC = 0.32;
const MUSIC_DUCKED = 0.14;
const bgmVolume = (f: number) =>
  interpolate(f, [BGM.duckFrom - BGM.rampFrames, BGM.duckFrom, BGM.duckTo, BGM.duckTo + BGM.rampFrames], [MUSIC, MUSIC_DUCKED, MUSIC_DUCKED, MUSIC], clamp);

const EndTitle: React.FC<{from: number}> = ({from}) => {
  const f = useCurrentFrame() - from;
  if (f < 0) return null;
  const line = (text: string, color: string, d: number) => {
    const s = spring({frame: f - d, fps: FPS, config: SPRING});
    return (
      <div style={{transform: `scale(${0.5 + 0.5 * s})`, opacity: interpolate(f - d, [0, 5], [0, 1], clamp), color}}>{text}</div>
    );
  };
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 330,
          transform: 'translateY(-50%) skewX(-6deg)',
          textAlign: 'center',
          fontFamily: CAPTION_FONT,
          fontSize: 104,
          lineHeight: 1.08,
          WebkitTextStroke: `16px ${X.ink}`,
          paintOrder: 'stroke fill',
          textShadow: '0 8px 0 rgba(0,0,0,0.35)',
        }}
      >
        {line("ENAMEL CAN'T HEAL.", X.white, 0)}
        {line('PROTECT IT.', X.gold, 10)}
      </div>
    </AbsoluteFill>
  );
};

/** Enamel v3: remade in the reference's style (cut-away anatomy, googly eyes, one-word captions). */
export const EnamelShortV3: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: X.bgDark}}>
    <AbsoluteFill>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <ToothSceneV3 />
      </svg>
    </AbsoluteFill>

    <Sequence name="BGM" layout="none">
      <Html5Audio src={staticFile(BGM.file)} volume={bgmVolume} />
    </Sequence>
    {dialogue.map((l) => (
      <Sequence key={l.id} name={`VO ${l.id}`} from={l.fromFrame + (l.delay ?? 0)} durationInFrames={Math.max(1, (T[l.id]?.durationFrames ?? 1) + 2)} layout="none">
        <Html5Audio src={staticFile(l.voiceFile)} />
      </Sequence>
    ))}
    {sfx.map((s) => (
      <Sequence key={s.id} name={`SFX ${s.id}`} from={s.frame} layout="none">
        <Html5Audio src={staticFile(s.file)} volume={s.volume} />
      </Sequence>
    ))}

    <WordCaptions />
    <EndTitle from={810} />
  </AbsoluteFill>
);

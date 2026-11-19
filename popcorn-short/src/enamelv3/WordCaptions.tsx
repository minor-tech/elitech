import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {dialogue} from '../audio/dialogueData';
import timings from '../audio/voiceTimings.json';
import {CAPTION_FONT, X} from './style';
import {clamp} from '../theme';

type W = {text: string; start: number; end: number};
type Line = {id: string; fromFrame: number; toFrame: number; delay?: number};
type Timings = Record<string, {words: {text: string; frame: number}[]; voicedTo: number}>;

/** One word on screen at a time, synced to the voice (the reference's caption style). */
export const buildWords = (lines: Line[], T: Timings): W[] =>
  lines.flatMap((l) => {
    const t = T[l.id];
    if (!t) return [];
    const base = l.fromFrame + (l.delay ?? 0);
    const lineEnd = Math.min(l.toFrame, base + t.voicedTo + 10);
    return t.words.map((w, i) => ({
      text: w.text.replace(/^\.+/, '').toUpperCase(),
      start: base + w.frame,
      end: i < t.words.length - 1 ? base + t.words[i + 1].frame : lineEnd,
    }));
  });
const ENAMEL_WORDS = buildWords(dialogue, timings as Timings);

export const WordCaptions: React.FC<{y?: number; words?: W[]}> = ({y = 1190, words = ENAMEL_WORDS}) => {
  const f = useCurrentFrame();
  const w = words.find((x) => f >= x.start && f < x.end);
  if (!w) return null;
  const t = f - w.start;
  const pop = interpolate(t, [0, 2, 4], [0.82, 1.08, 1], clamp);
  const size = w.text.length > 9 ? Math.max(84, 132 - (w.text.length - 9) * 9) : 132;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: y,
          transform: `translateY(-50%) scale(${pop}) skewX(-6deg)`,
          textAlign: 'center',
          fontFamily: CAPTION_FONT,
          fontSize: size,
          letterSpacing: 2,
          color: X.white,
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

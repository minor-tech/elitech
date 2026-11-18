import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame} from 'remotion';
import {C, FPS, SPRING, clamp, fontFamily} from '../theme';

/** A quick fact sticker between lines (mid-frame, so it never collides with the captions). */
export const FactPop: React.FC<{text: string; from: number; dur: number; y?: number; rot?: number}> = ({text, from, dur, y = 700, rot = -4}) => {
  const f = useCurrentFrame() - from;
  if (f < 0 || f > dur) return null;
  const words = text.trim().split(/\s+/).length;
  if (words > 5) throw new Error(`FactPop over 5 words: ${text}`);
  const sIn = spring({frame: f, fps: FPS, config: SPRING});
  const out = interpolate(f, [dur - 8, dur], [0, 1], {...clamp, easing: Easing.in(Easing.back(2))});
  const scale = Math.max(0, sIn * (1 - out));
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div
        style={{
          position: 'absolute',
          top: y,
          transform: `translateY(-50%) rotate(${rot}deg) scale(${scale})`,
          background: C.gold,
          border: `8px solid ${C.ink}`,
          borderRadius: 999,
          padding: '14px 40px',
          fontFamily,
          fontWeight: 700,
          fontSize: 58,
          color: C.ink,
          whiteSpace: 'nowrap',
          boxShadow: `0 10px 0 rgba(43,27,31,0.3)`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame} from 'remotion';
import {C, FPS, SPRING, clamp, fontFamily} from '../theme';

/** Final takeaway, bottom third, holds to the last frame. */
export const EndCard: React.FC<{from: number}> = ({from}) => {
  const f = useCurrentFrame() - from;
  if (f < 0) return null;
  const s = spring({frame: f, fps: FPS, config: SPRING});
  const op = interpolate(f, [0, 8], [0, 1], clamp);
  const line = (text: string, color: string, delay: number) => {
    const sl = spring({frame: f - delay, fps: FPS, config: SPRING});
    return (
      <div
        style={{
          transform: `scale(${0.6 + 0.4 * sl})`,
          opacity: interpolate(f - delay, [0, 6], [0, 1], clamp),
          color,
          WebkitTextStroke: `12px ${C.ink}`,
          paintOrder: 'stroke fill',
          textShadow: '0 8px 0 rgba(43,27,31,0.35)',
        }}
      >
        {text}
      </div>
    );
  };
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div
        style={{
          position: 'absolute',
          top: 1540, // bottom third, above the app's caption/UI strip
          transform: `translateY(-50%) translateY(${(1 - s) * 30}px)`,
          opacity: op,
          fontFamily,
          fontWeight: 700,
          fontSize: 92,
          lineHeight: 1.12,
          textAlign: 'center',
        }}
      >
        {line("Enamel can't heal.", '#FFFFFF', 0)}
        {line('Protect it.', C.gold, 10)}
      </div>
    </AbsoluteFill>
  );
};

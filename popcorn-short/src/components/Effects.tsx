import React from 'react';
import {interpolate, random, spring} from 'remotion';
import {C, FPS, SPRING, clamp, fontFamily} from '../theme';

/** Floating "z z z" above a sleeper. */
export const Zzz: React.FC<{frame: number; x: number; y: number; opacity?: number}> = ({frame, x, y, opacity = 1}) => (
  <g opacity={opacity}>
    {[0, 1, 2].map((i) => {
      const period = 54;
      const t = (((frame + i * 18) % period) + period) % period / period;
      const op = interpolate(t, [0, 0.15, 0.75, 1], [0, 1, 1, 0]);
      return (
        <text
          key={i}
          x={x + t * 70 + Math.sin(t * Math.PI * 2) * 18}
          y={y - t * 190}
          fontFamily={fontFamily}
          fontWeight={700}
          fontSize={44 + t * 40}
          fill="#FFFFFF"
          stroke={C.ink}
          strokeWidth={8}
          paintOrder="stroke"
          opacity={op}
        >
          z
        </text>
      );
    })}
  </g>
);

/** Panic speed lines radiating around a point. */
export const SpeedLines: React.FC<{frame: number; cx: number; cy: number; r1?: number; r2?: number; count?: number; opacity?: number}> = ({
  frame,
  cx,
  cy,
  r1 = 300,
  r2 = 470,
  count = 22,
  opacity = 1,
}) => (
  <g opacity={opacity}>
    {Array.from({length: count}).map((_, i) => {
      const a = (i / count) * Math.PI * 2 + random(`a${i}`) * 0.2;
      const j = random(`j${i}-${Math.floor(frame / 2)}`);
      const inner = r1 + j * 60;
      const outer = r2 + j * 90;
      const ox = cx + Math.cos(a) * outer;
      const oy = cy + Math.sin(a) * outer;
      if (ox < 16 || ox > 1064 || oy < 16) return null; // keep every line on-screen
      return (
        <line
          key={i}
          x1={cx + Math.cos(a) * inner}
          y1={cy + Math.sin(a) * inner}
          x2={cx + Math.cos(a) * outer}
          y2={cy + Math.sin(a) * outer}
          stroke={C.ink}
          strokeWidth={6 + j * 6}
          strokeLinecap="round"
          opacity={0.75}
        />
      );
    })}
  </g>
);

/** Expanding red pain rings from a point; one per pulse frame. */
export const PulseGlow: React.FC<{frame: number; pulses: number[]; x: number; y: number}> = ({frame, pulses, x, y}) => (
  <g>
    <defs>
      <radialGradient id="painGlow">
        <stop offset="0%" stopColor={C.red} stopOpacity={0.85} />
        <stop offset="60%" stopColor={C.redSoft} stopOpacity={0.35} />
        <stop offset="100%" stopColor={C.redSoft} stopOpacity={0} />
      </radialGradient>
    </defs>
    {pulses.map((p, i) => {
      const t = frame - p;
      if (t < 0 || t > 22) return null;
      const r = interpolate(t, [0, 22], [40, 260 + i * 22]);
      const op = interpolate(t, [0, 4, 22], [0, 1, 0], clamp);
      return (
        <g key={i} opacity={op}>
          <circle cx={x} cy={y} r={r} fill="url(#painGlow)" />
          <circle cx={x} cy={y} r={r * 0.9} fill="none" stroke={C.red} strokeWidth={8} opacity={0.6} />
        </g>
      );
    })}
  </g>
);

/** Red "FAIL" rubber stamp slamming in. */
export const FailStamp: React.FC<{frame: number; at: number; x: number; y: number}> = ({frame, at, x, y}) => {
  if (frame < at) return null;
  const s = spring({frame: frame - at, fps: FPS, config: SPRING});
  const scale = interpolate(s, [0, 1], [2.6, 1]);
  const op = interpolate(frame - at, [0, 3], [0, 1], clamp);
  return (
    <g opacity={op} transform={`translate(${x} ${y}) rotate(-12) scale(${scale})`}>
      <rect x={-170} y={-70} width={340} height={140} rx={24} fill="#FFFFFF" fillOpacity={0.85} stroke={C.red} strokeWidth={14} />
      <rect x={-150} y={-52} width={300} height={104} rx={14} fill="none" stroke={C.red} strokeWidth={5} />
      <text x={0} y={6} textAnchor="middle" dominantBaseline="middle" fontFamily={fontFamily} fontWeight={700} fontSize={96} fill={C.red} letterSpacing={6}>
        FAIL
      </text>
    </g>
  );
};

/** Confetti burst that rains from the top. */
export const Confetti: React.FC<{frame: number; start: number; x?: number; y?: number; count?: number}> = ({frame, start, x: ox = 540, y: oy = 1000, count = 90}) => {
  const t = frame - start;
  if (t < 0) return null;
  const colors = [C.gold, C.red, '#FFFFFF', '#FF8FB1', '#8FD3FF'];
  return (
    <g>
      {Array.from({length: count}).map((_, i) => {
        const r = (k: string) => random(`c${i}-${k}`);
        const x0 = ox + (r('x') - 0.5) * 200;
        const vx = (r('vx') - 0.5) * 36;
        const vy = -12 - r('vy') * 14; // peaks well below the caption band
        const g = 0.9;
        const x = x0 + vx * t + Math.sin((t + i) * 0.25) * 10;
        const y = oy + vy * t + 0.5 * g * t * t;
        const rot = r('r') * 360 + t * (r('rs') - 0.5) * 30;
        const w = 18 + r('w') * 18;
        return (
          <rect
            key={i}
            x={-w / 2}
            y={-w / 4}
            width={w}
            height={w / 2}
            rx={3}
            fill={colors[i % colors.length]}
            stroke={C.ink}
            strokeWidth={3}
            transform={`translate(${x} ${y}) rotate(${rot}) scale(1 ${Math.cos((t + i) * 0.3)})`}
          />
        );
      })}
    </g>
  );
};

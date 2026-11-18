import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, TEXT_Y, bounce, clamp, fontFamily} from '../theme';

const HOLD = 60; // 2 seconds on screen at full size
const IN = 10;
const OUT = 9;

/** Bold rounded caption, white with dark outline. Bounces in, holds 2s, bounces out. Max 5 words. */
export const TextCard: React.FC<{lines: string[]; start: number; size?: number; y?: number}> = ({
  lines,
  start,
  size = 100,
  y = TEXT_Y,
}) => {
  const f = useCurrentFrame();
  const words = lines.join(' ').trim().split(/\s+/).length;
  if (words > 5) throw new Error(`TextCard over 5 words: "${lines.join(' ')}"`);
  if (f < start) return null;
  const outAt = start + IN + HOLD;
  const sIn = bounce(f, start);
  const outT = interpolate(f, [outAt, outAt + OUT], [0, 1], {...clamp, easing: Easing.in(Easing.back(2))});
  if (outT >= 1) return null;
  const scale = Math.max(0, sIn * (1 - outT));
  const lift = interpolate(sIn, [0, 1], [40, 0]) - outT * 60;
  const lh = size * 1.12;
  const y0 = y - ((lines.length - 1) * lh) / 2;
  return (
    <g transform={`translate(540 ${y + lift}) scale(${scale}) translate(-540 ${-y})`}>
      {lines.map((line, i) => (
        <g key={i}>
          {/* drop shadow */}
          <text
            x={540}
            y={y0 + i * lh + 10}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily={fontFamily}
            fontWeight={700}
            fontSize={size}
            fill={C.ink}
            stroke={C.ink}
            strokeWidth={18}
            strokeLinejoin="round"
            opacity={0.35}
          >
            {line}
          </text>
          <text
            x={540}
            y={y0 + i * lh}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily={fontFamily}
            fontWeight={700}
            fontSize={size}
            fill="#FFFFFF"
            stroke={C.ink}
            strokeWidth={18}
            strokeLinejoin="round"
            paintOrder="stroke"
          >
            {line}
          </text>
        </g>
      ))}
    </g>
  );
};

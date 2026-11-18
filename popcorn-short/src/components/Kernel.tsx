import React from 'react';
import {C} from '../theme';

export type KernelFace = 'none' | 'smug' | 'angry' | 'mock' | 'shock' | 'sleep';

type Props = {
  x: number; // centre
  y: number;
  size?: number; // approx width in px
  rotate?: number;
  face?: KernelFace;
  squash?: [number, number];
  opacity?: number;
};

// Angular popcorn kernel (unpopped, with a pointy hull tip), local box ~100x110 centred on 0,0
const BODY = 'M 0 -55 L 34 -30 L 48 8 L 30 46 L -6 56 L -38 38 L -48 2 L -30 -34 Z';
const FACET = 'M 0 -55 L 34 -30 L 10 -8 L -30 -34 Z';
const TIP = 'M -6 56 L 6 70 L 18 50 Z';

export const Kernel: React.FC<Props> = ({
  x,
  y,
  size = 96,
  rotate = 0,
  face = 'none',
  squash = [1, 1],
  opacity = 1,
}) => {
  const s = size / 100;
  const ink = C.ink;
  return (
    <g
      opacity={opacity}
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${s * squash[0]} ${s * squash[1]})`}
    >
      <path d={TIP} fill="#E8E2C8" stroke={ink} strokeWidth={7} strokeLinejoin="round" />
      <path d={BODY} fill={C.gold} stroke={ink} strokeWidth={8} strokeLinejoin="round" />
      <path d={FACET} fill="#FFE866" />
      <path d={BODY} fill="none" stroke={ink} strokeWidth={8} strokeLinejoin="round" />
      {face !== 'none' && (
        <g>
          {/* brows */}
          {(face === 'angry' || face === 'smug' || face === 'mock') && (
            <path
              d={face === 'angry' ? 'M -30 -14 L -8 -4 M 30 -14 L 8 -4' : 'M -28 -12 L -8 -10 M 28 -16 L 8 -10'}
              stroke={ink}
              strokeWidth={6}
              strokeLinecap="round"
            />
          )}
          {face === 'sleep' ? (
            <>
              <path d="M -26 6 Q -16 14 -6 6 M 6 6 Q 16 14 26 6" stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />
              <path d="M -10 26 Q 4 34 16 24" stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />
            </>
          ) : face === 'shock' ? (
            <>
              <circle cx={-16} cy={6} r={10} fill="#fff" stroke={ink} strokeWidth={4} />
              <circle cx={16} cy={6} r={10} fill="#fff" stroke={ink} strokeWidth={4} />
              <circle cx={-16} cy={6} r={3} fill={ink} />
              <circle cx={16} cy={6} r={3} fill={ink} />
            </>
          ) : (
            <>
              <circle cx={-16} cy={6} r={6} fill={ink} />
              <circle cx={16} cy={6} r={6} fill={ink} />
            </>
          )}
          {face === 'smug' && <path d="M -14 26 Q 4 34 18 20" stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />}
          {face === 'angry' && <path d="M -14 30 Q 0 20 14 30" stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />}
          {face === 'shock' && <ellipse cx={0} cy={30} rx={7} ry={9} fill={ink} />}
          {face === 'mock' && (
            <>
              <path d="M -16 22 Q 0 32 16 22" stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />
              <path d="M -4 26 Q 0 46 10 40 Q 12 30 8 25 Z" fill={C.red} stroke={ink} strokeWidth={4} />
            </>
          )}
        </g>
      )}
    </g>
  );
};

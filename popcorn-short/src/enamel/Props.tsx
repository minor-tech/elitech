import React from 'react';
import {interpolate} from 'remotion';
import {C, GUM_Y, HEIGHT, clamp} from '../theme';
import {Gum} from '../components/Gum';
import {Tooth} from '../components/Tooth';

/** Arm in tooth-local coords: shoulder on the left side, fist raised beside the head. */
export const Arm: React.FC<{rot: number; children?: React.ReactNode}> = ({rot, children}) => {
  const g = C.toothOutline;
  const arm = 'M 0 0 Q -70 -40 -62 -150';
  return (
    <g transform={`translate(70 240) rotate(${rot})`}>
      <path d={arm} stroke={g} strokeWidth={46} fill="none" strokeLinecap="round" />
      <path d={arm} stroke="#fff" strokeWidth={28} fill="none" strokeLinecap="round" />
      {children}
      <rect x={-104} y={-232} width={84} height={78} rx={28} fill="#fff" stroke={g} strokeWidth={9} />
      <path d="M -82 -230 L -82 -176 M -62 -232 L -62 -176 M -42 -230 L -42 -178" stroke={g} strokeWidth={5} />
    </g>
  );
};

/** Toothbrush drawn vertically, handle centred at the origin (the fist). */
export const Brush: React.FC = () => (
  <g>
    <rect x={-84} y={-350} width={40} height={230} rx={20} fill={C.gold} stroke={C.ink} strokeWidth={9} />
    <rect x={-92} y={-440} width={56} height={110} rx={20} fill="#FFFFFF" stroke={C.toothOutline} strokeWidth={8} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={-36} y={-432 + i * 25} width={40} height={16} rx={7} fill="#FFFFFF" stroke={C.toothOutline} strokeWidth={5} />
    ))}
  </g>
);

/** 4-point sparkle */
export const Sparkle: React.FC<{x: number; y: number; s: number; rot?: number}> = ({x, y, s, rot = 0}) =>
  s <= 0 ? null : (
    <path
      transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}
      d="M 0 -40 Q 6 -6 40 0 Q 6 6 0 40 Q -6 6 -40 0 Q -6 -6 0 -40 Z"
      fill={C.gold}
      stroke={C.ink}
      strokeWidth={5}
    />
  );

/** Enamel-building cell (ameloblast) that fades into a ghost. ghost: 0 = cell, 1 = ghost. */
export const Cell: React.FC<{x: number; y: number; ghost: number; opacity?: number; scale?: number}> = ({x, y, ghost, opacity = 1, scale = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    {ghost < 1 && (
      <g opacity={1 - ghost}>
        <circle r={46} fill={C.gold} opacity={0.35} />
        <circle r={30} fill="#FFE866" stroke={C.ink} strokeWidth={6} />
        <circle cx={-9} cy={-4} r={4.5} fill={C.ink} />
        <circle cx={9} cy={-4} r={4.5} fill={C.ink} />
        <path d="M -8 8 Q 0 15 8 8" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
    )}
    {ghost > 0 && (
      <g opacity={ghost * 0.85}>
        <path d="M -30 30 L -30 -4 A 30 30 0 0 1 30 -4 L 30 30 L 20 22 L 10 30 L 0 22 L -10 30 L -20 22 Z" fill="#FFFFFF" stroke={C.toothOutline} strokeWidth={5} strokeLinejoin="round" />
        <circle cx={-10} cy={-2} r={4.5} fill={C.ink} />
        <circle cx={10} cy={-2} r={4.5} fill={C.ink} />
        <path d="M -7 14 Q 0 8 7 14" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
    )}
  </g>
);

/** Classic cartoon snot bubble. */
export const SnotBubble: React.FC<{x: number; y: number; r: number; popped?: number}> = ({x, y, r, popped = -1}) => {
  if (popped >= 0) {
    const op = interpolate(popped, [0, 6], [1, 0], clamp);
    return (
      <g opacity={op} stroke={C.ink} strokeWidth={5} strokeLinecap="round">
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * Math.PI * 2;
          const r1 = 20 + popped * 6;
          return <line key={i} x1={x + Math.cos(a) * r1} y1={y + Math.sin(a) * r1} x2={x + Math.cos(a) * (r1 + 18)} y2={y + Math.sin(a) * (r1 + 18)} />;
        })}
      </g>
    );
  }
  if (r <= 0) return null;
  return (
    <g>
      <circle cx={x + r * 0.85} cy={y} r={r} fill="#DDF4FF" opacity={0.75} stroke="#7FB8D8" strokeWidth={4} />
      <ellipse cx={x + r * 0.55} cy={y - r * 0.45} rx={r * 0.22} ry={r * 0.12} fill="#fff" />
    </g>
  );
};

/** Upper jaw (gum band + one upside-down molar). gumY = the upper gum line on screen. */
export const UpperJaw: React.FC<{gumY: number; x?: number; scale?: number}> = ({gumY, x = 540, scale = 1.1}) => (
  <g>
    <Tooth left={x - 200 * scale} top={gumY - 360 * scale} scale={scale} tilt={180} faceless />
    <g transform={`translate(0 ${gumY + GUM_Y}) scale(1 -1)`}>
      <Gum papillae={[]} />
    </g>
    <rect x={-40} y={gumY - HEIGHT - 600} width={1200} height={HEIGHT + 60 - 540 + 600} fill={C.gum} />
  </g>
);

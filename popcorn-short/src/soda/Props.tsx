import React from 'react';
import {random} from 'remotion';
import {CAPTION_FONT, X} from '../enamelv3/style';
import {Googly, Noodle} from '../gap/Props';
import type {Face} from '../gap/Props';

const INK = X.ink;
const LINE = X.line;

// ---------- the soda can (outside shot) -------------------------------------------
/** A generic teal soda can ("FIZZ!"), held in a hand; `open` 0..1 lifts the tab. */
export const CanInHand: React.FC<{x: number; y: number; s?: number; open: number; tilt?: number}> = ({x, y, s = 1, open, tilt = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
    {/* can */}
    <rect x={-150} y={-260} width={300} height={520} rx={40} fill="#20B2A6" stroke={LINE} strokeWidth={10} />
    <rect x={-150} y={-260} width={300} height={60} rx={30} fill="#D9DEE6" stroke={LINE} strokeWidth={10} />
    <rect x={-150} y={200} width={300} height={60} rx={30} fill="#D9DEE6" stroke={LINE} strokeWidth={10} />
    <path d="M -120 -150 C -40 -110, 60 -190, 130 -140" stroke="#FFFFFF" strokeWidth={14} fill="none" opacity={0.7} strokeLinecap="round" />
    <text x={0} y={-40} textAnchor="middle" dominantBaseline="middle" fontFamily={CAPTION_FONT} fontSize={110} fill="#FFFFFF" stroke={LINE} strokeWidth={12} paintOrder="stroke" transform="rotate(-8)">
      FIZZ!
    </text>
    <rect x={-136} y={-140} width={34} height={300} rx={14} fill="#FFFFFF" opacity={0.35} />
    {/* pull tab */}
    <g transform={`translate(30 -262) rotate(${-open * 70})`}>
      <rect x={-10} y={-14} width={80} height={28} rx={14} fill="#B8BEC8" stroke={LINE} strokeWidth={7} />
    </g>
    {/* hand gripping the can */}
    <path d="M -175 60 C -230 60, -240 220, -175 240 L -120 240 L -120 60 Z" fill="#F2C29B" stroke={LINE} strokeWidth={9} strokeLinejoin="round" />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={-130} y={60 + i * 44} width={96} height={40} rx={20} fill="#F2C29B" stroke={LINE} strokeWidth={8} />
    ))}
  </g>
);

/** Fizz spray burst out of the can's opening. */
export const Spray: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => {
  if (t < 0 || t > 30) return null;
  return (
    <g opacity={Math.min(1, (30 - t) / 10)}>
      {Array.from({length: 26}).map((_, i) => {
        const a = -Math.PI / 2 + (random(`sa${i}`) - 0.5) * 1.6;
        const v = 18 + random(`sv${i}`) * 20;
        const px = x + Math.cos(a) * v * t;
        const py = y + Math.sin(a) * v * t + 0.5 * t * t;
        const r = 8 + random(`sr${i}`) * 14;
        return <circle key={i} cx={px} cy={py} r={r} fill={i % 3 ? '#FFFFFF' : '#CDEFFF'} stroke={LINE} strokeWidth={4} />;
      })}
    </g>
  );
};

// ---------- liquids -------------------------------------------------------------------
/** A liquid that rolls in from the right (`front` = x of its left edge) and pools up to `level`. */
export const Liquid: React.FC<{front: number; level: number; f: number; color: string; opacity: number; edge: string; bubbles?: boolean; floor?: number}> = ({front, level, f, color, opacity, edge, bubbles = true, floor = 2000}) => {
  if (front > 1200) return null;
  const top: string[] = [];
  for (let x = Math.max(-80, front); x <= 1180; x += 40) top.push(`L ${x} ${level + Math.sin(x / 70 + f * 0.35) * 16}`);
  const left: string[] = [];
  for (let y = level; y <= floor; y += 60) left.push(`L ${front + Math.sin(y / 90 + f * 0.4) * 26} ${y}`);
  const d = `M ${front} ${level} ${top.join(' ')} L 1180 ${floor} L ${front} ${floor} ${left.reverse().join(' ')} Z`;
  return (
    <g>
      <path d={d} fill={color} opacity={opacity} />
      <path d={`M ${Math.max(-80, front)} ${level} ${top.join(' ')}`} stroke={edge} strokeWidth={8} fill="none" opacity={0.9} />
      {bubbles &&
        Array.from({length: 18}).map((_, i) => {
          const bx = Math.max(front + 20, -40) + random(`bx${i}`) * 1100;
          const cycle = 50 + random(`bc${i}`) * 40;
          const by = floor - (((f * 6 + random(`bo${i}`) * 900) % 1000) / 1000) * (floor - level);
          return bx < 1150 && by > level + 10 ? <circle key={i} cx={bx + Math.sin((f + i) * 0.2) * 8} cy={by} r={6 + (i % 4) * 4} fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={0.8} data-c={cycle} /> : null;
        })}
    </g>
  );
};

// ---------- Sugar Bug ---------------------------------------------------------------------
export const SugarBug: React.FC<Face & {x: number; y: number; s?: number; rot?: number; hat?: string; diet?: boolean; f: number}> = ({x, y, s = 1, rot = 0, hat = '#FF5A7A', diet = false, f, ...face}) => {
  const wob = Math.sin(f * 0.5 + x) * 3;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot + wob}) scale(${s})`}>
      {/* legs */}
      {[-40, -14, 14, 40].map((lx, i) => (
        <path key={i} d={`M ${lx} 40 Q ${lx + (i % 2 ? 8 : -8)} 70 ${lx + (i % 2 ? 14 : -14)} 76`} stroke={LINE} strokeWidth={8} fill="none" strokeLinecap="round" />
      ))}
      <ellipse cx={0} cy={0} rx={78} ry={62} fill="#7BD15B" stroke={LINE} strokeWidth={9} />
      <ellipse cx={-26} cy={-30} rx={22} ry={12} fill="#B6F09A" />
      {[[-46, 22], [40, 26], [8, 40]].map(([sx, sy], i) => (
        <circle key={i} cx={sx} cy={sy} r={7} fill="#4FA83A" />
      ))}
      {/* party hat */}
      <g transform="translate(14 -58) rotate(14)">
        <path d="M -30 0 L 0 -78 L 30 0 Z" fill={hat} stroke={LINE} strokeWidth={7} strokeLinejoin="round" />
        <path d="M -20 -22 L 18 -30 M -12 -46 L 10 -52" stroke="#FFE866" strokeWidth={8} strokeLinecap="round" />
        <circle cx={0} cy={-80} r={10} fill="#FFE866" stroke={LINE} strokeWidth={5} />
      </g>
      {diet && (
        <g transform="translate(82 10) rotate(18)">
          <rect x={-24} y={-44} width={48} height={88} rx={10} fill="#E9EEF5" stroke={LINE} strokeWidth={6} />
          <text x={0} y={4} textAnchor="middle" dominantBaseline="middle" fontFamily={CAPTION_FONT} fontSize={20} fill={X.red} transform="rotate(-90)">
            DIET
          </text>
          <Noodle d="M -70 10 Q -40 20 -22 6" hand={[-22, 6]} />
        </g>
      )}
      <Googly x={-4} y={-8} s={0.5} gap={64} mouthY={60} {...face} />
    </g>
  );
};

/** A burp: an acid cloud and a comic "BURP!" sticker. */
export const Burp: React.FC<{x: number; y: number; t: number; size?: number; small?: boolean}> = ({x, y, t, size = 1, small = false}) => {
  if (t < 0 || t > 40) return null;
  const grow = Math.min(1, t / 8);
  const fade = t > 28 ? (40 - t) / 12 : 1;
  const s = size * (small ? 0.5 : 1);
  return (
    <g opacity={fade}>
      {[[0, 0, 70], [60, -30, 55], [-55, -26, 50], [20, -70, 46], [-20, 40, 40]].map(([cx, cy, r], i) => (
        <circle key={i} cx={x + cx * s * grow} cy={y + cy * s * grow - t * 2} r={r * s * grow} fill="#D7F171" stroke="#8DB33A" strokeWidth={6} opacity={0.88} />
      ))}
      <text
        x={x}
        y={y - 10 - t * 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily={CAPTION_FONT}
        fontSize={(small ? 54 : 92) * Math.min(1.15, 0.4 + t / 6)}
        fill="#FFE866"
        stroke={LINE}
        strokeWidth={12}
        paintOrder="stroke"
        transform={`rotate(-10 ${x} ${y})`}
      >
        {small ? 'burp?' : 'BURP!'}
      </text>
    </g>
  );
};

// ---------- Saliva ---------------------------------------------------------------------------
export const Saliva: React.FC<Face & {x: number; y: number; s?: number; rot?: number; f: number; wipe?: boolean}> = ({x, y, s = 1, rot = 0, f, wipe = false, ...face}) => {
  const w = wipe ? Math.sin(f * 0.9) * 26 : 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M 0 -150 C 60 -70, 120 -10, 120 50 A 120 120 0 0 1 -120 50 C -120 -10, -60 -70, 0 -150 Z" fill="#8FD8FF" stroke={LINE} strokeWidth={9} strokeLinejoin="round" />
      <path d="M -60 -10 C -70 30, -60 70, -30 96" stroke="#D6F2FF" strokeWidth={16} fill="none" strokeLinecap="round" />
      {/* lifeguard whistle on a cord */}
      <path d="M -70 60 Q 0 120 70 60" stroke={X.red} strokeWidth={6} fill="none" />
      <g transform="translate(40 96)">
        <rect x={-18} y={-12} width={40} height={24} rx={10} fill={X.gold} stroke={LINE} strokeWidth={5} />
      </g>
      <Noodle d={`M 110 30 Q 170 ${40 + w} ${190 + w} ${70}`} hand={[190 + w, 70]} />
      <Noodle d="M -110 30 Q -160 60 -150 110" hand={[-150, 110]} />
      <Googly x={0} y={0} s={0.85} {...face} />
    </g>
  );
};

/** Gentle sparkle (healthy shine / water). */
export const Twinkle: React.FC<{x: number; y: number; s: number; rot?: number}> = ({x, y, s, rot = 0}) =>
  s <= 0 ? null : (
    <path transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} d="M 0 -40 Q 6 -6 40 0 Q 6 6 0 40 Q -6 6 -40 0 Q -6 -6 0 -40 Z" fill="#FFFFFF" stroke={LINE} strokeWidth={5} />
  );

// ---------- Brain HQ pH dial -----------------------------------------------------------------
/** Semicircular MOUTH pH dial (0..14). Red below 5.5 = enamel softens. */
export const PhDial: React.FC<{x: number; y: number; ph: number; f: number}> = ({x, y, ph, f}) => {
  const R = 210;
  const ang = (p: number) => Math.PI + (p / 14) * Math.PI; // 0 left .. 14 right
  const arc = (p0: number, p1: number) => {
    const a0 = ang(p0);
    const a1 = ang(p1);
    return `M ${x + Math.cos(a0) * R} ${y + Math.sin(a0) * R} A ${R} ${R} 0 0 1 ${x + Math.cos(a1) * R} ${y + Math.sin(a1) * R}`;
  };
  const danger = ph < 5.5;
  const blink = danger && Math.floor(f / 8) % 2 === 0;
  const a = ang(ph);
  return (
    <g>
      <path d={arc(0, 5.5)} stroke="#FF4A4A" strokeWidth={46} fill="none" />
      <path d={arc(5.5, 6.6)} stroke="#FFC94A" strokeWidth={46} fill="none" />
      <path d={arc(6.6, 14)} stroke="#5FD38A" strokeWidth={46} fill="none" />
      {[0, 2, 4, 5.5, 7, 9, 11, 14].map((p) => (
        <text key={p} x={x + Math.cos(ang(p)) * (R - 62)} y={y + Math.sin(ang(p)) * (R - 62)} textAnchor="middle" dominantBaseline="middle" fontFamily={CAPTION_FONT} fontSize={30} fill="#FFFFFF">
          {p}
        </text>
      ))}
      <line x1={x} y1={y} x2={x + Math.cos(a) * (R - 20)} y2={y + Math.sin(a) * (R - 20)} stroke="#FFFFFF" strokeWidth={14} strokeLinecap="round" />
      <circle cx={x} cy={y} r={22} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
      <text x={x} y={y + 66} textAnchor="middle" fontFamily={CAPTION_FONT} fontSize={52} fill="#FFFFFF">
        MOUTH pH {ph.toFixed(1)}
      </text>
      {danger && (
        <text x={x} y={y - R - 40} textAnchor="middle" fontFamily={CAPTION_FONT} fontSize={50} fill={blink ? '#FF4A4A' : '#FF9A9A'}>
          ENAMEL DANGER!
        </text>
      )}
    </g>
  );
};

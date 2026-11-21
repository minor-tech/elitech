import React from 'react';
import {X} from '../enamelv3/style';

const INK = X.ink;

// ---------- shared googly face (same look as the teeth) ------------------------
export type Face = {eyes?: 'open' | 'wide' | 'closed' | 'half' | 'squeeze' | 'dizzy'; mouth?: 'smile' | 'grin' | 'o' | 'frown' | 'flat' | 'yell'; look?: [number, number]; talk?: number; brows?: 'none' | 'worried' | 'angry' | 'proud'};

export const Googly: React.FC<Face & {x: number; y: number; s?: number; gap?: number; mouthY?: number}> = ({
  x,
  y,
  s = 1,
  gap = 76,
  mouthY = 70,
  eyes = 'open',
  mouth = 'smile',
  look = [0, 0],
  talk = 0,
  brows = 'none',
}) => {
  const eye = (cx: number, side: -1 | 1) => {
    if (eyes === 'dizzy')
      return (
        <g>
          <ellipse cx={cx} cy={0} rx={36} ry={46} fill={X.white} stroke={INK} strokeWidth={6} />
          <path d={`M ${cx} 2 m -4 0 a 4 4 0 1 1 8 0 a 9 9 0 1 1 -17 0 a 14 14 0 1 1 27 0 a 19 19 0 1 1 -36 0`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      );
    if (eyes === 'closed') return <path d={`M ${cx - 30} ${8} Q ${cx} ${30} ${cx + 30} ${8}`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />;
    if (eyes === 'squeeze')
      return (
        <path
          d={side < 0 ? `M ${cx - 24} -14 L ${cx + 20} 6 L ${cx - 24} 26` : `M ${cx + 24} -14 L ${cx - 20} 6 L ${cx + 24} 26`}
          stroke={INK}
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    const rx = eyes === 'wide' ? 40 : 36;
    const ry = eyes === 'wide' ? 52 : 46;
    return (
      <g>
        <ellipse cx={cx} cy={0} rx={rx} ry={ry} fill={X.white} stroke={INK} strokeWidth={6} />
        <circle cx={cx + look[0]} cy={18 + look[1]} r={eyes === 'wide' ? 9 : 12} fill={INK} />
        {eyes === 'half' && (
          <>
            <path d={`M ${cx - rx - 2} 2 A ${rx + 2} ${ry + 2} 0 0 1 ${cx + rx + 2} 2 Z`} fill="#F4C9C9" />
            <path d={`M ${cx - rx} 2 L ${cx + rx} 2`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
          </>
        )}
      </g>
    );
  };
  const by = -62;
  const browD =
    brows === 'worried'
      ? `M ${-gap / 2 - 24} ${by + 4} L ${-gap / 2 + 20} ${by - 10} M ${gap / 2 - 20} ${by - 10} L ${gap / 2 + 24} ${by + 4}`
      : brows === 'angry'
        ? `M ${-gap / 2 - 24} ${by - 8} L ${-gap / 2 + 20} ${by + 8} M ${gap / 2 - 20} ${by + 8} L ${gap / 2 + 24} ${by - 8}`
        : brows === 'proud'
          ? `M ${-gap / 2 - 26} ${by + 4} Q ${-gap / 2} ${by - 12} ${-gap / 2 + 22} ${by + 2} M ${gap / 2 - 22} ${by + 2} Q ${gap / 2} ${by - 12} ${gap / 2 + 26} ${by + 4}`
          : '';
  const m = mouthY;
  const st = {stroke: INK, strokeWidth: 6, fill: 'none', strokeLinecap: 'round' as const};
  let mouthEl: React.ReactNode;
  if (talk > 0.08)
    mouthEl = (
      <g>
        <ellipse cx={0} cy={m + 4} rx={14 + talk * 7} ry={4 + talk * 17} fill={X.line} stroke={INK} strokeWidth={4} />
        <ellipse cx={0} cy={m + 8 + talk * 9} rx={8 + talk * 3} ry={2 + talk * 5} fill={X.pulp} />
      </g>
    );
  else if (mouth === 'grin') mouthEl = <path d={`M -22 ${m - 6} Q 0 ${m + 26} 22 ${m - 6} Z`} fill={X.line} stroke={INK} strokeWidth={5} strokeLinejoin="round" />;
  else if (mouth === 'o') mouthEl = <ellipse cx={0} cy={m + 4} rx={10} ry={14} fill={X.line} stroke={INK} strokeWidth={4} />;
  else if (mouth === 'yell') mouthEl = <ellipse cx={0} cy={m + 8} rx={24} ry={22} fill={X.line} stroke={INK} strokeWidth={5} />;
  else if (mouth === 'frown') mouthEl = <path d={`M -16 ${m + 8} Q 0 ${m - 6} 16 ${m + 8}`} {...st} />;
  else if (mouth === 'flat') mouthEl = <path d={`M -12 ${m} L 12 ${m}`} {...st} />;
  else mouthEl = <path d={`M -14 ${m - 2} Q 0 ${m + 10} 14 ${m - 2}`} {...st} />;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {browD && <path d={browD} stroke={INK} strokeWidth={7} strokeLinecap="round" fill="none" />}
      {eye(-gap / 2, -1)}
      {eye(gap / 2, 1)}
      {mouthEl}
    </g>
  );
};

/** Noodle arm (white with ink outline) + round hand. */
export const Noodle: React.FC<{d: string; hand: [number, number]}> = ({d, hand}) => (
  <g fill="none" strokeLinecap="round">
    <path d={d} stroke={INK} strokeWidth={19} />
    <path d={d} stroke={X.white} strokeWidth={10} />
    <circle cx={hand[0]} cy={hand[1]} r={14} fill={X.white} stroke={INK} strokeWidth={5} />
  </g>
);

// ---------- Brain ----------------------------------------------------------------
export const Brain: React.FC<Face & {x: number; y: number; s?: number; headset?: boolean; armsUp?: boolean; frame: number}> = ({x, y, s = 1, headset = true, armsUp = false, frame, ...face}) => {
  const body = 'M -250 40 C -280 -90, -170 -200, -60 -190 C 0 -240, 110 -230, 160 -170 C 260 -160, 300 -40, 260 50 C 280 150, 180 210, 80 190 C 0 230, -120 220, -170 170 C -260 170, -290 110, -250 40 Z';
  const wob = Math.sin(frame * 0.6) * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {armsUp ? (
        <>
          <Noodle d={`M -220 60 Q -330 -40 ${-300 + wob} ${-150}`} hand={[-300 + wob, -150]} />
          <Noodle d={`M 230 60 Q 340 -40 ${300 - wob} ${-150}`} hand={[300 - wob, -150]} />
        </>
      ) : (
        <>
          <Noodle d="M -220 90 Q -300 160 -250 250" hand={[-250, 250]} />
          <Noodle d="M 230 90 Q 310 160 260 250" hand={[260, 250]} />
        </>
      )}
      <path d={body} fill="#F5A3B5" stroke={X.line} strokeWidth={7} strokeLinejoin="round" />
      {/* gyri */}
      {['M -200 -40 C -170 -90, -120 -60, -140 -10 C -160 40, -90 60, -80 0', 'M 40 -150 C 80 -110, 30 -80, 70 -50 C 110 -20, 160 -60, 190 -20', 'M -120 120 C -80 90, -40 140, 0 110 C 40 80, 90 130, 130 100', 'M 170 60 C 210 40, 230 90, 200 120', 'M -60 -140 C -30 -110, -80 -90, -40 -60'].map((d, i) => (
        <path key={i} d={d} stroke="#D9768E" strokeWidth={8} fill="none" strokeLinecap="round" />
      ))}
      {headset && (
        <g>
          <path d="M -230 -40 C -230 -260, 230 -260, 230 -40" stroke="#4A4A55" strokeWidth={16} fill="none" strokeLinecap="round" />
          <rect x={-262} y={-70} width={44} height={84} rx={18} fill="#4A4A55" stroke={INK} strokeWidth={5} />
          <path d="M -240 10 Q -230 110 -110 120" stroke="#4A4A55" strokeWidth={8} fill="none" strokeLinecap="round" />
          <circle cx={-104} cy={120} r={13} fill="#2C2C33" />
        </g>
      )}
      <Googly x={10} y={-40} {...face} />
    </g>
  );
};

// ---------- Heart & Lungs -----------------------------------------------------------
export const Heart: React.FC<Face & {x: number; y: number; s?: number}> = ({x, y, s = 1, ...face}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 150 C -60 100, -190 30, -190 -60 C -190 -150, -80 -170, 0 -90 C 80 -170, 190 -150, 190 -60 C 190 30, 60 100, 0 150 Z" fill="#E8414F" stroke={X.line} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -130 -90 C -120 -120, -90 -130, -70 -120" stroke="#FF8A92" strokeWidth={14} fill="none" strokeLinecap="round" />
    <path d="M -20 -150 L -20 -200 M 30 -140 L 40 -210" stroke="#C83442" strokeWidth={26} strokeLinecap="round" />
    <Googly x={0} y={-50} s={0.8} {...face} />
  </g>
);

export const Lungs: React.FC<Face & {x: number; y: number; s?: number; puff?: number}> = ({x, y, s = 1, puff = 1, ...face}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 -420 L 0 -170 M 0 -170 Q -40 -120 -110 -110 M 0 -170 Q 40 -120 110 -110" stroke="#F2B6BE" strokeWidth={46} fill="none" strokeLinecap="round" />
    <path d="M 0 -420 L 0 -170 M 0 -170 Q -40 -120 -110 -110 M 0 -170 Q 40 -120 110 -110" stroke={X.line} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.5} />
    {[-1, 1].map((side) => (
      <g key={side} transform={`translate(${side * 175} 40) scale(${puff})`}>
        <path
          d="M 40 -260 C -60 -250, -150 -120, -160 40 C -170 200, -100 290, 10 280 C 90 270, 110 200, 100 120 C 90 20, 110 -120, 100 -200 C 96 -240, 80 -262, 40 -260 Z"
          transform={side < 0 ? 'scale(1 1)' : 'scale(-1 1)'}
          fill="#F59AA8"
          stroke={X.line}
          strokeWidth={7}
          strokeLinejoin="round"
        />
        <path d="M -40 -150 C -90 -80, -100 20, -80 120" transform={side < 0 ? '' : 'scale(-1 1)'} stroke="#FBC2CA" strokeWidth={16} fill="none" strokeLinecap="round" />
      </g>
    ))}
    <Googly x={0} y={-80} s={0.9} gap={300} mouthY={150} {...face} />
  </g>
);

// ---------- Tongue ---------------------------------------------------------------
/** Tongue entering from the right; `tip` is where the tip points (screen coords). */
export const Tongue: React.FC<Face & {tip: [number, number]; squish?: number}> = ({tip, squish = 0, ...face}) => {
  const [tx, ty] = tip;
  const base: [number, number] = [1240, ty - 260];
  const d = `M ${base[0]} ${base[1] - 150} C ${tx + 380} ${ty - 420}, ${tx + 90} ${ty - 300}, ${tx + 40} ${ty - 90 + squish} C ${tx + 20} ${ty - 10 + squish}, ${tx - 80} ${ty - 10 + squish}, ${tx - 70} ${ty - 110 + squish} C ${tx - 60} ${ty - 330}, ${tx + 280} ${ty - 560}, ${base[0]} ${base[1] - 520} Z`;
  return (
    <g>
      <path d={d} fill="#F07A92" stroke={X.line} strokeWidth={8} strokeLinejoin="round" />
      {/* soft shading: darker underside + a highlight streak along the top */}
      <path d={d} fill="url(#tongueShade)" />
      <path d={`M ${tx + 330} ${ty - 520} C ${tx + 160} ${ty - 470}, ${tx + 20} ${ty - 360}, ${tx - 40} ${ty - 200}`} stroke="#FFC2CF" strokeWidth={16} fill="none" strokeLinecap="round" opacity={0.85} />
      <path d={`M ${tx + 260} ${ty - 400} C ${tx + 120} ${ty - 340}, ${tx + 20} ${ty - 260}, ${tx - 10} ${ty - 140 + squish}`} stroke="#D35A75" strokeWidth={8} fill="none" strokeLinecap="round" />
      <Googly x={tx + 120} y={ty - 360} s={0.85} {...face} />
    </g>
  );
};

// ---------- Forceps ----------------------------------------------------------------
export const Forceps: React.FC<{tip: [number, number]; open: number}> = ({tip, open}) => {
  const a = -38;
  const o = open * 14;
  return (
    <g transform={`translate(${tip[0]} ${tip[1]}) rotate(${a})`}>
      <path d={`M 0 ${-6 - o} L 60 ${-22 - o} L 420 -40 L 430 -26 L 70 ${-6 - o} Z`} fill="#C9CCD6" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M 0 ${6 + o} L 60 ${22 + o} L 420 40 L 430 26 L 70 ${6 + o} Z`} fill="#C9CCD6" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <ellipse cx={500} cy={0} rx={96} ry={78} fill={X.white} stroke={INK} strokeWidth={8} />
      <ellipse cx={430} cy={-46} rx={46} ry={24} fill={X.white} stroke={INK} strokeWidth={7} />
      <ellipse cx={425} cy={44} rx={42} ry={22} fill={X.white} stroke={INK} strokeWidth={7} />
      <rect x={570} y={-86} width={300} height={172} rx={34} fill={X.white} stroke={INK} strokeWidth={8} />
    </g>
  );
};

export const IcePack: React.FC<{x: number; y: number; rot?: number}> = ({x, y, rot = -12}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-110} y={-42} width={220} height={84} rx={30} fill="#BFE6FF" stroke={INK} strokeWidth={7} />
    <path d="M -80 -16 L -40 -16" stroke={X.white} strokeWidth={10} strokeLinecap="round" />
    <path d="M -70 -42 C -60 -80, 60 -80, 70 -42" stroke="#7FB8D8" strokeWidth={10} fill="none" />
  </g>
);

export const HardHat: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -50 0 C -50 -50, 50 -50, 50 0 Z" fill={X.gold} stroke={INK} strokeWidth={6} />
    <rect x={-62} y={-6} width={124} height={14} rx={6} fill={X.gold} stroke={INK} strokeWidth={6} />
  </g>
);

/** Pointing-down hand (drawn, not an emoji). */
export const PointDown: React.FC<{x: number; y: number; s?: number; bob?: number}> = ({x, y, s = 1, bob = 0}) => (
  <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
    {/* index finger */}
    <rect x={-14} y={-6} width={28} height={70} rx={14} fill={X.white} stroke={INK} strokeWidth={6} />
    {/* fist */}
    <rect x={-40} y={-62} width={80} height={64} rx={24} fill={X.white} stroke={INK} strokeWidth={6} />
    <path d="M -20 -60 L -20 -4 M 0 -62 L 0 -4 M 20 -60 L 20 -6" stroke={INK} strokeWidth={4} />
    {/* thumb */}
    <rect x={-54} y={-46} width={26} height={40} rx={13} fill={X.white} stroke={INK} strokeWidth={6} />
    {/* cuff */}
    <rect x={-36} y={-92} width={72} height={30} rx={8} fill={X.gold} stroke={INK} strokeWidth={6} />
  </g>
);

/** Gradients for gums / tongue / drop shadows - render once per SVG. */
export const SoftShadeDefs: React.FC = () => (
  <defs>
    <linearGradient id="tongueShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.45" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.16} />
    </linearGradient>
    <linearGradient id="gumShadeDown" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.35" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.15} />
    </linearGradient>
    <linearGradient id="gumShadeUp" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0.35" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.15} />
    </linearGradient>
  </defs>
);

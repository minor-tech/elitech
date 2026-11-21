import React from 'react';
import {X} from './style';

export type XEyes = 'open' | 'wide' | 'closed' | 'half' | 'squeeze' | 'dizzy';
export type XBrows = 'none' | 'proud' | 'worried' | 'angry' | 'skeptical';
export type XMouth = 'smile' | 'grin' | 'o' | 'frown' | 'flat' | 'wavy' | 'grit' | 'smirk' | 'yell';
export type XArms = 'none' | 'rest' | 'flex' | 'panic' | 'reach';

// Molar in cross-section. Local box 400 x 480, gum line (CEJ) at y=320, root tips at ~470.
const OUTER =
  'M 50 180 C 30 60, 130 10, 160 50 C 185 80, 215 80, 240 50 C 270 10, 370 60, 350 180 ' +
  'C 340 260, 330 300, 310 360 C 300 420, 290 470, 260 470 C 230 470, 225 400, 200 380 ' +
  'C 175 400, 170 470, 140 470 C 110 470, 100 420, 90 360 C 70 300, 60 260, 50 180 Z';
const ENAMEL = 'M 76 320 C 64 270, 54 230, 50 180 C 30 60, 130 10, 160 50 C 185 80, 215 80, 240 50 C 270 10, 370 60, 350 180 C 346 230, 336 270, 324 320 Q 200 300 76 320 Z';
const DENTIN =
  'M 84 300 C 72 250, 66 215, 66 175 C 60 95, 128 60, 158 84 C 182 104, 218 104, 242 84 C 272 60, 340 95, 334 175 ' +
  'C 334 215, 328 250, 316 300 C 306 350, 300 420, 290 450 C 284 462, 266 462, 262 448 C 254 410, 240 390, 200 380 ' +
  'C 160 390, 146 410, 138 448 C 134 462, 116 462, 110 450 C 100 420, 94 350, 84 300 Z';
const PULP =
  'M 152 250 C 148 214, 168 200, 182 214 C 192 222, 208 222, 218 214 C 232 200, 252 214, 248 250 ' +
  'C 246 290, 244 320, 246 350 C 250 395, 258 425, 262 444 L 252 446 C 242 420, 230 390, 214 365 L 186 365 ' +
  'C 170 390, 158 420, 148 446 L 138 444 C 142 425, 150 395, 154 350 C 156 320, 154 290, 152 250 Z';
const NERVES = [
  {d: 'M 176 226 C 170 270, 168 320, 166 360 C 160 400, 150 425, 144 442', c: X.nerveRed},
  {d: 'M 190 226 C 186 280, 182 330, 178 362', c: X.nerveBlue},
  {d: 'M 224 226 C 230 270, 232 320, 234 360 C 240 400, 250 425, 256 442', c: X.nerveRed},
  {d: 'M 210 226 C 214 280, 218 330, 222 362', c: X.nerveBlue},
];
// Crack: from the outer enamel of the right cusp, through the dentin, into the pulp horn
export const CRACK_PATHS = [
  {d: 'M 330 70 L 312 98 L 322 122 L 300 150 L 308 176 L 282 198 L 260 214 L 236 222', len: 230, at: 0},
  {d: 'M 312 98 L 338 112', len: 30, at: 0.35},
  {d: 'M 300 150 L 276 140 L 262 156', len: 45, at: 0.5},
  {d: 'M 308 176 L 332 196', len: 32, at: 0.65},
];

const EYE_L = 162;
const EYE_R = 238;
const EYE_Y = 70;

const Eye: React.FC<{cx: number; kind: XEyes; look: [number, number]; side: -1 | 1}> = ({cx, kind, look, side}) => {
  const sw = 6;
  if (kind === 'dizzy')
    return (
      <g>
        <ellipse cx={cx} cy={EYE_Y} rx={36} ry={46} fill={X.white} stroke={X.ink} strokeWidth={sw} />
        <path d={`M ${cx} ${EYE_Y + 2} m -4 0 a 4 4 0 1 1 8 0 a 9 9 0 1 1 -17 0 a 14 14 0 1 1 27 0 a 19 19 0 1 1 -36 0`} stroke={X.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
    );
  if (kind === 'closed')
    return <path d={`M ${cx - 30} ${EYE_Y + 8} Q ${cx} ${EYE_Y + 30} ${cx + 30} ${EYE_Y + 8}`} stroke={X.ink} strokeWidth={sw + 1} fill="none" strokeLinecap="round" />;
  if (kind === 'squeeze')
    return (
      <path
        d={side === -1 ? `M ${cx - 24} ${EYE_Y - 14} L ${cx + 20} ${EYE_Y + 6} L ${cx - 24} ${EYE_Y + 26}` : `M ${cx + 24} ${EYE_Y - 14} L ${cx - 20} ${EYE_Y + 6} L ${cx + 24} ${EYE_Y + 26}`}
        stroke={X.ink}
        strokeWidth={sw + 2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  const rx = kind === 'wide' ? 40 : 36;
  const ry = kind === 'wide' ? 52 : 46;
  const pr = kind === 'wide' ? 9 : 12;
  // pupils sit low in the eye, like the reference's googly eyes
  const px = cx + look[0];
  const py = EYE_Y + 18 + look[1];
  return (
    <g>
      <ellipse cx={cx} cy={EYE_Y} rx={rx} ry={ry} fill={X.white} stroke={X.ink} strokeWidth={sw} />
      <circle cx={px} cy={py} r={pr} fill={X.ink} />
      {kind === 'half' && (
        <>
          <path d={`M ${cx - rx - 2} ${EYE_Y + 2} A ${rx + 2} ${ry + 2} 0 0 1 ${cx + rx + 2} ${EYE_Y + 2} Z`} fill={X.enamelShade} />
          <path d={`M ${cx - rx} ${EYE_Y + 2} L ${cx + rx} ${EYE_Y + 2}`} stroke={X.ink} strokeWidth={sw} strokeLinecap="round" />
        </>
      )}
    </g>
  );
};

const Brows: React.FC<{kind: XBrows}> = ({kind}) => {
  if (kind === 'none') return null;
  const y = EYE_Y - 62;
  const paths: Record<Exclude<XBrows, 'none'>, string> = {
    proud: `M ${EYE_L - 26} ${y + 4} Q ${EYE_L} ${y - 12} ${EYE_L + 22} ${y + 2} M ${EYE_R - 22} ${y + 2} Q ${EYE_R} ${y - 12} ${EYE_R + 26} ${y + 4}`,
    worried: `M ${EYE_L - 24} ${y + 4} L ${EYE_L + 20} ${y - 10} M ${EYE_R - 20} ${y - 10} L ${EYE_R + 24} ${y + 4}`,
    angry: `M ${EYE_L - 24} ${y - 8} L ${EYE_L + 20} ${y + 8} M ${EYE_R - 20} ${y + 8} L ${EYE_R + 24} ${y - 8}`,
    skeptical: `M ${EYE_L - 24} ${y + 6} L ${EYE_L + 20} ${y + 6} M ${EYE_R - 22} ${y - 2} Q ${EYE_R} ${y - 18} ${EYE_R + 24} ${y - 6}`,
  };
  return <path d={paths[kind]} stroke={X.ink} strokeWidth={7} strokeLinecap="round" fill="none" />;
};

const MouthX: React.FC<{kind: XMouth; talk: number; frame: number}> = ({kind, talk, frame}) => {
  const y = 138;
  const s = {stroke: X.ink, strokeWidth: 6, fill: 'none', strokeLinecap: 'round' as const};
  if (talk > 0.08)
    return (
      <g>
        <ellipse cx={200} cy={y + 4} rx={14 + talk * 6} ry={4 + talk * 16} fill={X.line} stroke={X.ink} strokeWidth={4} />
        <ellipse cx={200} cy={y + 8 + talk * 8} rx={8 + talk * 3} ry={2 + talk * 5} fill={X.pulp} />
      </g>
    );
  switch (kind) {
    case 'grin':
      return <path d={`M 178 ${y - 6} Q 200 ${y + 26} 222 ${y - 6} Z`} fill={X.line} stroke={X.ink} strokeWidth={5} strokeLinejoin="round" />;
    case 'o':
      return <ellipse cx={200} cy={y + 4} rx={10} ry={14} fill={X.line} stroke={X.ink} strokeWidth={4} />;
    case 'yell':
      return (
        <g>
          <ellipse cx={200} cy={y + 8} rx={26} ry={24} fill={X.line} stroke={X.ink} strokeWidth={5} />
          <ellipse cx={200} cy={y + 20} rx={14} ry={8} fill={X.pulp} />
        </g>
      );
    case 'frown':
      return <path d={`M 184 ${y + 8} Q 200 ${y - 6} 216 ${y + 8}`} {...s} />;
    case 'flat':
      return <path d={`M 188 ${y} L 212 ${y}`} {...s} />;
    case 'smirk':
      return <path d={`M 186 ${y + 2} Q 204 ${y + 8} 216 ${y - 6}`} {...s} />;
    case 'wavy': {
      const w = Math.sin(frame * 0.9) * 3;
      return <path d={`M 178 ${y} Q 186 ${y - 8 + w} 193 ${y} Q 200 ${y + 8 - w} 207 ${y} Q 214 ${y - 8 + w} 222 ${y}`} {...s} />;
    }
    case 'grit':
      return (
        <g>
          <rect x={176} y={y - 10} width={48} height={22} rx={7} fill={X.white} stroke={X.ink} strokeWidth={5} />
          <path d={`M 176 ${y + 1} L 224 ${y + 1} M 192 ${y - 10} L 192 ${y + 12} M 208 ${y - 10} L 208 ${y + 12}`} stroke={X.ink} strokeWidth={3} />
        </g>
      );
    case 'smile':
    default:
      return <path d={`M 186 ${y - 2} Q 200 ${y + 10} 214 ${y - 2}`} {...s} />;
  }
};

// Thin noodle arms (white with a dark outline), drawn in tooth-local coords
const Arms: React.FC<{kind: XArms; frame: number}> = ({kind, frame}) => {
  if (kind === 'none') return null;
  const w = Math.sin(frame * 0.5) * 4;
  const arms: Record<Exclude<XArms, 'none'>, [string, string]> = {
    rest: ['M 62 170 Q 22 200 26 240', 'M 338 170 Q 378 200 374 240'], // hands kept above the caption line
    flex: ['M 60 180 Q -10 180 -16 110 Q -18 70 18 64', 'M 340 180 Q 410 180 416 110 Q 418 70 382 64'],
    panic: [`M 60 160 Q 6 110 ${90 + w} 70`, `M 340 160 Q 394 110 ${310 - w} 70`],
    reach: ['M 62 170 Q 22 200 26 240', `M 340 180 Q 420 160 ${430 + w} ${90 + w}`],
  };
  const hand = (d: string) => {
    const end = d.trim().split(/[\s,]+/).slice(-2).map(Number);
    return <circle cx={end[0]} cy={end[1]} r={14} fill={X.white} stroke={X.ink} strokeWidth={5} />;
  };
  return (
    <g fill="none" strokeLinecap="round">
      {arms[kind].map((d, i) => (
        <g key={i}>
          <path d={d} stroke={X.ink} strokeWidth={19} />
          <path d={d} stroke={X.white} strokeWidth={10} />
          {kind === 'flex' && <ellipse cx={i ? 404 : -4} cy={128} rx={26} ry={20} fill={X.white} stroke={X.ink} strokeWidth={5} />}
          {hand(d)}
        </g>
      ))}
    </g>
  );
};

export type XToothProps = {
  left: number;
  top: number;
  scale: number;
  eyes?: XEyes;
  brows?: XBrows;
  mouth?: XMouth;
  look?: [number, number];
  arms?: XArms;
  talk?: number;
  pain?: number; // 0..1 pulp turns hot red and glows
  crack?: number; // 0..1 crack progress
  heal?: number; // 0..1 golden glow along the crack (fails)
  sweat?: number;
  throb?: number; // uniform scale around the gum line
  squash?: [number, number];
  tilt?: number;
  faceless?: boolean;
  flip?: boolean; // upper-jaw tooth
  frame?: number;
  shade?: boolean; // soft darker edge + crown highlight (needs <ShadeDefs/> once in the SVG)
  erosion?: number; // 0..1 acid wear: chalky spots on the enamel, then yellow dentin showing at the cusps
  apexTilt?: number; // degrees, rotation around the ROOT APEX (how real teeth tip), not the gum line
};

// Acid wear (erosion): chalky softened spots first, then the enamel is worn through at the cusp tips.
const CHALK = [
  [96, 92, 18, 12],
  [140, 58, 14, 9],
  [262, 52, 15, 10],
  [318, 96, 17, 12],
  [76, 160, 12, 16],
  [334, 170, 11, 15],
];
const Erosion: React.FC<{e: number}> = ({e}) => {
  const chalk = Math.min(1, e / 0.45);
  const worn = Math.max(0, (e - 0.5) / 0.5);
  return (
    <g>
      {CHALK.map(([x, y, rx, ry], i) => {
        const on = Math.max(0, Math.min(1, chalk * 1.4 - i * 0.12));
        return on > 0 ? <ellipse key={i} cx={x} cy={y} rx={rx * (0.6 + on * 0.6)} ry={ry * (0.6 + on * 0.6)} fill="#F1ECE0" stroke="#CFC5B2" strokeWidth={3} strokeDasharray="4 4" opacity={0.95 * on} /> : null;
      })}
      {worn > 0 && (
        <g opacity={Math.min(1, worn * 1.5)}>
          {/* enamel worn through on the outer cusp slopes (clear of the eyes): yellow dentin shows */}
          {['M 56 150 C 50 110, 62 74, 96 50', 'M 304 50 C 338 74, 350 110, 344 150'].map((d, i) => (
            <g key={i}>
              <path d={d} stroke="#B9935A" strokeWidth={14 + 22 * worn} fill="none" strokeLinecap="round" />
              <path d={d} stroke={X.dentin} strokeWidth={8 + 20 * worn} fill="none" strokeLinecap="round" />
            </g>
          ))}
        </g>
      )}
    </g>
  );
};

/** Gradients used by `shade` - render once per SVG. */
export const ShadeDefs: React.FC = () => (
  <defs>
    <linearGradient id="xtShade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0.55" stopColor="#000" stopOpacity={0} />
      <stop offset="0.85" stopColor="#000" stopOpacity={0.1} />
      <stop offset="1" stopColor="#000" stopOpacity={0.16} />
    </linearGradient>
    <radialGradient id="xtDrop">
      <stop offset="0" stopColor="#000" stopOpacity={0.3} />
      <stop offset="1" stopColor="#000" stopOpacity={0} />
    </radialGradient>
  </defs>
);

export const XTooth: React.FC<XToothProps> = ({
  left,
  top,
  scale,
  eyes = 'open',
  brows = 'none',
  mouth = 'smile',
  look = [0, 0],
  arms = 'rest',
  talk = 0,
  pain = 0,
  crack = 0,
  heal = 0,
  sweat = 0,
  throb = 1,
  squash = [1, 1],
  tilt = 0,
  faceless = false,
  flip = false,
  frame = 0,
  shade = false,
  erosion = 0,
  apexTilt = 0,
}) => {
  const ax = 200;
  const ay = 320;
  const inner = `translate(${ax} ${ay}) rotate(${tilt + (flip ? 180 : 0)}) scale(${squash[0] * throb} ${squash[1] * throb}) translate(${-ax} ${-ay})`;
  return (
    <g transform={`translate(${left} ${top}) scale(${scale})`}>
      <g transform={`rotate(${apexTilt} 200 465)`}>
      <g transform={inner}>
        {!faceless && !flip && <Arms kind={arms} frame={frame} />}
        {/* cross-section layers */}
        <path d={OUTER} fill={X.dentinDark} stroke={X.line} strokeWidth={5} strokeLinejoin="round" />
        <path d={ENAMEL} fill={X.enamel} stroke={X.line} strokeWidth={5} strokeLinejoin="round" />
        <path d={DENTIN} fill={X.dentin} stroke={X.dentinDark} strokeWidth={3} strokeLinejoin="round" />
        {shade ? (
          <path d="M 70 150 C 66 110, 84 74, 116 58" stroke={X.white} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.95} />
        ) : (
          <path d="M 304 70 C 326 100, 334 140, 332 170" stroke={X.white} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.9} />
        )}
        <path d={PULP} fill={X.pulp} stroke={X.pulpDark} strokeWidth={4} strokeLinejoin="round" />
        {NERVES.map((n, i) => (
          <path key={i} d={n.d} stroke={n.c} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.85} />
        ))}
        {erosion > 0 && <Erosion e={erosion} />}
        {shade && <path d={OUTER} fill="url(#xtShade)" />}
        {pain > 0 && (
          <g>
            <path d={PULP} fill={X.red} opacity={0.65 * pain} />
            <path d={PULP} fill="none" stroke="#FF6B5A" strokeWidth={22} opacity={0.35 * pain} strokeLinejoin="round" />
          </g>
        )}
        {crack > 0 &&
          CRACK_PATHS.map((c, i) => {
            const p = Math.max(0, Math.min(1, (crack - c.at) / (1 - c.at)));
            if (p <= 0) return null;
            const dash = {strokeDasharray: c.len, strokeDashoffset: c.len * (1 - p)};
            return (
              <g key={i} fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d={c.d} stroke={X.red} strokeWidth={16} opacity={0.35 + 0.25 * pain} {...dash} />
                {heal > 0 && <path d={c.d} stroke={X.gold} strokeWidth={26} opacity={0.8 * heal} {...dash} />}
                <path d={c.d} stroke={X.line} strokeWidth={6} {...dash} />
              </g>
            );
          })}
        {!faceless && (
          // an upper (flipped) tooth keeps an upright face, near its crown tips
          <g transform={flip ? 'rotate(180 200 96)' : undefined}>
            <Brows kind={brows} />
            <Eye cx={EYE_L} kind={eyes} look={look} side={-1} />
            <Eye cx={EYE_R} kind={eyes} look={look} side={1} />
            <MouthX kind={mouth} talk={talk} frame={frame} />
          </g>
        )}
        {Array.from({length: sweat}).map((_, i) => {
          const spots = [
            [92, 60],
            [312, 52],
            [76, 120],
            [330, 118],
          ];
          const [sx, sy] = spots[i % spots.length];
          const t = ((frame + i * 9) % 24) / 24;
          return (
            <path
              key={i}
              transform={`translate(${sx} ${sy + t * 40})`}
              d="M 0 -20 C 8 -8, 14 0, 14 6 A 14 14 0 0 1 -14 6 C -14 0, -8 -8, 0 -20 Z"
              fill="#9ED8FF"
              stroke={X.ink}
              strokeWidth={4}
              opacity={t < 0.8 ? 1 : (1 - t) * 5}
            />
          );
        })}
      </g>
      </g>
    </g>
  );
};

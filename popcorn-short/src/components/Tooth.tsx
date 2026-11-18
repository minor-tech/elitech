import React from 'react';
import {C} from '../theme';

export type Eyes = 'closed' | 'open' | 'wide' | 'squeeze' | 'half' | 'relief';
export type Mouth = 'smile' | 'flat' | 'frown' | 'wavy' | 'o' | 'grit' | 'grin' | 'none';
export type Brows = 'none' | 'proud' | 'worried' | 'determined';
export type Armor = {
  crack?: number; // 0..1 how far the crack has spread
  chip?: boolean; // a piece is missing from the right cusp (dentin shows)
  shine?: number; // 0..1 sweep position of a shine band; omit for none
};

export const TOOTH_PATH =
  'M 50 180 C 30 60, 130 10, 160 50 C 185 80, 215 80, 240 50 C 270 10, 370 60, 350 180 ' +
  'C 340 260, 330 300, 310 360 C 300 420, 290 470, 260 470 C 230 470, 225 400, 200 380 ' +
  'C 175 400, 170 470, 140 470 C 110 470, 100 420, 90 360 C 70 300, 60 260, 50 180 Z';

type Props = {
  left: number;
  top: number;
  scale: number;
  eyes?: Eyes;
  mouth?: Mouth;
  look?: [number, number];
  sweat?: number; // number of sweat drops
  frame?: number; // drives sweat drip / wobble
  darkCircles?: boolean;
  redTint?: number; // 0..1
  squash?: [number, number];
  tilt?: number;
  throb?: number; // extra uniform scale (pulse)
  faceless?: boolean;
  brows?: Brows;
  armor?: Armor;
  talk?: number; // 0..1 loudness of this tooth's voice right now -> talking mouth
  overlay?: React.ReactNode; // drawn in front of the face, in tooth-local coords
  children?: React.ReactNode; // drawn in tooth-local coordinates (e.g. arms)
};

const EYE_L = 145;
const EYE_R = 255;
const EYE_Y = 190;

const Eye: React.FC<{cx: number; kind: Eyes; look: [number, number]; side: -1 | 1}> = ({
  cx,
  kind,
  look,
  side,
}) => {
  const ink = C.ink;
  switch (kind) {
    case 'closed':
      return (
        <path
          d={`M ${cx - 30} ${EYE_Y} Q ${cx} ${EYE_Y + 26} ${cx + 30} ${EYE_Y}`}
          stroke={ink}
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'squeeze':
      // > <
      return (
        <path
          d={
            side === -1
              ? `M ${cx - 26} ${EYE_Y - 22} L ${cx + 22} ${EYE_Y} L ${cx - 26} ${EYE_Y + 22}`
              : `M ${cx + 26} ${EYE_Y - 22} L ${cx - 22} ${EYE_Y} L ${cx + 26} ${EYE_Y + 22}`
          }
          stroke={ink}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case 'half':
      return (
        <g>
          <circle cx={cx} cy={EYE_Y} r={34} fill="#fff" stroke={ink} strokeWidth={7} />
          <circle cx={cx + look[0]} cy={EYE_Y + 12 + look[1]} r={14} fill={ink} />
          {/* heavy eyelid */}
          <path
            d={`M ${cx - 38} ${EYE_Y + 4} A 38 38 0 0 1 ${cx + 38} ${EYE_Y + 4} Z`}
            fill={C.toothShade}
          />
          <path
            d={`M ${cx - 36} ${EYE_Y + 4} L ${cx + 36} ${EYE_Y + 4}`}
            stroke={ink}
            strokeWidth={8}
            strokeLinecap="round"
          />
        </g>
      );
    case 'wide':
    case 'relief': {
      const r = kind === 'wide' ? 46 : 42;
      return (
        <g>
          <circle cx={cx} cy={EYE_Y} r={r} fill="#fff" stroke={ink} strokeWidth={7} />
          <circle cx={cx + look[0]} cy={EYE_Y + look[1]} r={kind === 'wide' ? 11 : 20} fill={ink} />
          {kind === 'relief' && (
            <>
              <circle cx={cx + look[0] - 7} cy={EYE_Y + look[1] - 8} r={7} fill="#fff" />
              <circle cx={cx + look[0] + 6} cy={EYE_Y + look[1] + 7} r={3.5} fill="#fff" />
            </>
          )}
        </g>
      );
    }
    case 'open':
    default:
      return (
        <g>
          <circle cx={cx} cy={EYE_Y} r={36} fill="#fff" stroke={ink} strokeWidth={7} />
          <circle cx={cx + look[0]} cy={EYE_Y + look[1]} r={17} fill={ink} />
          <circle cx={cx + look[0] - 6} cy={EYE_Y + look[1] - 6} r={5} fill="#fff" />
        </g>
      );
  }
};

const MouthShape: React.FC<{kind: Mouth; frame: number}> = ({kind, frame}) => {
  const ink = C.ink;
  const common = {stroke: ink, strokeWidth: 9, fill: 'none', strokeLinecap: 'round' as const};
  switch (kind) {
    case 'smile':
      return <path d="M 172 262 Q 200 286 228 262" {...common} />;
    case 'grin':
      return (
        <path
          d="M 150 255 Q 200 330 250 255 Z"
          fill={C.red}
          stroke={ink}
          strokeWidth={9}
          strokeLinejoin="round"
        />
      );
    case 'flat':
      return <path d="M 178 272 L 222 272" {...common} />;
    case 'frown':
      return <path d="M 168 285 Q 200 255 232 285" {...common} />;
    case 'wavy': {
      const w = Math.sin(frame * 0.9) * 4;
      return (
        <path
          d={`M 150 275 Q 162 ${258 + w} 175 275 Q 188 ${292 - w} 200 275 Q 212 ${258 + w} 225 275 Q 238 ${292 - w} 250 275`}
          {...common}
        />
      );
    }
    case 'o':
      return <ellipse cx={200} cy={278} rx={18} ry={24} fill={ink} />;
    case 'grit':
      return (
        <g>
          <rect x={150} y={256} width={100} height={40} rx={12} fill="#fff" stroke={ink} strokeWidth={8} />
          <path d="M 150 276 L 250 276 M 175 256 L 175 296 M 200 256 L 200 296 M 225 256 L 225 296" stroke={ink} strokeWidth={5} />
        </g>
      );
    default:
      return null;
  }
};

export const Tooth: React.FC<Props> = ({
  left,
  top,
  scale,
  eyes = 'open',
  mouth = 'smile',
  look = [0, 0],
  sweat = 0,
  frame = 0,
  darkCircles = false,
  redTint = 0,
  squash = [1, 1],
  tilt = 0,
  throb = 1,
  faceless = false,
  brows = 'none',
  armor,
  talk = 0,
  overlay,
  children,
}) => {
  // anchor: bottom-centre of the visible crown (gum line, local y=360)
  const ax = 200;
  const ay = 360;
  return (
    <g transform={`translate(${left} ${top}) scale(${scale})`}>
      <g
        transform={`translate(${ax} ${ay}) rotate(${tilt}) scale(${squash[0] * throb} ${squash[1] * throb}) translate(${-ax} ${-ay})`}
      >
        {children}
        <path d={TOOTH_PATH} fill={C.tooth} stroke={C.toothOutline} strokeWidth={12} strokeLinejoin="round" />
        {/* flat shading + shine */}
        <path d="M 300 120 C 330 170, 325 230, 305 300" stroke={C.toothShade} strokeWidth={22} fill="none" strokeLinecap="round" />
        <ellipse cx={100} cy={120} rx={14} ry={24} fill={C.toothShade} transform="rotate(-25 100 120)" />
        {redTint > 0 && (
          <path d={TOOTH_PATH} fill={C.red} opacity={0.55 * redTint} stroke="none" />
        )}
        {armor && <ArmorShell {...armor} />}
        {!faceless && (
          <g>
            <BrowShape kind={brows} />
            {darkCircles && (
              <>
                <path d={`M ${EYE_L - 34} ${EYE_Y + 44} Q ${EYE_L} ${EYE_Y + 66} ${EYE_L + 34} ${EYE_Y + 44}`} stroke="#9A86A8" strokeWidth={10} fill="none" strokeLinecap="round" />
                <path d={`M ${EYE_R - 34} ${EYE_Y + 44} Q ${EYE_R} ${EYE_Y + 66} ${EYE_R + 34} ${EYE_Y + 44}`} stroke="#9A86A8" strokeWidth={10} fill="none" strokeLinecap="round" />
              </>
            )}
            <Eye cx={EYE_L} kind={eyes} look={look} side={-1} />
            <Eye cx={EYE_R} kind={eyes} look={look} side={1} />
            {talk > 0.08 ? (
              <g>
                <ellipse cx={200} cy={276} rx={20 + talk * 6} ry={6 + talk * 24} fill={C.ink} />
                <ellipse cx={200} cy={286 + talk * 10} rx={10 + talk * 3} ry={3 + talk * 7} fill={C.red} />
              </g>
            ) : (
              <MouthShape kind={mouth} frame={frame} />
            )}
          </g>
        )}
        {Array.from({length: sweat}).map((_, i) => {
          const spots = [
            [338, 110],
            [62, 130],
            [350, 230],
            [48, 250],
          ];
          const [sx, sy] = spots[i % spots.length];
          const cycle = 24;
          const t = ((frame + i * 9) % cycle) / cycle;
          const dy = t * 50;
          const op = t < 0.8 ? 1 : (1 - t) * 5;
          return (
            <path
              key={i}
              transform={`translate(${sx} ${sy + dy})`}
              d="M 0 -26 C 10 -10, 18 0, 18 8 A 18 18 0 0 1 -18 8 C -18 0, -10 -10, 0 -26 Z"
              fill="#8FD3FF"
              stroke={C.ink}
              strokeWidth={5}
              opacity={op}
            />
          );
        })}
        {overlay}
      </g>
    </g>
  );
};

const BrowShape: React.FC<{kind: Brows}> = ({kind}) => {
  if (kind === 'none') return null;
  const d =
    kind === 'proud'
      ? `M ${EYE_L - 32} ${EYE_Y - 44} Q ${EYE_L} ${EYE_Y - 62} ${EYE_L + 30} ${EYE_Y - 48} M ${EYE_R - 30} ${EYE_Y - 48} Q ${EYE_R} ${EYE_Y - 62} ${EYE_R + 32} ${EYE_Y - 44}`
      : kind === 'worried'
        ? `M ${EYE_L - 30} ${EYE_Y - 46} L ${EYE_L + 28} ${EYE_Y - 64} M ${EYE_R - 28} ${EYE_Y - 64} L ${EYE_R + 30} ${EYE_Y - 46}`
        : `M ${EYE_L - 30} ${EYE_Y - 64} L ${EYE_L + 28} ${EYE_Y - 46} M ${EYE_R - 28} ${EYE_Y - 46} L ${EYE_R + 30} ${EYE_Y - 64}`;
  return <path d={d} stroke={C.ink} strokeWidth={11} strokeLinecap="round" fill="none" />;
};

// Enamel armour: a polished cap over the crown, gold trim, an ENAMEL name plate.
const ARMOR =
  'M 44 128 C 26 50, 128 2, 160 42 C 185 72, 215 72, 240 42 C 272 2, 374 50, 356 128 Q 200 104 44 128 Z';
const CRACK = 'M 306 50 L 294 68 L 312 82 L 297 100 L 308 118';
const CRACK_LEN = 95;

const ArmorShell: React.FC<Armor> = ({crack = 0, chip = false, shine}) => (
  <g>
    <defs>
      <linearGradient id="armorFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#C9CED8" />
      </linearGradient>
      <clipPath id="armorClip">
        <path d={ARMOR} />
      </clipPath>
    </defs>
    <path d={ARMOR} fill="url(#armorFill)" stroke="#6E7380" strokeWidth={12} strokeLinejoin="round" />
    {shine !== undefined && (
      <g clipPath="url(#armorClip)">
        <rect x={-120 + shine * 560} y={-20} width={46} height={220} fill="#FFFFFF" opacity={0.95} transform={`skewX(-24)`} />
        <rect x={-60 + shine * 560} y={-20} width={16} height={220} fill="#FFFFFF" opacity={0.8} transform={`skewX(-24)`} />
      </g>
    )}
    <path d="M 44 128 Q 200 104 356 128" stroke={C.gold} strokeWidth={14} fill="none" strokeLinecap="round" />
    <path d="M 44 128 Q 200 104 356 128" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.35} />
    <circle cx={86} cy={110} r={7} fill={C.gold} stroke={C.ink} strokeWidth={3} />
    <circle cx={314} cy={110} r={7} fill={C.gold} stroke={C.ink} strokeWidth={3} />
    <rect x={112} y={70} width={176} height={38} rx={12} fill={C.gold} stroke={C.ink} strokeWidth={5} />
    <text x={200} y={90} textAnchor="middle" dominantBaseline="middle" fontFamily="Fredoka" fontWeight={700} fontSize={30} fill={C.ink} letterSpacing={2}>
      ENAMEL
    </text>
    {chip && <path d="M 286 22 L 322 30 L 330 58 L 302 52 Z" fill="#FFF3D1" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />}
    {crack > 0 && (
      <path
        d={CRACK}
        stroke={C.ink}
        strokeWidth={7}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={CRACK_LEN}
        strokeDashoffset={CRACK_LEN * (1 - Math.min(1, crack))}
      />
    )}
  </g>
);

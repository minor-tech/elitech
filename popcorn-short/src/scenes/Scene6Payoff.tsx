import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame} from 'remotion';
import {Stage} from '../components/Stage';
import {Mouth} from '../components/Mouth';
import {Kernel} from '../components/Kernel';
import {Clock} from '../components/Clock';
import {TextCard} from '../components/TextCard';
import {Confetti} from '../components/Effects';
import {C, FPS, GAP, SPRING, clamp, squash} from '../theme';

export const S6_GRAB = 16;
export const S6_OUT = 20; // kernel leaves the gap (pop)
export const S6_CONFETTI = 30;
const DEEP = GAP.y + 16;
const ANG = -50; // tweezers axis, pointing up-right

const DentistHand: React.FC<{x: number; y: number; closed: number}> = ({x, y, closed}) => {
  const open = (1 - closed) * 14;
  const g = C.toothOutline;
  return (
    <g transform={`translate(${x} ${y}) rotate(${ANG})`}>
      {/* tweezers: two tapered arms meeting at the hand */}
      <path d={`M 0 ${-4 - open} L 360 -20 L 360 -6 Z`} fill="#D8D8E0" stroke={g} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M 0 ${4 + open} L 360 20 L 360 6 Z`} fill="#D8D8E0" stroke={g} strokeWidth={6} strokeLinejoin="round" />
      {/* gloved hand */}
      <ellipse cx={420} cy={0} rx={90} ry={72} fill="#fff" stroke={g} strokeWidth={10} />
      <ellipse cx={350} cy={-38} rx={44} ry={22} fill="#fff" stroke={g} strokeWidth={9} />
      <ellipse cx={345} cy={34} rx={40} ry={20} fill="#fff" stroke={g} strokeWidth={9} />
      <ellipse cx={372} cy={60} rx={36} ry={18} fill="#fff" stroke={g} strokeWidth={9} />
      <rect x={480} y={-80} width={260} height={160} rx={30} fill="#fff" stroke={g} strokeWidth={10} />
      <rect x={490} y={-82} width={34} height={164} rx={12} fill={C.toothShade} stroke={g} strokeWidth={6} />
    </g>
  );
};

// 27-30s: next morning, dentist POV, one smooth pull. Confetti. The end.
export const Scene6Payoff: React.FC = () => {
  const f = useCurrentFrame();
  const reach = spring({frame: f, fps: FPS, config: SPRING});
  const pull = interpolate(f, [S6_OUT, S6_OUT + 16], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const rad = (ANG * Math.PI) / 180;
  const restX = GAP.x + 6;
  const restY = DEEP - 30;
  const startD = 1100;
  const d = interpolate(reach, [0, 1], [startD, 0]) + pull * 1100;
  const tipX = restX + Math.cos(rad) * d;
  const tipY = restY + Math.sin(rad) * d;
  const closed = interpolate(f, [S6_GRAB - 2, S6_GRAB], [0, 1], clamp);
  const holding = f >= S6_GRAB;
  const freed = f >= S6_OUT;
  const jumpSq = squash(f, S6_OUT, 0.12);
  return (
    <Stage
      bg={C.bg}
      world={
        <g>
          {/* dentist lamp glow */}
          <defs>
            <radialGradient id="lamp">
              <stop offset="0%" stopColor="#FFF6B0" stopOpacity={1} />
              <stop offset="100%" stopColor={C.bg} stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle cx={170} cy={170} r={330} fill="url(#lamp)" />
          <circle cx={170} cy={170} r={95} fill="#FFF6B0" stroke={C.gold} strokeWidth={14} />
          <circle cx={170} cy={170} r={60} fill="#FFFFFF" />
          <Mouth
            frame={f}
            hero={{
              eyes: freed ? 'relief' : 'squeeze',
              mouth: freed ? 'grin' : 'grit',
              look: [10, -10],
              squash: jumpSq,
              sweat: freed ? 0 : 2,
            }}
            neighbor={{squash: jumpSq}}
            behind={!holding ? <Kernel x={GAP.x} y={DEEP} rotate={8} size={96} face="sleep" /> : null}
            front={
              <g>
                {holding && <Kernel x={tipX - 2} y={tipY + 30} rotate={8 + pull * 40} size={96} face="shock" />}
                <DentistHand x={tipX} y={tipY} closed={closed} />
                <Confetti frame={f} start={S6_CONFETTI} x={480} y={1000} />
              </g>
            }
          />
        </g>
      }
      overlay={
        <g>
          <Clock time="9:00 AM" />
          <TextCard lines={['...and you’ll feel', 'very stupid.']} start={12} />
        </g>
      }
    />
  );
};

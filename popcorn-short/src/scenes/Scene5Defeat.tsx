import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Stage} from '../components/Stage';
import {Mouth} from '../components/Mouth';
import {Kernel} from '../components/Kernel';
import {Clock} from '../components/Clock';
import {TextCard} from '../components/TextCard';
import {Zzz} from '../components/Effects';
import {C, GAP, bounce, clamp, squash} from '../theme';

export const S5_THUMB = 46;
const DEEP = GAP.y + 16;

const ThumbsDown: React.FC<{t: number; wiggle: number}> = ({t, wiggle}) => {
  // Tooth-local coords. Shoulder on the tooth's left side; the arm swings up
  // beside the head and holds a fist with the thumb pointing DOWN.
  const rot = interpolate(t, [0, 1], [-12, 0]) + wiggle;
  const g = C.toothOutline;
  const arm = 'M 0 0 Q -70 -40 -62 -150';
  return (
    <g transform={`translate(135 250) rotate(${rot})`}>
      <path d={arm} stroke={g} strokeWidth={46} fill="none" strokeLinecap="round" />
      <path d={arm} stroke="#fff" strokeWidth={28} fill="none" strokeLinecap="round" />
      {/* thumb pointing down, on the outer side of the fist */}
      <rect x={-122} y={-196} width={36} height={110} rx={18} fill="#fff" stroke={g} strokeWidth={9} />
      {/* fist */}
      <rect x={-104} y={-232} width={84} height={78} rx={28} fill="#fff" stroke={g} strokeWidth={9} />
      <path d="M -82 -230 L -82 -176 M -62 -232 L -62 -176 M -42 -230 L -42 -178" stroke={g} strokeWidth={5} />
    </g>
  );
};

// 22-27s: slumped, wrecked, 5:47 AM, defeated thumbs down.
export const Scene5Defeat: React.FC = () => {
  const f = useCurrentFrame();
  const sag = 0.9 + Math.sin(f / 14) * 0.01;
  const thumb = bounce(f, S5_THUMB - 8);
  const wiggle = f > S5_THUMB ? Math.sin((f - S5_THUMB) * 0.5) * 6 * Math.exp(-(f - S5_THUMB) / 25) : 0;
  const clockPop = bounce(f, 0);
  const clockScale = interpolate(clockPop, [0, 1], [1.6, 1]);
  const thumbSq = squash(f, S5_THUMB, 0.06);
  return (
    <Stage
      bg={C.bg}
      world={
        <Mouth
          frame={f}
          hero={{
            eyes: 'half',
            mouth: 'frown',
            darkCircles: true,
            tilt: -7,
            look: [6, 4],
            squash: [(2 - sag) * thumbSq[0], sag * thumbSq[1]],
            children: f >= S5_THUMB - 8 ? <ThumbsDown t={thumb} wiggle={wiggle} /> : null,
          }}
          behind={<Kernel x={GAP.x} y={DEEP} rotate={8} size={96} face="sleep" />}
          front={<Zzz frame={f} x={GAP.x + 20} y={1120} opacity={interpolate(f, [10, 20], [0, 1], clamp)} />}
        />
      }
      overlay={
        <g>
          <g transform={`translate(915 220) scale(${clockScale}) translate(-115 -50)`}>
            <Clock time="5:47 AM" x={0} y={0} />
          </g>
          <TextCard lines={["You'll see this", 'dentist tomorrow.']} start={10} />
        </g>
      }
    />
  );
};

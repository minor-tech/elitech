import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {Stage} from '../components/Stage';
import {Mouth} from '../components/Mouth';
import {Kernel} from '../components/Kernel';
import {Clock} from '../components/Clock';
import {Zzz} from '../components/Effects';
import {C, GAP, bounce, clamp, fontFamily, squash} from '../theme';

export const S2_IMPACT = 80; // local frame the kernel wedges in (pop)
export const S2_SNAP = 92; // eyes snap open

// 3-7s: the kernel tumbles down in slow motion and wedges into the gap.
export const Scene2Culprit: React.FC = () => {
  const f = useCurrentFrame();
  const fallT = interpolate(f, [6, S2_IMPACT], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const ky = interpolate(fallT, [0, 1], [-120, GAP.y]);
  const kx = GAP.x + Math.sin(fallT * Math.PI * 1.5) * 60 * (1 - fallT);
  const krot = interpolate(fallT, [0, 1], [-200, 8]);
  const kSquash = squash(f, S2_IMPACT, 0.3);
  const toothSquash = squash(f, S2_IMPACT, 0.06);
  const snapSquash = squash(f, S2_SNAP, 0.12);
  const awake = f >= S2_SNAP;
  const bang = bounce(f, S2_SNAP);

  return (
    <Stage
      bg={C.bg}
      world={
        <Mouth
          frame={f}
          hero={{
            eyes: awake ? 'wide' : 'closed',
            mouth: awake ? 'o' : 'smile',
            squash: awake ? snapSquash : toothSquash,
            look: awake ? [12, 0] : [0, 0],
          }}
          neighbor={{squash: toothSquash}}
          behind={
            <g>
              {/* slow-motion trail */}
              {f < S2_IMPACT &&
                [1, 2, 3].map((i) => (
                  <Kernel key={i} x={kx} y={ky - i * 34} rotate={krot - i * 10} size={96} opacity={0.12 * (4 - i)} />
                ))}
              <Kernel x={kx} y={ky} rotate={krot} size={96} squash={kSquash} />
            </g>
          }
          front={
            <g>
              {f < S2_IMPACT - 4 && <Zzz frame={f} x={330} y={960} />}
              {awake && (
                <text
                  x={250}
                  y={940}
                  fontFamily={fontFamily}
                  fontWeight={700}
                  fontSize={150}
                  fill={C.gold}
                  stroke={C.ink}
                  strokeWidth={12}
                  paintOrder="stroke"
                  transform={`translate(250 940) scale(${bang}) rotate(-12) translate(-250 -940)`}
                >
                  !
                </text>
              )}
            </g>
          }
        />
      }
      overlay={<Clock time="3:01 AM" />}
    />
  );
};

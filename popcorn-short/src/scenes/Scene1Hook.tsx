import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Stage} from '../components/Stage';
import {Tooth} from '../components/Tooth';
import {Gum} from '../components/Gum';
import {Clock} from '../components/Clock';
import {TextCard} from '../components/TextCard';
import {Zzz} from '../components/Effects';
import {C, bounce} from '../theme';

// 0-3s: black screen, one peaceful tooth, "3 AM" on the alarm clock.
export const Scene1Hook: React.FC = () => {
  const f = useCurrentFrame();
  const breathe = 1 + Math.sin(f / 9) * 0.018;
  const clockPop = bounce(f, -12); // already landed on frame 0 (thumbnail)
  return (
    <Stage
      bg={C.night}
      world={
        <g>
          {/* soft moonlight pool so the tooth reads on black */}
          <defs>
            <radialGradient id="moon">
              <stop offset="0%" stopColor="#3A2F45" stopOpacity={1} />
              <stop offset="100%" stopColor="#000" stopOpacity={0} />
            </radialGradient>
          </defs>
          <ellipse cx={540} cy={1250} rx={520} ry={420} fill="url(#moon)" />
          <Tooth left={540 - 200 * 1.2} top={1420 - 350 * 1.2} scale={1.2} eyes="closed" mouth="smile" squash={[2 - breathe, breathe]} frame={f} />
          <Gum dim={0.55} />
          <Zzz frame={f} x={640} y={1000} />
        </g>
      }
      overlay={
        <g>
          <g transform={`translate(540 260) scale(${1.35 * clockPop}) translate(-115 -50)`}>
            <Clock time="3:00 AM" x={0} y={0} />
          </g>
          <TextCard lines={['You finally', 'fall asleep.']} start={4} y={540} />
        </g>
      }
    />
  );
};

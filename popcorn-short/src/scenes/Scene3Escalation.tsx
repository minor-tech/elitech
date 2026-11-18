import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Stage} from '../components/Stage';
import {Mouth} from '../components/Mouth';
import {Kernel} from '../components/Kernel';
import {Clock} from '../components/Clock';
import {TextCard} from '../components/TextCard';
import {PulseGlow, Zzz} from '../components/Effects';
import {C, GAP, clamp, shake} from '../theme';
import type {Eyes, Mouth as MouthKind} from '../components/Tooth';

// Pulses come faster and faster after 2s of fake peace.
const buildPulses = () => {
  const out: number[] = [];
  let t = 76;
  let gap = 30;
  while (t < 206) {
    out.push(t);
    t += gap;
    gap = Math.max(5, Math.round(gap * 0.8));
  }
  return out;
};
export const S3_PULSES = buildPulses();

// 7-14s: try to ignore it... then the throbbing starts.
export const Scene3Escalation: React.FC = () => {
  const f = useCurrentFrame();
  const past = S3_PULSES.filter((p) => p <= f);
  const n = past.length; // pulses so far
  const last = past[past.length - 1];
  const since = last === undefined ? 999 : f - last;

  // throb + red flush decay after each pulse
  const kick = Math.exp(-since / 4);
  const throb = 1 + 0.07 * kick;
  const redTint = n === 0 ? 0 : Math.min(1, 0.25 + n * 0.07) * kick + Math.min(0.35, n * 0.03);
  // screen shake only on pulses, amplitude grows with each pulse
  const amp = n === 0 ? 0 : (4 + n * 2.4) * Math.max(0, 1 - since / 9);
  const sh = shake(f, amp);

  let eyes: Eyes = 'closed';
  let mouth: MouthKind = 'flat';
  let sweat = 0;
  if (f < 12) {
    eyes = 'wide';
    mouth = 'o';
  } else if (n === 0) {
    eyes = 'closed';
    mouth = 'smile';
  } else if (n <= 2) {
    eyes = since < 6 ? 'wide' : 'closed';
    mouth = 'frown';
    sweat = n === 2 ? 1 : 0;
  } else if (n <= 5) {
    eyes = 'squeeze';
    mouth = 'wavy';
    sweat = 2;
  } else {
    eyes = since < 3 ? 'wide' : 'squeeze';
    mouth = 'grit';
    sweat = 4;
  }

  const peaceZ = interpolate(f, [16, 26, 66, 74], [0, 1, 1, 0], clamp);

  return (
    <Stage
      bg={C.bg}
      shakeXY={sh}
      world={
        <Mouth
          frame={f}
          hero={{eyes, mouth, sweat, redTint, throb, look: [10, 0]}}
          neighbor={{throb: 1 + 0.02 * kick}}
          glow={<PulseGlow frame={f} pulses={S3_PULSES} x={GAP.x} y={GAP.y} />}
          behind={<Kernel x={GAP.x} y={GAP.y} rotate={8} size={96} face={n > 0 ? 'smug' : 'none'} />}
          front={peaceZ > 0 ? <Zzz frame={f} x={330} y={960} opacity={peaceZ} /> : null}
        />
      }
      overlay={
        <g>
          <Clock time={n < 4 ? '3:12 AM' : '3:40 AM'} />
          <TextCard lines={['You try to sleep']} start={6} />
          <TextCard lines={['through it.']} start={S3_PULSES[0] + 2} />
        </g>
      }
    />
  );
};

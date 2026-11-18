import React from 'react';
import {Easing, Sequence, interpolate, spring, useCurrentFrame} from 'remotion';
import {Stage} from '../components/Stage';
import {Mouth} from '../components/Mouth';
import {Kernel} from '../components/Kernel';
import {Clock} from '../components/Clock';
import {FailStamp, SpeedLines} from '../components/Effects';
import {C, FPS, GAP, MAIN, SPRING, clamp, fontFamily, squash} from '../theme';

export const ATTEMPT = 60; // each attempt is a 2s hard cut
export const STAMP_AT = 44;
const STAMP = {x: 540, y: 700};
const DEEP = GAP.y + 16; // kernel sits deeper after the tongue

// ---------- a) Tongue: pushes, kernel goes DEEPER (boing) ----------
export const TONGUE_HIT = 20;
const TongueAttempt: React.FC = () => {
  const f = useCurrentFrame();
  const inT = spring({frame: f - 2, fps: FPS, config: SPRING});
  const outT = interpolate(f, [32, 44], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const tipX = interpolate(inT, [0, 1], [1180, GAP.x + 44]) + outT * 700;
  const tipY = GAP.y - 40;
  const hit = f >= TONGUE_HIT;
  const kY = interpolate(f, [TONGUE_HIT, TONGUE_HIT + 4], [GAP.y, DEEP], clamp);
  const kSq = squash(f, TONGUE_HIT, 0.3);
  const tSq = squash(f, TONGUE_HIT, 0.08);
  const tongueSq = squash(f, TONGUE_HIT, 0.18);
  return (
    <Stage
      bg={C.bg}
      world={
        <Mouth
          frame={f}
          hero={{eyes: hit ? 'squeeze' : 'open', mouth: hit ? 'wavy' : 'smile', look: [16, -4], squash: tSq, redTint: hit ? Math.max(0, 1 - (f - TONGUE_HIT) / 20) : 0, sweat: hit ? 1 : 0}}
          neighbor={{squash: tSq}}
          behind={<Kernel x={GAP.x} y={kY} rotate={8} size={96} face={hit ? 'smug' : 'shock'} squash={kSq} />}
          front={
            <g transform={`translate(${tipX} ${tipY}) scale(${tongueSq[1]} ${tongueSq[0]})`}>
              <rect x={0} y={-95} width={700} height={190} rx={95} fill={C.tongue} stroke={C.gumDark} strokeWidth={12} />
              <path d="M 70 0 L 600 0" stroke={C.gumDark} strokeWidth={8} strokeLinecap="round" opacity={0.6} />
              <ellipse cx={60} cy={-40} rx={26} ry={14} fill="#FFB3C4" />
            </g>
          }
        />
      }
      overlay={
        <g>
          <Clock time="3:58 AM" />
          <FailStamp frame={f} at={STAMP_AT} {...STAMP} />
        </g>
      }
    />
  );
};

// ---------- b) Toothbrush: three jabs, kernel dodges like a boss ----------
export const BRUSH_JABS = [14, 25, 36];
const BrushAttempt: React.FC = () => {
  const f = useCurrentFrame();
  const enter = spring({frame: f, fps: FPS, config: SPRING});
  // jab: quick extension along the brush axis
  let jab = 0;
  let dodge = 0;
  BRUSH_JABS.forEach((j, i) => {
    const t = f - j;
    if (t >= -4 && t < 8) {
      jab = Math.max(jab, interpolate(t, [-4, 0, 8], [0, 1, 0], clamp));
      const dir = i % 2 === 0 ? -1 : 1;
      dodge = dir * interpolate(t, [-4, -1, 6, 8], [0, 1, 1, 0], clamp);
    }
  });
  const ang = -38; // brush comes from the upper right
  const rad = (ang * Math.PI) / 180;
  const restDist = interpolate(enter, [0, 1], [900, 120]);
  const dist = restDist - jab * 150;
  const hx = GAP.x + Math.cos(rad) * dist;
  const hy = GAP.y - 70 + Math.sin(rad) * dist;
  const lastJab = [...BRUSH_JABS].reverse().find((j) => f >= j) ?? -100;
  const tSq = squash(f, lastJab, 0.07);
  return (
    <Stage
      bg={C.bg}
      world={
        <Mouth
          frame={f}
          hero={{eyes: f >= BRUSH_JABS[0] ? 'squeeze' : 'open', mouth: f >= BRUSH_JABS[0] ? 'grit' : 'smile', look: [14, -6], squash: tSq, sweat: f >= BRUSH_JABS[1] ? 2 : 0}}
          neighbor={{squash: tSq}}
          behind={<Kernel x={GAP.x + dodge * 46} y={DEEP - Math.abs(dodge) * 30} rotate={8 + dodge * 20} size={96} face="angry" />}
          front={
            <g transform={`translate(${hx} ${hy}) rotate(${ang})`}>
              {/* head pointing toward the gap (local -x is the tip) */}
              <rect x={-20} y={-40} width={150} height={52} rx={18} fill="#FFFFFF" stroke={C.toothOutline} strokeWidth={8} />
              {[0, 1, 2, 3, 4].map((i) => (
                <rect key={i} x={-8 + i * 26} y={-2} width={18} height={44} rx={6} fill="#FFFFFF" stroke={C.toothOutline} strokeWidth={5} />
              ))}
              <rect x={120} y={-38} width={560} height={44} rx={22} fill={C.gold} stroke={C.ink} strokeWidth={9} />
            </g>
          }
        />
      }
      overlay={
        <g>
          <Clock time="4:16 AM" />
          {/* boss bar */}
          <g transform="translate(240 420)">
            <text x={300} y={-26} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={52} fill="#fff" stroke={C.ink} strokeWidth={12} paintOrder="stroke">
              BOSS: KERNEL
            </text>
            <rect x={0} y={0} width={600} height={46} rx={23} fill={C.ink} />
            <rect x={8} y={8} width={584} height={30} rx={15} fill={C.red} />
            <rect x={16} y={12} width={560} height={8} rx={4} fill="#FF8C8C" />
          </g>
          <FailStamp frame={f} at={STAMP_AT} {...STAMP} />
        </g>
      }
    />
  );
};

// ---------- c) Floss: gets stuck, tooth panics ----------
export const FLOSS_STUCK = 18;
const FlossAttempt: React.FC = () => {
  const f = useCurrentFrame();
  const down = spring({frame: f, fps: FPS, config: SPRING});
  // fork y: descends, then tries to yank up (but the string stays stuck)
  const yank = f >= FLOSS_STUCK + 4 ? Math.abs(Math.sin((f - FLOSS_STUCK) * 0.9)) * 120 : 0;
  const forkY = interpolate(down, [0, 1], [380, GAP.y - 150]) - yank;
  const stuckX = GAP.x;
  const stuckY = GAP.y - 24;
  const stuck = f >= FLOSS_STUCK - 4;
  const vib = stuck ? Math.sin(f * 2.3) * 10 : 0;
  const L = {x: GAP.x - 180, y: forkY};
  const R = {x: GAP.x + 180, y: forkY};
  const mid = stuck ? {x: stuckX + vib, y: stuckY} : {x: GAP.x, y: forkY};
  const panic = f >= FLOSS_STUCK + 4;
  const jitter = panic ? Math.sin(f * 3.1) * 3 : 0;
  const tSq = squash(f, FLOSS_STUCK, 0.07);
  const handleRot = -25;
  return (
    <Stage
      bg={C.bg}
      world={
        <g>
          {panic && <SpeedLines frame={f} cx={MAIN.left + 200 * MAIN.scale} cy={1230} r1={330} r2={480} />}
          <Mouth
            frame={f}
            hero={{eyes: panic ? 'wide' : 'open', mouth: panic ? 'o' : 'smile', look: panic ? [Math.sin(f) * 8, 0] : [14, 0], sweat: panic ? 4 : 0, tilt: jitter, squash: tSq}}
            neighbor={{squash: tSq}}
            behind={<Kernel x={GAP.x} y={DEEP} rotate={8} size={96} face="smug" />}
            front={
              <g>
                {/* floss string */}
                <path d={`M ${L.x} ${L.y} L ${mid.x} ${mid.y} L ${R.x} ${R.y}`} stroke={C.toothOutline} strokeWidth={13} fill="none" strokeLinejoin="round" />
                <path d={`M ${L.x} ${L.y} L ${mid.x} ${mid.y} L ${R.x} ${R.y}`} stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinejoin="round" />
                {/* floss pick (fork + handle) */}
                <g transform={`translate(${GAP.x} ${forkY})`}>
                  <path d="M -180 0 L -180 -70 Q -180 -110 -130 -110 L 130 -110 Q 180 -110 180 -70 L 180 0" stroke={C.ink} strokeWidth={34} fill="none" strokeLinecap="round" />
                  <path d="M -180 0 L -180 -70 Q -180 -110 -130 -110 L 130 -110 Q 180 -110 180 -70 L 180 0" stroke={C.redSoft} strokeWidth={20} fill="none" strokeLinecap="round" />
                  <g transform={`translate(0 -110) rotate(${handleRot})`}>
                    <rect x={-22} y={-330} width={44} height={330} rx={22} fill={C.redSoft} stroke={C.ink} strokeWidth={8} />
                  </g>
                </g>
              </g>
            }
          />
        </g>
      }
      overlay={
        <g>
          <Clock time="4:43 AM" />
          <FailStamp frame={f} at={STAMP_AT} {...STAMP} />
        </g>
      }
    />
  );
};

// ---------- d) Water: kernel floats up, mocks, drops right back ----------
export const WATER_REWEDGE = 40;
const WaterAttempt: React.FC = () => {
  const f = useCurrentFrame();
  const glassIn = spring({frame: f, fps: FPS, config: SPRING});
  const pour = interpolate(f, [6, 12, 26, 30], [0, 1, 1, 0], clamp);
  const level = interpolate(f, [8, 24, 34, 40], [1920, 920, 920, 1920], {...clamp, easing: Easing.inOut(Easing.quad)});
  const floatT = interpolate(f, [14, 26], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
  const sinkT = interpolate(f, [34, WATER_REWEDGE], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const ky = interpolate(floatT, [0, 1], [DEEP, 800]) + sinkT * (DEEP - 800) + Math.sin(f * 0.35) * 10 * floatT * (1 - sinkT);
  const kRot = 8 + Math.sin(f * 0.3) * 18 * floatT * (1 - sinkT);
  const free = floatT > 0.2 && sinkT < 0.9;
  const kSq = squash(f, WATER_REWEDGE, 0.3);
  const tSq = squash(f, WATER_REWEDGE, 0.08);
  const hopeful = f >= 18 && f < WATER_REWEDGE;
  const wave = (x: number) => Math.sin(x / 60 + f * 0.4) * 14;
  const waterPath =
    `M -20 ${level + wave(0)} ` +
    Array.from({length: 12}, (_, i) => `L ${i * 100} ${level + wave(i * 100)}`).join(' ') +
    ` L 1100 ${level + wave(1100)} L 1100 1940 L -20 1940 Z`;
  const glassX = interpolate(glassIn, [0, 1], [-300, 200]);
  return (
    <Stage
      bg={C.bg}
      world={
        <g>
          <Mouth
            frame={f}
            hero={{
              eyes: hopeful ? 'relief' : f >= WATER_REWEDGE ? 'wide' : 'open',
              mouth: hopeful ? 'grin' : f >= WATER_REWEDGE ? 'frown' : 'smile',
              look: free ? [14, -14] : [14, 0],
              squash: tSq,
            }}
            neighbor={{squash: tSq}}
            behind={!free ? <Kernel x={GAP.x} y={ky} rotate={kRot} size={96} face={f >= WATER_REWEDGE ? 'smug' : 'mock'} squash={kSq} /> : null}
            front={
              <g>
                {free && <Kernel x={GAP.x} y={ky} rotate={kRot} size={110} face="mock" />}
                {/* water */}
                <path d={waterPath} fill="#DDF4FF" opacity={0.6} stroke="#8FD3FF" strokeWidth={8} />
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const bt = ((f * 3 + i * 47) % 200) / 200;
                  const by = 1700 - bt * (1700 - level);
                  return level < 1900 && by > level + 20 ? (
                    <circle key={i} cx={160 + i * 150 + Math.sin(f * 0.3 + i) * 12} cy={by} r={10 + (i % 3) * 5} fill="none" stroke="#fff" strokeWidth={5} />
                  ) : null;
                })}
                {/* pour stream */}
                {pour > 0 && (
                  <path d={`M ${glassX + 110} 600 Q ${glassX + 150} ${900} ${glassX + 140} ${600 + 1300 * pour}`} stroke="#5BB8F0" strokeWidth={34} fill="none" strokeLinecap="round" opacity={0.85} />
                )}
                {/* the glass */}
                <g transform={`translate(${glassX} 560) rotate(${interpolate(pour, [0, 1], [0, 70])})`}>
                  <path d="M -70 -110 L 70 -110 L 55 110 L -55 110 Z" fill="#FFFFFF" fillOpacity={0.7} stroke={C.toothOutline} strokeWidth={10} strokeLinejoin="round" />
                  <path d="M -62 -20 L 62 -20 L 55 105 L -55 105 Z" fill={C.water} opacity={0.8} />
                </g>
              </g>
            }
          />
        </g>
      }
      overlay={
        <g>
          <Clock time="5:09 AM" />
          <FailStamp frame={f} at={STAMP_AT + 2} {...STAMP} />
        </g>
      }
    />
  );
};

// 14-22s: four quick-cut attempts, each ending in a FAIL stamp.
export const Scene4Attempts: React.FC = () => (
  <>
    <Sequence durationInFrames={ATTEMPT} name="a) tongue">
      <TongueAttempt />
    </Sequence>
    <Sequence from={ATTEMPT} durationInFrames={ATTEMPT} name="b) toothbrush">
      <BrushAttempt />
    </Sequence>
    <Sequence from={ATTEMPT * 2} durationInFrames={ATTEMPT} name="c) floss">
      <FlossAttempt />
    </Sequence>
    <Sequence from={ATTEMPT * 3} durationInFrames={ATTEMPT} name="d) water">
      <WaterAttempt />
    </Sequence>
  </>
);

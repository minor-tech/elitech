import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame} from 'remotion';
import {Stage} from '../components/Stage';
import {Tooth} from '../components/Tooth';
import type {Brows, Eyes, Mouth} from '../components/Tooth';
import {Gum} from '../components/Gum';
import {Kernel} from '../components/Kernel';
import type {KernelFace} from '../components/Kernel';
import {TextCard} from '../components/TextCard';
import {Zzz} from '../components/Effects';
import {C, FPS, SPRING, bounce, clamp, fontFamily, squash} from '../theme';
import {Arm, Brush, Cell, Sparkle, SnotBubble, UpperJaw} from './Props';
import {
  BEAT,
  E_SCENES,
  E_TEXT_HOLD,
  E_TEXT_Y,
  HERO,
  KERNEL_HOME,
  LEFT_N,
  PAPILLAE,
  RIGHT_N,
  heroXY,
  kernelIdle,
} from './layout';

type ToothP = React.ComponentProps<typeof Tooth>;

const Row: React.FC<{
  frame: number;
  hero: Partial<ToothP>;
  left?: Partial<ToothP>;
  right?: Partial<ToothP>;
  behindHero?: React.ReactNode;
  front?: React.ReactNode;
}> = ({frame, hero, left = {}, right = {}, behindHero, front}) => (
  <g>
    <Tooth {...LEFT_N} frame={frame} eyes="open" mouth="smile" look={[12, -6]} {...left} />
    <Tooth {...RIGHT_N} frame={frame} eyes="closed" mouth="smile" {...right} />
    {behindHero}
    <Tooth {...HERO} frame={frame} {...hero} />
    <Gum papillae={PAPILLAE} />
    {front}
  </g>
);

const Caption: React.FC<{lines: string[]; start: number}> = ({lines, start}) => (
  <TextCard lines={lines} start={start} y={E_TEXT_Y} hold={E_TEXT_HOLD} />
);

const Mark: React.FC<{ch: string; x: number; y: number; s: number; rot?: number}> = ({ch, x, y, s, rot = -10}) =>
  s <= 0 ? null : (
    <text
      x={0}
      y={0}
      transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}
      textAnchor="middle"
      fontFamily={fontFamily}
      fontWeight={700}
      fontSize={130}
      fill={C.gold}
      stroke={C.ink}
      strokeWidth={12}
      paintOrder="stroke"
    >
      {ch}
    </text>
  );

const HomeKernel: React.FC<{abs: number; face?: KernelFace}> = ({abs, face = 'smug'}) => {
  const {dy, sq} = kernelIdle(abs);
  return <Kernel x={KERNEL_HOME.x} y={KERNEL_HOME.y + dy} size={96} face={face} squash={sq} />;
};

// Right neighbour's Zzz grows every scene (escalating snooze)
const RN_ZZZ = {x: 905, y: 1070};
const RN_MOUTH = {x: 912, y: 1346};
const CHIP_REST = {x: 660, y: 1505};
const ChipPiece: React.FC<{x: number; y: number; rot: number}> = ({x, y, rot}) => (
  <path transform={`translate(${x} ${y}) rotate(${rot})`} d="M -22 -10 L 18 -16 L 24 12 L -8 16 Z" fill="#E6E9EF" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
);

// ---------------------------------------------------------------- 1. The Hero
export const E1Hero: React.FC = () => {
  const f = useCurrentFrame();
  const shine = f >= 18 && f <= 40 ? interpolate(f, [18, 38], [0, 1], clamp) : f >= 100 && f <= 122 ? interpolate(f, [100, 120], [0, 1], clamp) : undefined;
  const bob = 1 + Math.sin((f / BEAT) * Math.PI) * 0.012; // breathes on the beat
  const sp1 = bounce(f, 22) * interpolate(f, [22, 60], [1, 0], clamp);
  const sp2 = bounce(f, 104) * interpolate(f, [104, 142], [1, 0], clamp);
  return (
    <Stage
      bg={C.bg}
      world={
        <Row
          frame={f}
          hero={{eyes: 'open', brows: 'proud', mouth: 'grin', look: [0, -3], armor: {shine}, squash: [2 - bob, bob]}}
          front={
            <g>
              <Zzz frame={f} x={RN_ZZZ.x} y={RN_ZZZ.y} scale={0.8} />
              <Sparkle x={heroXY(340, 20)[0]} y={heroXY(340, 20)[1]} s={sp1} rot={f * 3} />
              <Sparkle x={heroXY(60, 40)[0]} y={heroXY(60, 40)[1]} s={sp1 * 0.6} rot={-f * 3} />
              <Sparkle x={heroXY(40, 30)[0]} y={heroXY(40, 30)[1]} s={sp2} rot={f * 3} />
              <Sparkle x={heroXY(360, 70)[0]} y={heroXY(360, 70)[1]} s={sp2 * 0.6} rot={-f * 3} />
            </g>
          }
        />
      }
      overlay={<Caption lines={['Hardest thing', 'in your body.']} start={-8} />}
    />
  );
};

// ---------------------------------------------------------------- 2. The Chip
export const E2_LAND1 = 18;
export const E2_ON_HEAD = 44;
export const E2_CRACK = 62;
export const E2_HOME = 90;
const HEAD = {x: 540, y: 972};

const arc = (f: number, f0: number, f1: number, a: {x: number; y: number}, b: {x: number; y: number}, h: number) => {
  const t = interpolate(f, [f0, f1], [0, 1], clamp);
  return {x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t - Math.sin(Math.PI * t) * h, t};
};

export const E2Chip: React.FC = () => {
  const f = useCurrentFrame();
  const abs = E_SCENES.s2.from + f;
  // --- kernel path
  let k = {x: 1180, y: KERNEL_HOME.y};
  let kSq: [number, number] = [1, 1];
  let kFace: KernelFace = 'smug';
  let kRot = 0;
  if (f < E2_LAND1) {
    k = arc(f, 0, E2_LAND1, {x: 1180, y: KERNEL_HOME.y}, KERNEL_HOME, 140);
  } else if (f < 26) {
    k = {...KERNEL_HOME};
    kSq = squash(f, E2_LAND1, 0.28);
  } else if (f < E2_ON_HEAD) {
    k = arc(f, 26, E2_ON_HEAD, KERNEL_HOME, HEAD, 260);
    kRot = interpolate(f, [26, E2_ON_HEAD], [0, -360]);
  } else if (f < 66) {
    k = {...HEAD};
    kSq = f >= E2_CRACK ? [1.35, 0.65] : squash(f, E2_ON_HEAD, 0.25);
    kFace = f >= 54 ? 'shock' : 'smug';
  } else if (f < E2_HOME) {
    k = arc(f, 66, E2_HOME, HEAD, KERNEL_HOME, 300);
    kRot = interpolate(f, [66, E2_HOME], [0, 540]);
    kFace = 'shock';
  }
  const atHome = f >= E2_HOME;

  // --- upper jaw slams down, then retracts
  const down = interpolate(f, [E2_ON_HEAD, E2_CRACK], [-600, 452], {...clamp, easing: Easing.in(Easing.cubic)});
  const up = interpolate(f, [70, 92], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const jawY = f < 70 ? down : 452 + (-600 - 452) * up;

  // --- the chipped piece flies off and lands on the gum
  const chipStart = heroXY(306, 36);
  const chip = arc(f, E2_CRACK, 86, {x: chipStart[0], y: chipStart[1]}, CHIP_REST, 220);
  const chipSq = squash(f, 86, 0.3);

  // --- hero acting
  let eyes: Eyes = 'open';
  let mouth: Mouth = 'grin';
  let brows: Brows = 'proud';
  let look: [number, number] = [14, 0];
  if (f >= 30 && f < E2_ON_HEAD) look = [0, -14];
  if (f >= E2_ON_HEAD && f < E2_CRACK) {
    eyes = 'wide';
    mouth = 'o';
    brows = 'none';
    look = [0, -14];
  }
  if (f >= E2_CRACK && f < 72) {
    eyes = 'squeeze';
    mouth = 'grit';
    brows = 'none';
  }
  if (f >= 72) {
    eyes = 'open';
    mouth = f < 100 ? 'flat' : 'o';
    brows = 'worried';
    look = f < 92 ? [6, -16] : [10, 14]; // up at the crack, then down at the chip
  }
  const hSq = f >= E2_CRACK ? squash(f, E2_CRACK, 0.14) : squash(f, E2_ON_HEAD, 0.05);
  const q = bounce(f, 100);
  const crack = interpolate(f, [E2_CRACK, E2_CRACK + 8], [0, 1], clamp);

  return (
    <Stage
      bg={C.bg}
      world={
        <g>
          <Row
            frame={f}
            hero={{eyes, mouth, brows, look, squash: hSq, armor: {crack, chip: f >= E2_CRACK}}}
            left={{eyes: f >= E2_CRACK && f < 76 ? 'squeeze' : 'open', mouth: f >= E2_CRACK && f < 76 ? 'grit' : 'smile', look: [14, -10]}}
            front={
              <g>
                <Zzz frame={f} x={RN_ZZZ.x} y={RN_ZZZ.y} scale={1.1} />
                {f >= E2_CRACK && (
                  <g transform={`translate(${chip.x} ${chip.y}) scale(${chipSq[0]} ${chipSq[1]}) translate(${-chip.x} ${-chip.y})`}>
                    <ChipPiece x={chip.x} y={chip.y} rot={chip.t * 400} />
                  </g>
                )}
                {atHome ? <HomeKernel abs={abs} /> : <Kernel x={k.x} y={k.y} rotate={kRot} size={96} face={kFace} squash={kSq} />}
                <Mark ch="?" x={heroXY(30, 0)[0]} y={heroXY(30, 0)[1] - 20} s={f >= 100 ? q : 0} />
              </g>
            }
          />
          {jawY > -590 && <UpperJaw gumY={jawY} scale={1.45} />}
        </g>
      }
    />
  );
};

// ------------------------------------------------------- 3. The Failed Healing
export const E3_CELLS = 30;
export const E3_GHOST = 95;
const CELL_TARGETS = [
  {x: 410, y: 895},
  {x: 505, y: 850},
  {x: 600, y: 858},
  {x: 690, y: 915},
];

export const E3Healing: React.FC = () => {
  const f = useCurrentFrame();
  const abs = E_SCENES.s3.from + f;
  let eyes: Eyes = 'open';
  let mouth: Mouth = 'flat';
  let brows: Brows = 'worried';
  let look: [number, number] = [6, -16];
  let tilt = 0;
  if (f >= 12 && f < 45) {
    eyes = 'squeeze';
    mouth = 'grit';
    brows = 'none';
    tilt = Math.sin(f * 1.7) * 2; // straining
  } else if (f >= 45 && f < E3_GHOST) {
    eyes = 'relief';
    mouth = 'grin';
    brows = 'none';
    look = [4, -14];
  } else if (f >= E3_GHOST && f < 115) {
    eyes = 'wide';
    mouth = 'o';
  } else if (f >= 115) {
    eyes = 'half';
    mouth = 'frown';
    look = [0, 8];
  }
  const strainGlow = interpolate(f, [12, 30, 45, 55], [0, 1, 1, 0], clamp);
  const bubble = 30 + Math.sin(f * 0.12) ** 2 * 20 + f * 0.22; // keeps inflating

  return (
    <Stage
      bg={C.bg}
      world={
        <Row
          frame={f}
          hero={{eyes, mouth, brows, look, tilt, armor: {crack: 1, chip: true}}}
          left={{look: [12, -12], eyes: f >= E3_GHOST && f < 125 ? 'wide' : 'open', mouth: f >= 115 ? 'frown' : 'smile'}}
          behindHero={
            <g>
              {strainGlow > 0 && (
                <>
                  <defs>
                    <radialGradient id="strain">
                      <stop offset="0%" stopColor={C.gold} stopOpacity={0.55} />
                      <stop offset="100%" stopColor={C.gold} stopOpacity={0} />
                    </radialGradient>
                  </defs>
                  <circle cx={540} cy={1120} r={380} fill="url(#strain)" opacity={strainGlow} />
                </>
              )}
              {CELL_TARGETS.map((t, i) => {
                const start = E3_CELLS + i * 6;
                if (f < start) return null;
                const rise = interpolate(f, [start, start + 34], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.4))});
                const ghost = interpolate(f, [E3_GHOST + i * 4, E3_GHOST + i * 4 + 12], [0, 1], clamp);
                const drift = interpolate(f, [E3_GHOST + i * 4, 172], [0, 1], clamp);
                const wob = Math.sin(f * 0.4 + i) * 6 * (1 - ghost);
                const x = t.x + wob + drift * (i % 2 ? 30 : -30) + Math.sin(f * 0.15 + i) * 10 * drift;
                const y = interpolate(rise, [0, 1], [1200, t.y]) - drift * 200;
                const op = interpolate(f, [150 + i * 3, 168 + i * 3], [1, 0], clamp);
                return <Cell key={i} x={x} y={y} ghost={ghost} opacity={op} scale={1.5} />;
              })}
            </g>
          }
          front={
            <g>
              <Zzz frame={f} x={RN_ZZZ.x} y={RN_ZZZ.y} scale={1.4} />
              <SnotBubble x={RN_MOUTH.x} y={RN_MOUTH.y} r={bubble} />
              <ChipPiece x={CHIP_REST.x} y={CHIP_REST.y} rot={400} />
              <HomeKernel abs={abs} />
            </g>
          }
        />
      }
      overlay={<Caption lines={["Can't heal.", "Can't grow back."]} start={8} />}
    />
  );
};

// --------------------------------------------------------- 4. The Realization
export const E4_GASP = 14;
export const E4Realization: React.FC = () => {
  const f = useCurrentFrame();
  const abs = E_SCENES.s4.from + f;
  const zoom = 1 + 0.07 * spring({frame: f - 2, fps: FPS, config: {mass: 1, damping: 12}}) + f * 0.0002; // punch-in + slow push
  const gasp = f >= E4_GASP;
  const lean = spring({frame: f - E4_GASP, fps: FPS, config: SPRING});
  const ex = bounce(f, E4_GASP);
  const tremble: [number, number] = [Math.sin(f * 2.1) * 2.5, Math.cos(f * 1.7) * 1.5];
  return (
    <Stage
      bg={C.bg}
      world={
        <g transform={`translate(540 1200) scale(${zoom}) translate(-540 -1200)`}>
          <Row
            frame={f}
            hero={{
              // beat: stare at camera -> glance down at the broken chip -> snap back, gulp
              eyes: 'wide',
              brows: 'worried',
              mouth: f >= 70 && f < 112 ? 'o' : 'wavy',
              look: f >= 70 && f < 110 ? [12, 14] : tremble,
              sweat: f > 112 ? 4 : 2,
              armor: {crack: 1, chip: true},
              squash: f >= 110 ? squash(f, 110, 0.1) : squash(f, E4_GASP, 0.06),
            }}
            left={{eyes: gasp ? 'wide' : 'open', mouth: gasp ? 'o' : 'flat', look: [14, -4], tilt: -9 * lean}}
            right={{eyes: gasp ? 'wide' : f >= 4 ? 'half' : 'closed', mouth: gasp ? 'o' : 'flat', look: [-14, -4], tilt: 9 * lean}}
            front={
              <g>
                <SnotBubble x={RN_MOUTH.x} y={RN_MOUTH.y} r={0} popped={f < 8 ? f : -1} />
                <ChipPiece x={CHIP_REST.x} y={CHIP_REST.y} rot={400} />
                <HomeKernel abs={abs} face="smug" />
                <Mark ch="!" x={170} y={1010} s={gasp ? ex * 0.8 : 0} rot={-12} />
                <Mark ch="!" x={910} y={1010} s={gasp ? ex * 0.8 : 0} rot={12} />
              </g>
            }
          />
        </g>
      }
    />
  );
};

// ----------------------------------------------------------- 5. The Takeaway
export const E5_GRAB = 14;
export const E5_TEXT = 24;
export const E5_KERNEL_EXIT = 34;
export const E5Takeaway: React.FC = () => {
  const f = useCurrentFrame();
  const raise = spring({frame: f - 2, fps: FPS, config: SPRING});
  const rot = interpolate(raise, [0, 1], [-70, 0]);
  const shine = f >= 44 && f <= 66 ? interpolate(f, [44, 64], [0, 1], clamp) : undefined;
  const hop = (phase: number) => {
    const t = (f + phase) % (BEAT * 2);
    return squash(t, 0, 0.08); // neighbours bounce on every other beat
  };
  const exit = arc(f, E5_KERNEL_EXIT, E5_KERNEL_EXIT + 20, KERNEL_HOME, {x: 1240, y: 1640}, 90);
  const sp = bounce(f, E5_GRAB);
  const [bx, by] = heroXY(70 - 62, 240 - 400);
  return (
    <Stage
      bg={C.bg}
      world={
        <Row
          frame={f}
          hero={{
            eyes: 'open',
            brows: 'determined',
            mouth: 'grin',
            look: [0, 0],
            armor: {crack: 1, chip: true, shine},
            squash: squash(f, E5_GRAB, 0.1),
            children: (
              <Arm rot={rot}>
                <Brush />
              </Arm>
            ),
          }}
          left={{eyes: 'relief', mouth: 'grin', look: [12, -10], squash: hop(0)}}
          right={{eyes: 'relief', mouth: 'grin', look: [-12, -10], squash: hop(BEAT)}}
          front={
            <g>
              <ChipPiece x={CHIP_REST.x} y={CHIP_REST.y} rot={400} />
              {f < E5_KERNEL_EXIT ? (
                <HomeKernel abs={E_SCENES.s5.from + f} face="shock" />
              ) : (
                exit.t < 1 && <Kernel x={exit.x} y={exit.y} rotate={exit.t * 300} size={96} face="shock" />
              )}
              <Sparkle x={bx - 60} y={by - 10} s={sp * (0.8 + 0.2 * Math.sin(f * 0.3))} rot={f * 2} />
              <Sparkle x={bx + 70} y={by + 40} s={sp * 0.55} rot={-f * 2} />
              <Sparkle x={heroXY(370, 30)[0]} y={heroXY(370, 30)[1]} s={bounce(f, 46) * 0.7} rot={f * 2} />
            </g>
          }
        />
      }
      overlay={<Caption lines={['Protect what', "can't come back."]} start={E5_TEXT} />}
    />
  );
};

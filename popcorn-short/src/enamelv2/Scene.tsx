import React from 'react';
import {Easing, interpolate, random, spring, useCurrentFrame} from 'remotion';
import {Tooth} from '../components/Tooth';
import type {Brows, Eyes, Mouth} from '../components/Tooth';
import {Gum} from '../components/Gum';
import {Zzz} from '../components/Effects';
import {C, FPS, GUM_Y, SPRING, bounce, clamp, squash} from '../theme';
import {HERO, LEFT_N, PAPILLAE, RIGHT_N} from '../enamel/layout';
import {Sparkle, UpperJaw} from '../enamel/Props';
import {dialogue} from '../audio/dialogueData';
import timings from '../audio/voiceTimings.json';

// ------------------------------------------------------------------ helpers
const sp = (f: number, at: number) => spring({frame: f - at, fps: FPS, config: SPRING});
const T = timings as Record<string, {mouth: number[]}>;

/** Loudness of a character's voice at frame f (drives the talking mouth). */
const talkLevel = (f: number, who: 'hero' | 'neighborLeft') => {
  for (const l of dialogue) {
    if (l.character !== who) continue;
    const start = l.fromFrame + (l.delay ?? 0);
    const m = T[l.id]?.mouth;
    if (m && f >= start && f < start + m.length) {
      // a little hysteresis-free smoothing so the mouth doesn't buzz
      const a = m[f - start] ?? 0;
      const b = m[f - start - 1] ?? a;
      return (a * 2 + b) / 3;
    }
  }
  return 0;
};

/** Hero scale over time: puffs up (1.15 w/ overshoot) at 150, deflates (0.95) at 545. */
const heroScale = (f: number) => {
  const puff = interpolate(sp(f, 150), [0, 1], [0, 0.15]);
  const deflate = interpolate(sp(f, 545), [0, 1], [0, 0.2]);
  return 1 + puff - deflate;
};
/** Screen y of the top of the hero's head (centre dip), for things that land on it. */
const headY = (scale: number, dy: number) => GUM_Y - (350 - 72) * HERO.scale * scale + dy;

const arc = (f: number, f0: number, f1: number, a: [number, number], b: [number, number], h: number) => {
  const t = interpolate(f, [f0, f1], [0, 1], clamp);
  return {x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t - Math.sin(Math.PI * t) * h, t};
};

// Crack network in tooth-local coords: radiates from an impact point like glass.
const CRACKS = [
  // impact point above the ENAMEL plate; branches run down both sides of the face
  {d: 'M 236 40 L 262 52 L 290 48 L 306 70 L 318 100 L 312 130 L 330 160 L 322 196 L 340 232 L 332 270', len: 280, at: 0},
  {d: 'M 236 40 L 210 30 L 180 48 L 150 40 L 120 56 L 96 52 L 80 80 L 92 108 L 70 140 L 84 176 L 62 214 L 76 250', len: 330, at: 4},
  {d: 'M 236 40 L 246 18', len: 25, at: 2},
  {d: 'M 318 100 L 346 94', len: 30, at: 30},
  {d: 'M 80 80 L 56 70', len: 28, at: 36},
  {d: 'M 322 196 L 350 206', len: 30, at: 48},
  {d: 'M 84 176 L 58 186', len: 28, at: 54},
];
const CRACK_START = 375;
const CRACK_SPREAD = 90; // 3 seconds

const CrackOverlay: React.FC<{f: number; heal: number}> = ({f, heal}) => {
  const t = f - CRACK_START;
  if (t < 0) return null;
  const glow = f < 540 ? 0.35 + 0.25 * Math.sin(f * 0.35) : 0.22;
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      {CRACKS.map((c, i) => {
        const p = interpolate(t, [c.at, c.at + CRACK_SPREAD - c.at * 0.6], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
        if (p <= 0) return null;
        const dash = {strokeDasharray: c.len, strokeDashoffset: c.len * (1 - p)};
        return (
          <g key={i}>
            <path d={c.d} stroke={C.red} strokeWidth={20} opacity={glow} {...dash} />
            {heal > 0 && <path d={c.d} stroke={C.gold} strokeWidth={30} opacity={heal * 0.75} {...dash} />}
            <path d={c.d} stroke={C.ink} strokeWidth={7} {...dash} />
          </g>
        );
      })}
    </g>
  );
};

export const IceCube: React.FC<{x: number; y: number; rot: number}> = ({x, y, rot}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-42} y={-42} width={84} height={84} rx={16} fill="#DDF4FF" stroke="#5BA9D6" strokeWidth={8} />
    <path d="M -26 -24 L -6 -24" stroke="#fff" strokeWidth={9} strokeLinecap="round" />
    <path d="M -26 -24 L -26 -6" stroke="#fff" strokeWidth={9} strokeLinecap="round" />
  </g>
);
export const Nut: React.FC<{x: number; y: number; rot: number}> = ({x, y, rot}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d="M 0 -46 C 34 -40, 44 10, 0 46 C -44 10, -34 -40, 0 -46 Z" fill="#D9A066" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
    <path d="M 0 -30 C 10 -10, 10 14, 0 32" stroke="#A86F3C" strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);
export const Burst: React.FC<{f: number; at: number; x: number; y: number; kind: 'ice' | 'nut'}> = ({f, at, x, y, kind}) => {
  const t = f - at;
  if (t < 0 || t > 32) return null;
  const n = kind === 'ice' ? 8 : 7;
  return (
    <g opacity={interpolate(t, [20, 32], [1, 0], clamp)}>
      {Array.from({length: n}).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + random(`${kind}a${i}`) * 0.5;
        const v = 14 + random(`${kind}v${i}`) * 10;
        const px = x + Math.cos(a) * v * t;
        const py = y + Math.sin(a) * v * t * 0.8 - 6 * t + 0.6 * t * t;
        const r = random(`${kind}r${i}`) * 360 + t * 25;
        const s = 0.6 + random(`${kind}s${i}`) * 0.6;
        return kind === 'ice' ? (
          <path key={i} transform={`translate(${px} ${py}) rotate(${r}) scale(${s})`} d="M -16 -10 L 14 -18 L 18 12 L -8 16 Z" fill="#DDF4FF" stroke="#5BA9D6" strokeWidth={5} strokeLinejoin="round" />
        ) : (
          <path key={i} transform={`translate(${px} ${py}) rotate(${r}) scale(${s})`} d="M -14 -8 L 12 -14 L 16 10 L -10 12 Z" fill="#D9A066" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        );
      })}
    </g>
  );
};
const Flex: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => {
  if (s <= 0) return null;
  // flexed arm: upper arm + bicep bulge, forearm up, fist. Outline pass first, then fills, so it reads as one shape.
  const parts = (
    <>
      <rect x={-90} y={10} width={130} height={56} rx={28} />
      <ellipse cx={-28} cy={8} rx={46} ry={34} />
      <rect x={10} y={-70} width={52} height={130} rx={26} transform="rotate(12 36 -5)" />
      <circle cx={46} cy={-82} r={34} />
    </>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g fill={C.ink} stroke={C.ink} strokeWidth={18}>{parts}</g>
      <g fill={C.gold}>{parts}</g>
      <path d="M -54 -6 C -40 -20, -18 -20, -6 -8" stroke="#FFE866" strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d="M 30 -96 C 40 -102, 52 -100, 58 -92" stroke="#FFE866" strokeWidth={8} fill="none" strokeLinecap="round" />
    </g>
  );
};
export const Cross: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(8)`} strokeLinecap="round">
      <path d="M -34 -34 L 34 34 M 34 -34 L -34 34" stroke={C.ink} strokeWidth={30} />
      <path d="M -34 -34 L 34 34 M 34 -34 L -34 34" stroke={C.red} strokeWidth={16} />
    </g>
  );

// -------------------------------------------------------------------- scene
export const ToothScene: React.FC = () => {
  const f = useCurrentFrame();

  // ---- HERO -------------------------------------------------------------
  const rise = interpolate(sp(f, -6), [0, 1], [300, 0]); // rises out of the gum
  const scale = heroScale(f);
  const head = headY(scale, rise);

  // food: ice from top-left, nut from top-right; each gets bitten by the upper jaw
  const ICE_LAND = 262, ICE_BITE = 270, NUT_LAND = 310, NUT_BITE = 320;
  const ice = arc(f, 244, ICE_LAND, [-120, 660], [540, head - 42], 180);
  const nut = arc(f, 292, NUT_LAND, [1200, 660], [540, head - 44], 180);
  const jawFor = (land: number, bite: number, up: number) => {
    const target = head - 84 - 486 + 18; // crown tips meet the top of the food
    if (f < land - 4 || f > up + 22) return null;
    if (f <= bite) return interpolate(f, [land - 4, bite], [-620, target], {...clamp, easing: Easing.in(Easing.cubic)});
    return interpolate(f, [up, up + 22], [target, -620], {...clamp, easing: Easing.inOut(Easing.quad)});
  };
  const jawY = jawFor(ICE_LAND, ICE_BITE, ICE_BITE + 4) ?? jawFor(NUT_LAND, NUT_BITE, NUT_BITE + 4);

  let eyes: Eyes = 'open';
  let mouth: Mouth = 'grin';
  let brows: Brows = 'proud';
  let look: [number, number] = [0, -2];
  let sweat = 0;
  let tilt = 0;
  if (f >= 90 && f < 150) {
    mouth = 'smile';
    look = [-14, 0]; // at the sceptical neighbour
  } else if (f >= 240 && f < 360) {
    look = [0, -14]; // watching the food land on its head
    const biting = (f >= ICE_BITE - 2 && f < ICE_BITE + 6) || (f >= NUT_BITE - 2 && f < NUT_BITE + 6);
    if (biting) {
      eyes = 'squeeze';
      mouth = 'grit';
      brows = 'none';
    }
  } else if (f >= 360 && f < 380) {
    mouth = 'grin'; // still confident...
  } else if (f >= 380 && f < 420) {
    eyes = 'wide';
    mouth = 'o';
    brows = 'worried';
    look = [10, -14];
  } else if (f >= 420 && f < 540) {
    eyes = 'squeeze';
    mouth = 'wavy';
    brows = 'none';
    sweat = f > 470 ? 3 : 1;
  } else if (f >= 540 && f < 690) {
    eyes = 'open';
    mouth = 'wavy';
    brows = 'worried';
    look = [-12, 0];
    sweat = 2;
  } else if (f >= 690 && f < 740) {
    eyes = 'squeeze'; // trying to heal
    mouth = 'grit';
    brows = 'none';
    tilt = Math.sin(f * 1.6) * 1.5;
  } else if (f >= 740) {
    eyes = 'half'; // despair
    mouth = 'frown';
    brows = 'worried';
    look = [0, 10];
  }
  if (f >= 810) tilt = -10 * sp(f, 810); // slumps 10 degrees

  const heal = interpolate(f, [700, 724, 732, 736, 742, 746, 768], [0, 1, 0.55, 0.95, 0.4, 0.7, 0], clamp);
  const hitSq = f >= NUT_BITE ? squash(f, NUT_BITE, 0.1) : f >= ICE_BITE ? squash(f, ICE_BITE, 0.1) : squash(f, 380, 0.08);
  const heroTalk = talkLevel(f, 'hero');

  // ---- NEIGHBOUR LEFT (sceptic) -------------------------------------------
  let lEyes: Eyes = 'open';
  let lMouth: Mouth = 'smile';
  let lLook: [number, number] = [12, -4];
  let lTilt = 0;
  if (f >= 96 && f < 140) {
    // eye roll: pupils sweep over the top, head rolls a little
    const a = interpolate(f, [96, 124], [Math.PI, 0], clamp);
    lLook = [Math.cos(a) * 14, -Math.abs(Math.sin(a)) * 16 - 4];
    lTilt = -7 * Math.sin(interpolate(f, [96, 140], [0, Math.PI], clamp));
    lMouth = 'flat';
  } else if (f >= 140 && f < 240) {
    lEyes = 'half';
    lMouth = 'flat';
  } else if (f >= 270 && f < 380) {
    lEyes = 'wide';
    lMouth = 'o';
  } else if (f >= 380 && f < 540) {
    lEyes = 'wide';
    lMouth = 'o';
  } else if (f >= 540 && f < 810) {
    lEyes = 'open';
    lMouth = 'frown';
    lTilt = 9 * sp(f, 548); // leans in toward the hero
  } else if (f >= 810) {
    lEyes = 'open';
    lMouth = 'flat';
    lLook = [0, 0]; // looks at camera
    lTilt = 9 * (1 - sp(f, 810));
  }
  const leftTalk = talkLevel(f, 'neighborLeft');

  // ---- NEIGHBOUR RIGHT (asleep until the gasp) -----------------------------
  const awake = f >= 540;
  const rLook: [number, number] = f >= 810 ? [-16, 0] : [-12, -6];
  const rSq = awake ? squash(f, 540, 0.18) : ([1, 1] as [number, number]);
  const zScale = interpolate(f, [0, 540], [0.9, 1.5], clamp);

  // ---- props ---------------------------------------------------------------
  const sparkle = (at: number) => bounce(f, at) * interpolate(f, [at, at + 40], [1, 0], clamp);
  const flex = f >= 158 && f < 220 ? bounce(f, 158) * interpolate(f, [208, 220], [1, 0], clamp) : 0;
  const cross = f >= 768 && f < 806 ? bounce(f, 768) * interpolate(f, [796, 806], [1, 0], clamp) : 0;

  return (
    <g>
      <Tooth {...LEFT_N} frame={f} eyes={lEyes} mouth={lMouth} look={lLook} tilt={lTilt} talk={leftTalk} />
      <Tooth
        {...RIGHT_N}
        frame={f}
        eyes={awake ? (f < 548 ? 'wide' : 'open') : 'closed'}
        mouth={awake ? (f < 600 ? 'o' : 'frown') : 'smile'}
        look={rLook}
        squash={rSq}
        tilt={awake && f < 810 ? -6 * sp(f, 556) : 0}
      />
      <Tooth
        {...HERO}
        top={HERO.top + rise}
        frame={f}
        eyes={eyes}
        mouth={mouth}
        brows={brows}
        look={look}
        sweat={sweat}
        tilt={tilt}
        throb={scale}
        squash={hitSq}
        talk={heroTalk}
        armor={{shine: f >= 30 && f <= 52 ? interpolate(f, [30, 50], [0, 1], clamp) : undefined}}
        overlay={<CrackOverlay f={f} heal={heal} />}
      />
      <Gum papillae={PAPILLAE} />

      {!awake && <Zzz frame={f} x={905} y={1070} scale={zScale} />}

      {/* sparkles around the title/hero in the hook */}
      <Sparkle x={300} y={900} s={sparkle(10)} rot={f * 3} />
      <Sparkle x={790} y={880} s={sparkle(16) * 0.8} rot={-f * 3} />
      <Sparkle x={250} y={640} s={sparkle(24) * 0.6} rot={f * 2} />
      <Sparkle x={840} y={660} s={sparkle(30) * 0.7} rot={-f * 2} />

      <Flex x={540} y={head - 130} s={flex} />

      {/* the snack attack */}
      {f >= 244 && f < ICE_BITE && <IceCube x={ice.x} y={ice.y} rot={ice.t * 300} />}
      <Burst f={f} at={ICE_BITE} x={540} y={head - 42} kind="ice" />
      {f >= 292 && f < NUT_BITE && <Nut x={nut.x} y={nut.y} rot={-nut.t * 300} />}
      <Burst f={f} at={NUT_BITE} x={540} y={head - 44} kind="nut" />
      {jawY !== null && <UpperJaw gumY={jawY} scale={1.45} />}

      <Cross x={790} y={head - 40} s={cross} />
    </g>
  );
};

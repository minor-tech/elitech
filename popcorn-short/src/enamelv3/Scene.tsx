import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame} from 'remotion';
import {Zzz} from '../components/Effects';
import {FPS, SPRING, clamp, fontFamily, squash} from '../theme';
import {dialogue} from '../audio/dialogueData';
import timings from '../audio/voiceTimings.json';
import {Burst, Cross, IceCube, Nut} from '../enamelv2/Scene';
import {Bone, Cavity, GumBand, UpperGum} from './Backdrop';
import {XTooth} from './XTooth';
import type {XArms, XBrows, XEyes, XMouth} from './XTooth';
import {GUM_LINE, X} from './style';

const sp = (f: number, at: number) => spring({frame: f - at, fps: FPS, config: SPRING});
const T = timings as Record<string, {mouth: number[]}>;
const talkLevel = (f: number, who: 'hero' | 'neighborLeft') => {
  for (const l of dialogue) {
    if (l.character !== who) continue;
    const start = l.fromFrame + (l.delay ?? 0);
    const m = T[l.id]?.mouth;
    if (m && f >= start && f < start + m.length) return ((m[f - start] ?? 0) * 2 + (m[f - start - 1] ?? 0)) / 3;
  }
  return 0;
};

// ---- layout (wide shot) --------------------------------------------------------
const HS = 1.9; // hero scale
export const HERO = {left: 540 - 200 * HS, top: GUM_LINE - 320 * HS, scale: HS};
const NS = 1.4;
const LEFT_N = {left: 60 - 200 * NS, top: GUM_LINE - 320 * NS, scale: NS};
const RIGHT_N = {left: 1020 - 200 * NS, top: GUM_LINE - 320 * NS, scale: NS};
const PAPILLAE = [262, 815];
/** hero tooth-local -> world, accounting for the hero's current scale (anchored at the gum line) */
const heroXY = (lx: number, ly: number, puff = 1): [number, number] => [540 + (lx - 200) * HS * puff, GUM_LINE + (ly - 320) * HS * puff];

// ---- shots: hard cuts between wide and close-ups ---------------------------------
type Shot = {s: number; cx: number; cy: number};
const WIDE: Shot = {s: 1, cx: 540, cy: 960};
const shotAt = (f: number): Shot => {
  if (f >= 390 && f < 540) return {s: 1.4, cx: 610, cy: 900}; // close-up: the crack spreading
  if (f >= 690 && f < 810) return {s: 1.25, cx: 540, cy: 930}; // close-up: the failed heal
  return WIDE;
};

/** Food props scaled up to match the bigger cast. */
const Big: React.FC<{x: number; y: number; children: React.ReactNode}> = ({x, y, children}) => (
  <g transform={`translate(${x} ${y}) scale(1.6) translate(${-x} ${-y})`}>{children}</g>
);

const Label: React.FC<{text: string; x: number; y: number; px: number; py: number; s: number}> = ({text, x, y, px, py, s}) =>
  s <= 0 ? null : (
    <g opacity={Math.min(1, s)}>
      <line x1={x} y1={y + 24} x2={px} y2={py} stroke={X.white} strokeWidth={5} strokeLinecap="round" opacity={0.9} />
      <circle cx={px} cy={py} r={9} fill={X.white} stroke={X.ink} strokeWidth={3} />
      <text
        x={x}
        y={y}
        transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}
        textAnchor="middle"
        fontFamily={fontFamily}
        fontWeight={700}
        fontSize={62}
        fill={X.white}
        style={{filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.35))'}}
      >
        {text}
      </text>
    </g>
  );

export const ToothSceneV3: React.FC = () => {
  const f = useCurrentFrame();
  const shot = shotAt(f);

  // ---- hero timeline ---------------------------------------------------------
  const grow = interpolate(sp(f, -4), [0, 1], [0.25, 1]); // pops up out of the gum
  const puff = 1 + interpolate(sp(f, 150), [0, 1], [0, 0.15]) - interpolate(sp(f, 545), [0, 1], [0, 0.2]);

  const ICE_LAND = 262, ICE_BITE = 270, NUT_LAND = 310, NUT_BITE = 320;
  const headTop = heroXY(200, 40, puff)[1]; // top of the head where the food lands (between the eyes)
  const ice = (() => {
    const t = interpolate(f, [244, ICE_LAND], [0, 1], clamp);
    return {x: -120 + (540 + 120) * t, y: 640 + (headTop - 60 - 640) * t - Math.sin(Math.PI * t) * 220, t};
  })();
  const nut = (() => {
    const t = interpolate(f, [292, NUT_LAND], [0, 1], clamp);
    return {x: 1200 + (540 - 1200) * t, y: 640 + (headTop - 60 - 640) * t - Math.sin(Math.PI * t) * 220, t};
  })();
  // upper jaw: crown tips (local y 25 flipped) meet the top of the food
  const crown = (320 - 25) * HS; // flipped crown tips sit this far below the upper gum line
  const touchFood = headTop - 90 - crown; // tips meet the top of the (scaled) food
  const crunch = headTop + 70 - crown; // ...then crunch through it, almost to the hero's head
  const jawFor = (land: number, bite: number) => {
    if (f < land - 4 || f > bite + 28) return null;
    if (f <= bite) return interpolate(f, [land - 4, bite], [-760, touchFood], {...clamp, easing: Easing.in(Easing.cubic)});
    if (f <= bite + 3) return interpolate(f, [bite, bite + 3], [touchFood, crunch], clamp);
    return interpolate(f, [bite + 6, bite + 28], [crunch, -760], {...clamp, easing: Easing.inOut(Easing.quad)});
  };
  const jawU = jawFor(ICE_LAND, ICE_BITE) ?? jawFor(NUT_LAND, NUT_BITE);

  let eyes: XEyes = 'open';
  let brows: XBrows = 'proud';
  let mouth: XMouth = 'grin';
  let look: [number, number] = [0, 0];
  let arms: XArms = 'rest';
  let sweat = 0;
  let tilt = 0;
  if (f < 90) {
    look = [0, 2];
  } else if (f < 150) {
    mouth = 'smirk';
    look = [-14, 2]; // at the sceptic
  } else if (f < 240) {
    arms = f < 232 ? 'flex' : 'rest';
    look = [-10, 0];
  } else if (f < 360) {
    look = [0, -22]; // eyes up at the food on its head
    arms = 'reach';
    const biting = (f >= ICE_BITE - 2 && f < ICE_BITE + 6) || (f >= NUT_BITE - 2 && f < NUT_BITE + 6);
    if (biting) {
      eyes = 'squeeze';
      mouth = 'grit';
      brows = 'none';
    }
  } else if (f < 390) {
    mouth = 'grin'; // still smug for a beat
  } else if (f < 430) {
    eyes = 'wide';
    brows = 'worried';
    mouth = 'o';
    arms = 'panic';
    look = [12, 6];
  } else if (f < 540) {
    eyes = 'squeeze';
    brows = 'none';
    mouth = 'wavy';
    arms = 'panic';
    sweat = f > 470 ? 4 : 2;
  } else if (f < 690) {
    eyes = 'open';
    brows = 'worried';
    mouth = 'wavy';
    look = [-14, 4];
    sweat = 2;
  } else if (f < 742) {
    eyes = 'squeeze'; // trying to heal
    brows = 'none';
    mouth = 'grit';
    tilt = Math.sin(f * 1.6) * 1.5;
  } else {
    eyes = 'half'; // despair
    brows = 'worried';
    mouth = 'frown';
    look = [0, 10];
  }
  if (f >= 810) tilt = -10 * sp(f, 810);

  const crack = interpolate(f, [376, 466], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
  const pain = f < 390 ? 0 : f < 540 ? 0.55 + 0.45 * Math.abs(Math.sin((f - 390) * 0.18)) : 0.45;
  const heal = interpolate(f, [700, 724, 732, 736, 742, 746, 768], [0, 1, 0.55, 0.95, 0.4, 0.7, 0], clamp);
  const hitSq: [number, number] = f >= NUT_BITE ? squash(f, NUT_BITE, 0.1) : f >= ICE_BITE ? squash(f, ICE_BITE, 0.1) : squash(f, 380, 0.08);

  // ---- neighbour left: the sceptic ---------------------------------------------
  let lEyes: XEyes = 'open';
  let lBrows: XBrows = 'none';
  let lMouth: XMouth = 'smile';
  let lLook: [number, number] = [14, 0];
  let lTilt = 0;
  let lArms: XArms = 'rest';
  if (f >= 90 && f < 140) {
    const a = interpolate(f, [96, 124], [Math.PI, 0], clamp); // eye roll over the top
    lLook = [Math.cos(a) * 14, -Math.abs(Math.sin(a)) * 30];
    lTilt = -7 * Math.sin(interpolate(f, [96, 140], [0, Math.PI], clamp));
    lBrows = 'skeptical';
    lMouth = 'flat';
  } else if (f >= 140 && f < 240) {
    lEyes = 'half';
    lBrows = 'skeptical';
    lMouth = 'smirk';
  } else if (f >= 270 && f < 540) {
    lEyes = 'wide';
    lMouth = 'o';
    lArms = f >= 390 ? 'panic' : 'rest';
  } else if (f >= 540 && f < 810) {
    lBrows = 'worried';
    lMouth = 'frown';
    lTilt = 9 * sp(f, 548); // leans toward the hero
  } else if (f >= 810) {
    lMouth = 'flat';
    lLook = [0, 0]; // to camera
    lTilt = 9 * (1 - sp(f, 810));
  }

  // ---- neighbour right: asleep until the gasp ------------------------------------
  const awake = f >= 540;

  const labelS = (at: number) => (f < 84 ? sp(f, at) : interpolate(f, [84, 92], [1, 0], clamp));
  const cross = f >= 768 && f < 806 ? sp(f, 768) * interpolate(f, [796, 806], [1, 0], clamp) : 0;
  const [crossX, crossY] = heroXY(370, 10, puff);

  return (
    <g>
      <Cavity />
      <g transform={`translate(540 960) scale(${shot.s}) translate(${-shot.cx} ${-shot.cy})`}>
        <Bone />
        <XTooth {...LEFT_N} frame={f} eyes={lEyes} brows={lBrows} mouth={lMouth} look={lLook} tilt={lTilt} arms={lArms} talk={talkLevel(f, 'neighborLeft')} />
        <XTooth
          {...RIGHT_N}
          frame={f}
          eyes={awake ? (f < 548 ? 'wide' : 'open') : 'closed'}
          brows={awake ? 'worried' : 'none'}
          mouth={awake ? (f < 600 ? 'o' : 'frown') : 'smile'}
          look={f >= 810 ? [-16, 0] : [-12, 0]}
          squash={awake ? squash(f, 540, 0.18) : [1, 1]}
          tilt={awake && f < 810 ? -6 * sp(f, 556) : 0}
          arms={awake && f < 600 ? 'panic' : 'rest'}
        />
        <XTooth
          {...HERO}
          frame={f}
          eyes={eyes}
          brows={brows}
          mouth={mouth}
          look={look}
          arms={arms}
          sweat={sweat}
          tilt={tilt}
          throb={puff}
          squash={[hitSq[0] * (2 - grow), hitSq[1] * grow]}
          talk={talkLevel(f, 'hero')}
          pain={pain}
          crack={crack}
          heal={heal}
        />
        <GumBand papillae={PAPILLAE} />

        {!awake && <Zzz frame={f} x={1030} y={850} scale={interpolate(f, [0, 540], [0.9, 1.4], clamp)} />}

        {/* layer labels while the hero introduces itself */}
        <Label text="Enamel" x={870} y={520} px={heroXY(346, 120)[0]} py={heroXY(346, 120)[1]} s={labelS(8)} />
        <Label text="Dentin" x={210} y={520} px={heroXY(96, 230)[0]} py={heroXY(96, 230)[1]} s={labelS(18)} />
        <Label text="Pulp" x={930} y={1110} px={heroXY(232, 250)[0]} py={heroXY(232, 250)[1]} s={labelS(28)} />

        {/* the snack attack */}
        {f >= 244 && f < ICE_BITE && <Big x={ice.x} y={ice.y}><IceCube x={ice.x} y={ice.y} rot={ice.t * 300} /></Big>}
        <Big x={540} y={headTop - 60}><Burst f={f} at={ICE_BITE} x={540} y={headTop - 60} kind="ice" /></Big>
        {f >= 292 && f < NUT_BITE && <Big x={nut.x} y={nut.y}><Nut x={nut.x} y={nut.y} rot={-nut.t * 300} /></Big>}
        <Big x={540} y={headTop - 60}><Burst f={f} at={NUT_BITE} x={540} y={headTop - 60} kind="nut" /></Big>
        {jawU !== null && (
          <g>
            <XTooth left={540 - 200 * HS} top={jawU - 320 * HS} scale={HS} flip faceless />
            <UpperGum y={jawU} />
          </g>
        )}
        <Cross x={crossX} y={crossY} s={cross} />
      </g>
    </g>
  );
};

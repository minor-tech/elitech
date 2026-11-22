import React from 'react';
import {Easing, interpolate, random, spring, useCurrentFrame} from 'remotion';
import {FPS, SPRING, clamp, fontFamily, squash} from '../theme';
import {Cavity} from '../enamelv3/Backdrop';
import {PULP, ShadeDefs, XTooth} from '../enamelv3/XTooth';
import type {XEyes, XToothProps} from '../enamelv3/XTooth';
import {CAPTION_FONT, X} from '../enamelv3/style';
import {Brain, Googly, HardHat, Noodle, PointDown, SoftShadeDefs} from '../gap/Props';
import type {Face} from '../gap/Props';
import {SugarBug} from '../soda/Props';
import {L, TOTAL_FRAMES, dialogue} from '../audio/quietDialogue';
import timings from '../audio/quietTimings.json';

const sp = (f: number, at: number, cfg = SPRING) => spring({frame: f - at, fps: FPS, config: cfg});
const T = timings as unknown as Record<string, {mouth: number[]}>;
export const talkOf = (f: number, who: string) => {
  for (const l of dialogue) {
    if (l.character !== who) continue;
    const m = T[l.id]?.mouth;
    if (m && f >= l.fromFrame && f < l.fromFrame + m.length) return ((m[f - l.fromFrame] ?? 0) * 2 + (m[f - l.fromFrame - 1] ?? 0)) / 3;
  }
  return 0;
};

// ======================================================================= beats (all from the voice timeline)
export const B = (() => {
  const hq1 = L('help').from - 4;
  const crew = L('help').to + 4;
  const push = Math.max(L('good').to + 2, L('party').from - 34);
  const inside1 = L('party').from - 16;
  const told = L('told').from - 6;
  const inside2 = L('told').to + 6;
  const hq2 = L('pushing').from - 50;
  const bone = L('pushing').from - 8;
  const gray = L('almost').from - 44;
  const popShot = L('scream').from - 52;
  const pop = popShot + 14;
  const hq3 = L('scream').from - 18;
  const couldnt = L('scream').to + 4;
  const holdEnd = L('couldnt').to + 60; // 2 s of dead air: the punchline breathes
  const seal = holdEnd + 8;
  const thesis = L('alarm').to + 10;
  return {
    hq1,
    beep: hq1 + 10,
    crew,
    bandaid: L('hurts').to + 2,
    push,
    inside1,
    ghost: inside1 + 10,
    rentSign: inside1 + 4,
    told,
    inside2,
    squat: L('rent').from + 4,
    abscess: inside2 + 6,
    hq2,
    bone,
    gray,
    popShot,
    pop,
    hq3,
    redFlip: hq3 + 6,
    couldnt,
    holdEnd,
    alarm: holdEnd,
    seal,
    vacuum: seal + 6,
    fill: [seal + 40, seal + 78] as const,
    cap: seal + 82,
    sealed: seal + 88,
    thesis,
    total: TOTAL_FRAMES,
  };
})();

/** 2-3 frame holds after impacts: time freezes on the hit. */
const HOLDS: [number, number][] = [
  [B.pop, 3],
  [B.redFlip, 2],
  [B.cap, 3],
];
const held = (f: number) => {
  for (const [at, n] of HOLDS) if (f >= at && f < at + n) return at;
  return f;
};

// ======================================================================= mouth world
const LG = 1250;
const S = 1.3;
const LEFT_X = 268; // the screamer
const RIGHT_X = 812; // the quiet one
const toothAt = (cx: number, s = S) => ({left: cx - 200 * s, top: LG - 320 * s, scale: s});
const APEX: [number, number] = [RIGHT_X - 200 * S + 262 * S, LG - 320 * S + 470 * S]; // quiet tooth, right root tip
const BONE_FACE: [number, number] = [470, 1720];

type Cam = {s: number; cx: number; cy: number};
const HOOK_CAM: Cam = {s: 1.25, cx: 540, cy: 1010};
const QUIET_CAM: Cam = {s: 1.75, cx: RIGHT_X, cy: LG - 320 * S + 140 * S + 220 / 1.75};
const SCREAM_CAM: Cam = {s: 1.6, cx: LEFT_X + 40, cy: LG - 320 * S + 140 * S + 220 / 1.6};
const BONE_CAM: Cam = {s: 1.0, cx: 560, cy: APEX[1] + 70};

const jit = (seed: string) => ({rot: (random(`${seed}r`) - 0.5) * 6, scale: 0.95 + random(`${seed}s`) * 0.1, every: 80 + Math.floor(random(`${seed}b`) * 90), off: Math.floor(random(`${seed}o`) * 90)});
const blink = (f: number, seed: string, e: XEyes): XEyes => {
  const j = jit(seed);
  return e === 'open' && (f + j.off) % j.every < 4 ? 'closed' : e;
};

// ======================================================================= pieces
const Bone: React.FC<{f: number; bonk: number}> = ({f, bonk}) => {
  const y = LG + 70;
  return (
    <g>
      <rect x={-400} y={y} width={1900} height={1400} fill={X.bone} stroke={X.line} strokeWidth={6} />
      {Array.from({length: 60}).map((_, i) => (
        <ellipse key={i} cx={-200 + random(`qb${i}`) * 1500} cy={y + 30 + random(`qy${i}`) * 900} rx={8 + random(`qr${i}`) * 14} ry={6 + random(`qq${i}`) * 9} fill={X.boneDot} opacity={0.7} />
      ))}
      {((f >= B.bone - 10 && f < B.gray) || (f >= B.popShot && f < B.hq3)) && <Googly
        x={BONE_FACE[0] + Math.sin(f * 0.9) * 6 * bonk}
        y={BONE_FACE[1]}
        s={1.8}
        eyes={bonk > 0 ? 'dizzy' : 'wide'}
        brows="worried"
        mouth={bonk > 0 ? 'o' : 'frown'}
        look={[16, -16]}
        talk={talkOf(f, 'bone')}
      />}
      {bonk > 0 &&
        Array.from({length: 5}).map((_, i) => {
          const a = f * 0.2 + (i / 5) * Math.PI * 2;
          return <path key={i} transform={`translate(${BONE_FACE[0] + Math.cos(a) * 150} ${BONE_FACE[1] - 120 + Math.sin(a) * 34}) scale(0.7)`} d="M 0 -30 L 9 -9 L 30 -6 L 13 9 L 18 30 L 0 18 L -18 30 L -13 9 L -30 -6 L -9 -9 Z" fill={X.gold} stroke={X.ink} strokeWidth={5} />;
        })}
    </g>
  );
};

const Gum: React.FC<{teeth: number[]}> = ({teeth}) => {
  const y = LG;
  const pts = [`M -400 ${y + 20}`];
  for (const px of [540]) pts.push(`L ${px - 90} ${y + 16}`, `C ${px - 40} ${y + 10}, ${px - 22} ${y - 76}, ${px} ${y - 80}`, `C ${px + 22} ${y - 76}, ${px + 40} ${y + 10}, ${px + 90} ${y + 16}`);
  pts.push(`L 1500 ${y + 20} L 1500 ${y + 130} L -400 ${y + 130} Z`);
  const d = pts.join(' ');
  return (
    <g>
      <path d={d} fill={X.gum} stroke={X.line} strokeWidth={6} strokeLinejoin="round" />
      <path d={d} fill="url(#gumShadeDown)" />
      {teeth.map((x, i) => (
        <ellipse key={i} cx={x} cy={y + 30} rx={170} ry={34} fill="url(#xtDrop)" />
      ))}
      <path d={`M -300 ${y + 58} Q 540 ${y + 78} 1400 ${y + 58}`} stroke={X.gumLight} strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.85} />
    </g>
  );
};

/** Glowing pus bubble at the root tip. */
const Abscess: React.FC<{x: number; y: number; r: number; f: number; popT?: number}> = ({x, y, r, f, popT = 0}) => {
  if (r <= 0) return null;
  if (popT > 0) {
    // burst: ring + droplets
    return (
      <g opacity={1 - popT}>
        <circle cx={x} cy={y} r={r * (1 + popT * 1.6)} fill="none" stroke="#9BF06A" strokeWidth={16 * (1 - popT)} />
        {Array.from({length: 10}).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <circle key={i} cx={x + Math.cos(a) * r * (1 + popT * 2.4)} cy={y + Math.sin(a) * r * (1 + popT * 2.4)} r={14} fill="#9BF06A" stroke={X.line} strokeWidth={4} />;
        })}
      </g>
    );
  }
  const wob = 1 + Math.sin(f * 0.5) * 0.04;
  return (
    <g>
      <defs>
        <radialGradient id="qAbsGlow">
          <stop offset="0" stopColor="#D8FF9A" stopOpacity={0.9} />
          <stop offset="0.5" stopColor="#8EE65A" stopOpacity={0.55} />
          <stop offset="1" stopColor="#8EE65A" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r * 1.9} fill="url(#qAbsGlow)" opacity={0.6 + 0.2 * Math.sin(f * 0.3)} />
      <ellipse cx={x} cy={y} rx={r * wob} ry={r / wob} fill="#A6EC6E" stroke={X.line} strokeWidth={6} />
      <ellipse cx={x - r * 0.35} cy={y - r * 0.38} rx={r * 0.28} ry={r * 0.16} fill="#F2FFD8" opacity={0.9} />
    </g>
  );
};

/** Root-canal crew: gum cells in hard hats. */
const Cell: React.FC<{x: number; y: number; s?: number; f: number; k: number; face?: Face}> = ({x, y, s = 1, f, k, face}) => {
  const bob = Math.abs(Math.sin(f * 0.7 + k)) * -12;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      <ellipse cx={0} cy={6} rx={78} ry={66} fill={X.gum} stroke={X.line} strokeWidth={7} />
      <ellipse cx={-24} cy={-22} rx={20} ry={10} fill={X.gumLight} />
      <Googly x={0} y={4} s={0.72} eyes="open" brows="angry" mouth="grin" look={[10, 0]} {...face} />
      <HardHat x={2} y={-60} s={1.3} />
    </g>
  );
};

/** The FOR RENT runner: same sign, new message. */
type SignState = 'rent' | 'squatters' | 'sealed';
const SIGN: Record<SignState, [string, string]> = {rent: ['FOR RENT', '#FFFFFF'], squatters: ['SQUATTERS!', '#FF6B6B'], sealed: ['SEALED ✓', '#7BE08F']};
const Sign: React.FC<{x: number; y: number; state: SignState; since: number; f: number; s?: number}> = ({x, y, state, since, f, s = 1}) => {
  const k = sp(f, since, {mass: 1, damping: 9});
  const [text, color] = SIGN[state];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-7} y={-230} width={14} height={230} rx={6} fill="#B98A5A" stroke={X.line} strokeWidth={5} />
      <g transform={`translate(0 -260) rotate(${(1 - k) * -90}) scale(${0.6 + 0.4 * k})`}>
        <rect x={-170} y={-46} width={340} height={92} rx={16} fill="#3B1517" stroke={X.line} strokeWidth={7} />
        <text x={0} y={6} textAnchor="middle" dominantBaseline="middle" fontFamily={CAPTION_FONT} fontSize={52} fill={color}>
          {text}
        </text>
      </g>
    </g>
  );
};

/** The quiet tooth, with an optional inside-out gray sweep (0..1). */
const QuietTooth: React.FC<XToothProps & {gray: number; id: string}> = ({gray, id, ...p}) => {
  const cx = p.left + 200 * p.scale;
  const cy = p.top + 290 * p.scale;
  return (
    <g>
      <XTooth {...p} />
      {gray > 0 && (
        <g>
          <defs>
            <filter id={`${id}f`}>
              <feColorMatrix type="matrix" values="0.26 0.5 0.1 0 0.02  0.26 0.5 0.1 0 0.02  0.26 0.5 0.1 0 0.04  0 0 0 1 0" />
            </filter>
            <mask id={`${id}m`}>
              <circle cx={cx} cy={cy} r={gray * 460 * p.scale} fill="#FFFFFF" />
            </mask>
          </defs>
          <g filter={`url(#${id}f)`} mask={`url(#${id}m)`}>
            <XTooth {...p} />
          </g>
        </g>
      )}
    </g>
  );
};

// ======================================================================= the mouth (outside)
const Mouth: React.FC<{f: number; pop: number}> = ({f, pop}) => {
  const scream = f < B.bandaid + 8;
  const helped = f >= B.bandaid;
  const crewIn = f >= B.crew;
  const gray = interpolate(f, [B.gray + 6, B.popShot - 10], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const dead = gray > 0.62;
  const leftTalk = talkOf(f, 'mo');
  const abR = f >= B.abscess ? interpolate(f, [B.abscess, B.bone + 40, B.popShot], [20, 70, 96], clamp) : 0;
  const popT = f >= B.pop ? Math.min(1, (f - B.pop) / 16) : 0;
  const bonk = f >= B.pop + 2 ? 1 : 0;
  return (
    <g>
      {/* depth: faded back row with seeded jitter */}
      <g opacity={0.4}>
        {[60, 540, 1020].map((x, i) => {
          const j = jit(`bk${i}`);
          return <XTooth key={i} {...toothAt(x, 0.95 * j.scale)} top={LG - 320 * 0.95 - 70} tilt={j.rot} faceless pulp={false} frame={f} />;
        })}
      </g>
      <Bone f={f} bonk={bonk && f < B.pop + 60 ? 1 : 0} />
      {/* screamer */}
      <XTooth
        {...toothAt(LEFT_X)}
        tilt={scream ? Math.sin(f * 0.9) * 2.5 : jit('L').rot}
        squash={scream ? squash(f, 0, 0.04) : [1, 1]}
        shade
        frame={f}
        crack={1}
        pain={helped ? 0.2 : 0.6 + 0.4 * Math.abs(Math.sin(f * 0.35))}
        sweat={helped ? 0 : 3}
        eyes={helped ? blink(f, 'L', 'open') : 'squeeze'}
        brows={helped ? 'none' : 'worried'}
        mouth={helped ? 'smile' : 'yell'}
        arms={helped ? 'rest' : 'panic'}
        look={[10, 0]}
        talk={leftTalk}
      />
      {/* band-aid over the crack once the crew arrives */}
      {f >= B.bandaid && (
        <g transform={`translate(${LEFT_X + 110 * S - 200 * S + 200 * S} ${LG - 320 * S + 150 * S}) rotate(-28) scale(${sp(f, B.bandaid, {mass: 1, damping: 8})})`}>
          <rect x={-70} y={-24} width={140} height={48} rx={22} fill="#F4C9A0" stroke={X.ink} strokeWidth={6} />
          <rect x={-24} y={-20} width={48} height={40} rx={8} fill="#E8B08A" />
        </g>
      )}
      {/* the quiet one */}
      <QuietTooth
        id="qOut"
        gray={gray}
        {...toothAt(RIGHT_X)}
        tilt={jit('R').rot * 0.4}
        shade
        pulp={false}
        frame={f}
        eyes={dead ? 'hollow' : f >= B.hq3 ? 'half' : blink(f, 'R', 'half')}
        brows={dead ? 'none' : 'proud'}
        mouth="smirk"
        arms="rest"
        look={[-14, 0]}
        talk={talkOf(f, 'quiet')}
      />
      <Gum teeth={[LEFT_X, RIGHT_X]} />
      {((f >= B.bone - 10 && f < B.gray) || (f >= B.popShot && f < B.hq3)) && <Abscess x={APEX[0]} y={APEX[1]} r={pop > 0 ? 96 : abR} f={f} popT={popT} />}
      {/* the crew rushes to the screamer */}
      {crewIn &&
        [0, 1, 2].map((k) => {
          const run = sp(f, B.crew + k * 5, {mass: 1, damping: 14});
          const x = -260 + run * (LEFT_X - 170 + k * 120 + 260);
          return <Cell key={k} x={x} y={LG + 40 - (k === 1 ? 40 : 0)} s={0.55} f={f} k={k} face={k === 1 && f >= B.bandaid ? {mouth: 'grin', brows: 'proud'} : undefined} />;
        })}
    </g>
  );
};

// ======================================================================= inside the quiet tooth
// two framings inside: close on the chamber for the party, wider (root tip in shot) for the abscess + seal
const inCfg = (f: number) => {
  const close = f < B.told;
  const seal = f >= B.seal;
  const s = close ? 4.4 : seal ? 2.8 : 3.3;
  const cy = close ? 700 : seal ? 900 : 820;
  return {s, left: 540 - 200 * s, top: cy - 290 * s};
};
let IN = inCfg(0);
const inX = (lx: number) => IN.left + lx * IN.s;
const inY = (ly: number) => IN.top + ly * IN.s;

const Inside: React.FC<{f: number}> = ({f}) => {
  IN = inCfg(f);
  const vac = interpolate(f, [B.vacuum, B.vacuum + 40], [0, 1], clamp);
  const fill = interpolate(f, B.fill, [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const capped = f >= B.cap;
  const sealedPhase = f >= B.seal;
  const abR = sealedPhase ? interpolate(f, [B.seal, B.seal + 30], [60, 0], clamp) : f >= B.abscess ? interpolate(f, [B.abscess, B.abscess + 70], [18, 58], {...clamp, easing: Easing.out(Easing.quad)}) : 0;
  const party = !sealedPhase;
  const lightHue = Math.floor(f / 5) % 3;
  const lights = ['#FF4FA3', '#4FD1FF', '#FFE14F'];
  // sign
  let sign: SignState = 'rent';
  let since = B.rentSign;
  if (f >= B.squat) [sign, since] = ['squatters', B.squat];
  if (f >= B.sealed) [sign, since] = ['sealed', B.sealed];
  return (
    <g>
      <Cavity />
      {/* gum + bone around the roots */}
      <rect x={-60} y={inY(330)} width={1200} height={1400} fill={X.bone} stroke={X.line} strokeWidth={6} />
      {Array.from({length: 40}).map((_, i) => (
        <ellipse key={i} cx={random(`ib${i}`) * 1080} cy={inY(340) + random(`iy${i}`) * 900} rx={10 + random(`ir${i}`) * 14} ry={7 + random(`iq${i}`) * 9} fill={X.boneDot} opacity={0.7} />
      ))}
      <rect x={-60} y={inY(300)} width={1200} height={90} fill={X.gum} stroke={X.line} strokeWidth={6} />
      <XTooth left={IN.left} top={IN.top} scale={IN.s} faceless shade pulp={false} frame={f} />
      {/* the pulp chamber: dead and dark */}
      <g transform={`translate(${IN.left} ${IN.top}) scale(${IN.s})`}>
        <defs>
          <clipPath id="qPulp">
            <path d={PULP} />
          </clipPath>
        </defs>
        <path d={PULP} fill="#2F2430" stroke="#1A141B" strokeWidth={3} />
        <g clipPath="url(#qPulp)">
          {party && <ellipse cx={200} cy={280} rx={60} ry={70} fill={lights[lightHue]} opacity={0.18} />}
          {/* root filling rises from the tips */}
          {fill > 0 && <rect x={100} y={470 - fill * 290} width={200} height={300} fill="#F08A4B" />}
        </g>
      </g>
      {/* the nerve: lying flat, X eyes */}
      {!sealedPhase && (
        <g transform={`translate(${inX(224)} ${inY(354)}) scale(${IN.s * 0.3})`}>
          <path d="M -100 0 C -60 -14, 60 -14, 100 0 C 60 14, -60 14, -100 0 Z" fill="#C97C8C" stroke="#1A141B" strokeWidth={5} />
          {[-28, 28].map((ex) => (
            <path key={ex} d={`M ${ex - 9} -9 L ${ex + 9} 9 M ${ex + 9} -9 L ${ex - 9} 9`} stroke="#1A141B" strokeWidth={5} strokeLinecap="round" />
          ))}
        </g>
      )}
      {/* tiny ghost floating up out of the nerve */}
      {f >= B.ghost && f < B.ghost + 70 && (
        <g opacity={interpolate(f, [B.ghost, B.ghost + 10, B.ghost + 55, B.ghost + 70], [0, 0.85, 0.85, 0], clamp)} transform={`translate(${inX(200) + Math.sin((f - B.ghost) * 0.2) * 14} ${inY(320) - (f - B.ghost) * 3.2})`}>
          <path d="M -26 10 C -26 -40, 26 -40, 26 10 L 26 30 L 14 22 L 4 32 L -6 22 L -16 32 L -26 24 Z" fill="#FFFFFF" stroke="#BFC6D6" strokeWidth={3} />
          <circle cx={-9} cy={-4} r={4} fill="#1A141B" />
          <circle cx={9} cy={-4} r={4} fill="#1A141B" />
          <ellipse cx={0} cy={10} rx={4} ry={5} fill="#1A141B" />
        </g>
      )}
      {/* the squatters: bacteria in party hats */}
      {[0, 1, 2].map((k) => {
        const out = vac > 0 ? Math.min(1, Math.max(0, vac * 1.6 - k * 0.25)) : 0;
        if (out >= 1) return null;
        const homes: [number, number][] = [
          [222, 300],
          [236, 250],
          [176, 236],
        ];
        const [hx, hy] = homes[k];
        const dance = party ? Math.abs(Math.sin(f * 0.45 + k * 1.3)) * -16 : 0;
        const x = inX(hx) + out * (inX(200) - inX(hx));
        const y = inY(hy) + dance - out * 900;
        return <SugarBug key={k} x={x} y={y} s={IN.s > 4 ? 0.75 : 0.56} rot={out * 300} hat={['#FF5A7A', '#5AB8FF', '#FFC44D'][k]} f={f} eyes={out > 0 ? 'wide' : 'half'} mouth={out > 0 ? 'o' : 'grin'} brows="none" look={[0, 0]} talk={k === 0 ? talkOf(f, 'bug') : 0} />;
      })}
      {/* one bug blows up the abscess at the root tip */}
      {f >= B.abscess && !sealedPhase && <SugarBug x={inX(262) + 100} y={inY(470) - 70} s={0.62} f={f} hat="#B57BFF" eyes="squeeze" mouth="o" brows="none" look={[0, 0]} />}
      <Abscess x={inX(262)} y={inY(470) + 6} r={abR} f={f} />
      {/* crew + vacuum at the access hole */}
      {f >= B.seal && (
        <g transform={`translate(0 ${(1 - sp(f, B.seal)) * -500})`}>
          <path d={`M ${inX(200)} ${inY(60)} C ${inX(200)} ${inY(-20)}, ${inX(330)} ${inY(-40)}, 1200 ${inY(-40)}`} stroke="#6B7280" strokeWidth={46} fill="none" strokeLinecap="round" />
          <path d={`M ${inX(200)} ${inY(60)} C ${inX(200)} ${inY(-20)}, ${inX(330)} ${inY(-40)}, 1200 ${inY(-40)}`} stroke="#9CA3AF" strokeWidth={30} fill="none" strokeLinecap="round" />
          <Cell x={inX(105)} y={inY(42)} s={0.62} f={f} k={0} />
          <Cell x={inX(298)} y={inY(42)} s={0.62} f={f} k={2} />
        </g>
      )}
      {f >= B.seal + 4 && !capped && <ellipse cx={inX(200)} cy={inY(66)} rx={60} ry={24} fill="#2F2430" stroke={X.ink} strokeWidth={6} />}
      {capped && (
        <g transform={`translate(${inX(200)} ${inY(72)}) scale(${sp(f, B.cap, {mass: 1, damping: 8})})`}>
          <ellipse rx={78} ry={30} fill="#C7CDD6" stroke={X.ink} strokeWidth={7} />
          <ellipse cx={-20} cy={-8} rx={26} ry={8} fill="#FFFFFF" opacity={0.8} />
        </g>
      )}
      {/* the sign sits on the roof */}
      <Sign x={inX(176)} y={inY(352)} state={sign} since={since} f={f} s={IN.s > 4 ? 0.72 : 0.62} />
    </g>
  );
};

// ======================================================================= Brain HQ: the tooth-status HUD
type Hud = 'pain' | 'quiet' | 'alert';
const ToothIcon: React.FC<{x: number; color: string; label: string}> = ({x, color, label}) => (
  <g transform={`translate(${x} 420)`}>
    <g transform="scale(0.36) translate(-200 -260)">
      <path d="M 50 180 C 30 60, 130 10, 160 50 C 185 80, 215 80, 240 50 C 270 10, 370 60, 350 180 C 340 260, 330 300, 310 360 C 300 420, 290 470, 260 470 C 230 470, 225 400, 200 380 C 175 400, 170 470, 140 470 C 110 470, 100 420, 90 360 C 70 300, 60 260, 50 180 Z" fill={color} />
    </g>
    <text y={120} textAnchor="middle" fontFamily={CAPTION_FONT} fontSize={34} fill="#FFFFFF" opacity={0.85}>
      {label}
    </text>
  </g>
);
const HudPanel: React.FC<{f: number; state: Hud; mini?: boolean}> = ({f, state, mini}) => {
  const blink = Math.floor(f / 6) % 2 === 0;
  const RED = blink ? '#FF4545' : '#992222';
  const GREEN = '#5FD38A';
  const [title, tc, lc, rc] =
    state === 'pain' ? ['PAIN: LEFT MOLAR', blink ? '#FF5050' : '#FF9A9A', RED, GREEN] : state === 'quiet' ? ['ALL QUIET', '#7BE08F', GREEN, GREEN] : ['RIGHT MOLAR: ABSCESS!', blink ? '#FF5050' : '#FF9A9A', GREEN, RED];
  return (
    <g transform={mini ? 'translate(205 -95) scale(0.62)' : undefined}>
      <rect x={200} y={170} width={680} height={460} rx={34} fill="#3A1A1E" stroke={X.ink} strokeWidth={9} />
      <rect x={226} y={196} width={628} height={408} rx={20} fill="#24110F" />
      <text x={540} y={268} textAnchor="middle" fontFamily={CAPTION_FONT} fontSize={state === 'alert' ? 50 : 60} fill={tc}>
        {title}
      </text>
      <ToothIcon x={420} color={lc} label="LEFT" />
      <ToothIcon x={660} color={rc} label="RIGHT" />
      {Array.from({length: 13}).map((_, i) => (
        <rect key={i} x={226} y={204 + i * 31} width={628} height={3} fill="#FFFFFF" opacity={0.04} />
      ))}
    </g>
  );
};
const BrainHQ: React.FC<{f: number; hud: Hud; face: Face; armsUp?: boolean; mug?: boolean; button?: number}> = ({f, hud, face, armsUp = false, mug = false, button = 0}) => {
  const red = hud !== 'quiet';
  const blink = red && Math.floor(f / 6) % 2 === 0;
  return (
    <g>
      <Cavity />
      {red && <path d={`M 540 110 L ${blink ? 120 : 960} -40 L ${blink ? 300 : 780} -40 Z`} fill="#FF4040" opacity={0.25} />}
      <rect x={490} y={100} width={100} height={60} rx={30} fill={red ? (blink ? '#FF3030' : '#B02424') : '#3FA96A'} stroke={X.ink} strokeWidth={7} />
      <HudPanel f={f} state={hud} />
      <path d="M -60 1460 L 1140 1460 L 1140 1990 L -60 1990 Z" fill="#E9CFA9" stroke={X.ink} strokeWidth={8} />
      <rect x={-60} y={1460} width={1200} height={34} fill="#D7B88C" stroke={X.ink} strokeWidth={6} />
      {/* the big red SEND HELP button */}
      <g transform={`translate(890 1462)`}>
        <rect x={-80} y={-24} width={160} height={30} rx={10} fill="#555B66" stroke={X.ink} strokeWidth={6} />
        <ellipse cx={0} cy={-26 + button * 12} rx={56} ry={22} fill={X.red} stroke={X.ink} strokeWidth={6} />
      </g>
      <Brain x={520} y={1170 + (mug ? 30 : 0)} s={1.15} frame={f} armsUp={armsUp} {...face} talk={talkOf(f, 'brain')} />
      {mug && (
        <g transform="translate(250 1380) rotate(-8)">
          <rect x={-46} y={-60} width={92} height={110} rx={14} fill="#FFFFFF" stroke={X.ink} strokeWidth={7} />
          <path d="M 46 -30 C 86 -30, 86 30, 46 26" stroke={X.ink} strokeWidth={8} fill="none" />
          <path d={`M -20 -76 C -30 -100, 0 -110, -10 -${130 + Math.sin(f * 0.2) * 8}`} stroke="#FFFFFF" strokeWidth={6} fill="none" opacity={0.7} />
        </g>
      )}
    </g>
  );
};

// ======================================================================= overlays
const Big: React.FC<{text: string; x: number; y: number; size: number; color: string; s: number; stroke?: number; rot?: number}> = ({text, x, y, size, color, s, stroke = 16, rot = 0}) =>
  s <= 0 ? null : (
    <text x={x} y={y} transform={`translate(${x} ${y}) scale(${s}) rotate(${rot}) skewX(-6) translate(${-x} ${-y})`} textAnchor="middle" dominantBaseline="middle" fontFamily={CAPTION_FONT} fontSize={size} fill={color} stroke={X.ink} strokeWidth={stroke} paintOrder="stroke">
      {text}
    </text>
  );
const Label: React.FC<{text: string; x: number; y: number; from: number; to: number; f: number; arrow?: [number, number]}> = ({text, x, y, from, to, f, arrow}) => {
  if (f < from || f > to) return null;
  const s = Math.min(sp(f, from), interpolate(f, [to - 8, to], [1, 0], clamp));
  return (
    <g>
      {arrow && <path d={`M ${x} ${y + 44} Q ${(x + arrow[0]) / 2} ${y + 90} ${arrow[0]} ${arrow[1]}`} stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" markerEnd="url(#qArrow)" opacity={s} />}
      <text x={x} y={y} transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`} textAnchor="middle" dominantBaseline="middle" fontFamily={fontFamily} fontWeight={700} fontSize={76} fill={X.white} stroke={X.ink} strokeWidth={14} paintOrder="stroke" strokeLinejoin="round">
        {text}
      </text>
    </g>
  );
};
const Inset: React.FC<{f: number; children: React.ReactNode; x?: number; y?: number}> = ({f, children, x = 170, y = 250}) => (
  <g>
    <defs>
      <clipPath id={`qi${x}`}>
        <circle cx={x} cy={y} r={124} />
      </clipPath>
    </defs>
    <circle cx={x} cy={y} r={130} fill={X.bg} stroke={X.white} strokeWidth={10} />
    <g clipPath={`url(#qi${x})`}>{children}</g>
  </g>
);

const Thesis: React.FC<{f: number}> = ({f}) => {
  const a = B.thesis;
  if (f < a) return null;
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2040} fill="#000" opacity={0.4 * Math.min(1, (f - a) / 6)} />
      {['PAIN', 'MEANS', 'ALIVE.'].map((w, i) => (
        <Big key={w} text={w} x={[186, 482, 836][i]} y={520} size={92} color="#FFFFFF" s={sp(f, a + i * 5, {mass: 1, damping: 9})} />
      ))}
      {['QUIET', 'MEANS', 'GONE.'].map((w, i) => (
        <Big key={w} text={w} x={[190, 540, 885][i]} y={680} size={96} color={X.gold} s={sp(f, a + 18 + i * 5, {mass: 1, damping: 8})} stroke={18} />
      ))}
      <g opacity={Math.min(1, sp(f, a + 40))}>
        <Big text="GOT A QUIET TOOTH?" x={540} y={1240} size={70} color="#FFFFFF" s={1} stroke={12} />
        <Big text="GET IT CHECKED. COMMENT" x={500} y={1340} size={62} color="#FFFFFF" s={1} stroke={12} />
        <PointDown x={985} y={1330} s={0.8} bob={Math.sin(f * 0.35) * 10} />
      </g>
    </g>
  );
};

// ======================================================================= camera
const lerp = (a: Cam, b: Cam, t: number): Cam => ({s: a.s + (b.s - a.s) * t, cx: a.cx + (b.cx - a.cx) * t, cy: a.cy + (b.cy - a.cy) * t});
const camAt = (f: number): Cam => {
  if (f < B.crew) return HOOK_CAM;
  if (f < B.push) return lerp(HOOK_CAM, SCREAM_CAM, interpolate(f, [B.crew, B.crew + 24], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)}));
  if (f < B.inside1) {
    // push INTO the quiet tooth
    const t = interpolate(f, [B.push, B.inside1], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
    return lerp(SCREAM_CAM, {s: 4.2, cx: RIGHT_X, cy: LG - 320 * S + 280 * S}, t);
  }
  if (f >= B.bone && f < B.gray) return BONE_CAM;
  if (f >= B.popShot && f < B.hq3) return BONE_CAM;
  return QUIET_CAM;
};

// ======================================================================= root
export const QuietScene: React.FC = () => {
  const f0 = useCurrentFrame();
  const f = held(f0);
  const inHQ1 = f >= B.hq1 && f < B.crew;
  const inHQ2 = f >= B.hq2 && f < B.bone;
  const inHQ3 = f >= B.hq3 && f < B.couldnt;
  const inside = (f >= B.inside1 && f < B.told) || (f >= B.inside2 && f < B.hq2) || f >= B.seal;
  const cam = camAt(f);
  const pop = f >= B.pop ? 1 : 0;
  const shakeAmp = f < B.hq1 ? 2 : f >= B.pop && f < B.pop + 10 ? 16 * (1 - (f - B.pop) / 10) : f >= B.redFlip && f < B.redFlip + 8 ? 10 * (1 - (f - B.redFlip) / 8) : f >= B.cap && f < B.cap + 6 ? 8 : 0;
  const sx = shakeAmp ? (random(`qsx${f0}`) - 0.5) * 2 * shakeAmp : 0;
  const sy = shakeAmp ? (random(`qsy${f0}`) - 0.5) * 2 * shakeAmp : 0;
  const flash = f0 === B.pop || f0 === B.redFlip;
  const whipAt = [B.hq1, B.hq2, B.hq3, B.inside2, B.seal].find((w) => f >= w && f < w + 5);
  const whip = whipAt === undefined ? 0 : (1 - (f - whipAt) / 5) ** 2 * 900;
  // the hold: after "...couldn't", nothing moves for 2 seconds
  const inHold = f >= L('couldnt').to && f < B.holdEnd;
  return (
    <g transform={`translate(${sx + whip} ${sy})`}>
      <defs>
        <marker id="qArrow" viewBox="0 0 10 10" refX={5} refY={5} markerWidth={4} markerHeight={4} orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#FFFFFF" stroke={X.ink} strokeWidth={1} />
        </marker>
      </defs>
      <ShadeDefs />
      <SoftShadeDefs />
      {inHQ1 && <BrainHQ f={f} hud="pain" face={{eyes: 'wide', brows: 'angry', mouth: 'yell', look: [20, 10]}} armsUp={f >= B.beep} button={f >= B.beep && f < B.beep + 8 ? 1 : 0} />}
      {inHQ2 && <BrainHQ f={f} hud="quiet" face={{eyes: 'half', brows: 'none', mouth: 'smile', look: [0, 4]}} mug />}
      {inHQ3 && <BrainHQ f={f} hud={f >= B.redFlip ? 'alert' : 'quiet'} face={f >= B.redFlip ? {eyes: 'wide', brows: 'angry', mouth: 'yell', look: [0, -10]} : {eyes: 'half', brows: 'none', mouth: 'smile', look: [0, 4]}} armsUp={f >= B.redFlip} mug={f < B.redFlip} />}
      {inside && !inHQ1 && !inHQ2 && !inHQ3 && (
        <g>
          <Inside f={f} />
          {(() => {
            IN = inCfg(f);
            return null;
          })()}
          <Label text="Necrotic pulp" x={540} y={200} from={B.inside1 + 16} to={B.told - 2} f={f} arrow={[540, 380]} />
          <Label text="Abscess" x={250} y={1170} from={B.abscess + 10} to={B.hq2 - 2} f={f} arrow={[inX(262) - 40, inY(470)]} />
          <Label text="Root canal" x={540} y={430} from={B.fill[0]} to={B.thesis - 2} f={f} arrow={[540, 640]} />
          {f >= B.seal && (
            <Inset f={f} x={920} y={470}>
              <Brain x={920} y={515} s={0.42} frame={f} headset eyes="open" brows="none" mouth="smile" look={[0, 0]} talk={talkOf(f, 'brain')} />
            </Inset>
          )}
        </g>
      )}
      {!inside && !inHQ1 && !inHQ2 && !inHQ3 && (
        <g>
          <Cavity />
          <g transform={`translate(540 960) scale(${cam.s}) translate(${-cam.cx} ${-cam.cy})`}>
            <Mouth f={f} pop={pop} />
          </g>
          {/* hook: the mini HUD, the split stakes */}
          {f < B.hq1 && (
            <g>
              <HudPanel f={f} state="pain" mini />
              <Big text="VS" x={540} y={640} size={110} color={X.gold} s={sp(f, 6, {mass: 1, damping: 8})} rot={-6} />
            </g>
          )}
          <Label text="Jaw bone" x={540} y={230} from={B.bone + 6} to={B.gray - 2} f={f} />
          {f >= B.gray && f < B.popShot && (
            <Inset f={f} x={910} y={260}>
              <rect x={760} y={110} width={300} height={300} fill="#2F2430" />
              <SugarBug x={910} y={290} s={0.9} f={f} hat="#FF5A7A" eyes="half" mouth="grin" brows="none" look={[0, 0]} talk={talkOf(f, 'bug')} />
            </Inset>
          )}
          {f >= B.pop && f < B.pop + 30 && <Big text="POP!" x={800} y={660} size={150} color="#9BF06A" s={sp(f, B.pop, {mass: 1, damping: 7})} rot={-10} />}
          {/* the hold: the quiet tooth, alone, in dead air */}
          {inHold && <rect x={-60} y={-60} width={1200} height={2040} fill="#000" opacity={0.18} />}
        </g>
      )}
      <Thesis f={f} />
      {flash && <rect x={-100} y={-100} width={1300} height={2200} fill="#FFFFFF" />}
    </g>
  );
};

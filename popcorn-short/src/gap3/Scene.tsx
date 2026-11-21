import React from 'react';
import {Easing, interpolate, random, spring, useCurrentFrame} from 'remotion';
import {FPS, SPRING, clamp, fontFamily, squash} from '../theme';
import {Cavity} from '../enamelv3/Backdrop';
import {ShadeDefs, XTooth} from '../enamelv3/XTooth';
import type {XEyes} from '../enamelv3/XTooth';
import {CAPTION_FONT, X} from '../enamelv3/style';
import {Brain, Forceps, Googly, HardHat, Noodle, PointDown, SoftShadeDefs, Tongue} from '../gap/Props';
import type {Face} from '../gap/Props';
import {L, TOTAL_FRAMES, dialogue} from '../audio/gap3Dialogue';
import timings from '../audio/gap3Timings.json';

const sp = (f: number, at: number, cfg = SPRING) => spring({frame: f - at, fps: FPS, config: cfg});
type TL = Record<string, {mouth: number[]}>;
const T = timings as unknown as TL;
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
  const clampAt = L('fine').to - 4;
  const pop = L('fiiine').from - 6;
  const quizEnd = L('quiz').to + 45;
  const bonk = L('ow').from - 16;
  const implant = L('implant').from - 30;
  const end0 = L('early').to + 4;
  return {
    scream: [L('scream').from, L('scream').to] as const,
    hq1: [L('forceps').from, L('forceps').to] as const,
    lever: L('forceps').from + 18,
    fine: L('fine').from,
    clampAt,
    wiggle: [clampAt + 12, pop - 2] as const,
    squeaks: [clampAt + 16, clampAt + 24, clampAt + 32] as const,
    pop,
    afterPop: L('fiiine').to, // cut to the gap (match-cut framing #1)
    clot: L('clot').from - 8,
    reno: L('clot').from + 8,
    cells: [L('clot').from, L('dont').to + 6] as const,
    poke: L('poke').from - 6,
    dont: [L('dont').from, L('dont').to] as const,
    weeks: [L('dont').to + 6, L('smooth').from] as const,
    smooth: L('smooth').from,
    stop: [L('stop').from, L('stop').to] as const,
    pokes: [L('smooth').from + 18, L('smooth').to - 4, L('cant').from + 2, L('cant').to + 2] as const,
    quiz: [L('quiz').from + 6, quizEnd] as const,
    countdown: [L('quiz').to, L('quiz').to + 15, L('quiz').to + 30] as const,
    later: [quizEnd, L('leaning').from + 14] as const,
    lefty: L('leaning').from,
    righty: L('sliding').from,
    upper: L('down').from,
    reveal: L('all').from - 4, // pull back to the gap (match-cut framing #2)
    bone: [L('melting').from, L('melting').to] as const,
    bonkShot: L('ow').from - 30,
    bonk,
    implantShot: implant - 4,
    implant,
    stay: L('stay').from,
    early: [L('early').from, L('early').to] as const,
    end: end0,
    total: TOTAL_FRAMES,
  };
})();
export const POKES = B.pokes;

// ======================================================================= layout (world = wide shot)
const S = 1.25;
const LG = 1420;
const UG = 440;
const LEFTY_X = 180;
const MO_X = 540;
const RIGHTY_X = 905;
const lowerTooth = (cx: number, s = S) => ({left: cx - 200 * s, top: LG - 320 * s, scale: s});
const upperTooth = (cx: number, drop = 0, s = S) => ({left: cx - 200 * s, top: UG - 320 * s + drop, scale: s});
const MOUTH_Y = 740; // speaker's mouth sits here on screen; captions live at y≈1500
type Cam = {s: number; cx: number; cy: number};
const camOn = (x: number, y: number, s: number): Cam => ({s, cx: x, cy: y + (960 - MOUTH_Y) / s});
const MO_MOUTH = LG - 320 * S + 138 * S;
const LEFTY_MOUTH = LG - 320 * 1.12 + 138 * 1.12;
const upperMouth = (drop: number) => UG - 320 * S + drop + 586 * S;
const GAP_CAM: Cam = {s: 1.1, cx: 540, cy: 1080}; // the one framing used for every "state of the gap" shot

/** De-cloned teeth: each gets its own tiny lean, size and blink rhythm. */
const jit = (seed: string) => ({rot: (random(`${seed}r`) - 0.5) * 6, scale: 0.96 + random(`${seed}s`) * 0.08, every: 90 + Math.floor(random(`${seed}b`) * 90), off: Math.floor(random(`${seed}o`) * 90)});
const blinking = (f: number, seed: string) => {
  const j = jit(seed);
  return (f + j.off) % j.every < 4;
};
const eyesOf = (f: number, seed: string, e: XEyes): XEyes => (e === 'open' && blinking(f, seed) ? 'closed' : e);

// ======================================================================= set pieces
const LowerBone: React.FC<{dip: number; f: number}> = ({dip, f}) => {
  const y = LG + 70;
  const d = `M -60 ${y} L 370 ${y} C 450 ${y}, 460 ${y + dip}, 540 ${y + dip} C 620 ${y + dip}, 630 ${y}, 710 ${y} L 1140 ${y} L 1140 2600 L -60 2600 Z`;
  return (
    <g>
      <defs>
        <clipPath id="g3bone">
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill={X.bone} stroke={X.line} strokeWidth={6} />
      <g clipPath="url(#g3bone)">
        {Array.from({length: 46}).map((_, i) => (
          <ellipse key={i} cx={random(`g3x${i}`) * 1080} cy={y + 40 + random(`g3y${i}`) * 600} rx={8 + random(`g3r${i}`) * 14} ry={6 + random(`g3q${i}`) * 9} fill={X.boneDot} opacity={0.7} />
        ))}
      </g>
      {/* bone "melting": specks drifting off the shrinking ridge */}
      {dip > 2 &&
        Array.from({length: 14}).map((_, i) => {
          const t = ((f * 1.6 + i * 23) % 60) / 60;
          const x0 = 440 + random(`mp${i}`) * 200;
          return <circle key={i} cx={x0 + (random(`mq${i}`) - 0.5) * 120 * t} cy={y + dip * 0.6 - t * 160} r={5 + (i % 3) * 3} fill={X.boneDot} stroke={X.line} strokeWidth={2} opacity={(1 - t) * Math.min(1, dip / 30)} />;
        })}
    </g>
  );
};
const UpperBone: React.FC = () => (
  <g>
    <rect x={-60} y={-400} width={1200} height={UG - 70 + 400} fill={X.bone} stroke={X.line} strokeWidth={6} />
    {Array.from({length: 26}).map((_, i) => (
      <ellipse key={i} cx={random(`g3ux${i}`) * 1080} cy={random(`g3uy${i}`) * (UG - 100)} rx={8 + random(`g3ur${i}`) * 14} ry={6 + random(`g3uq${i}`) * 9} fill={X.boneDot} opacity={0.7} />
    ))}
  </g>
);
const Neck: React.FC<{xs: number[]; y: number}> = ({xs, y}) => (
  <g>
    {xs.map((x, i) => (
      <ellipse key={i} cx={x} cy={y} rx={170} ry={34} fill="url(#xtDrop)" />
    ))}
  </g>
);
const LowerGum: React.FC<{dip: number; papillae: number[]; teeth: number[]}> = ({dip, papillae, teeth}) => {
  const y = LG;
  const pts = [`M -60 ${y + 20}`];
  for (const px of papillae) pts.push(`L ${px - 80} ${y + 16}`, `C ${px - 36} ${y + 10}, ${px - 20} ${y - 70}, ${px} ${y - 74}`, `C ${px + 20} ${y - 70}, ${px + 36} ${y + 10}, ${px + 80} ${y + 16}`);
  pts.push(`L 380 ${y + 18} C 460 ${y + 18}, 470 ${y + 18 + dip}, 540 ${y + 18 + dip} C 610 ${y + 18 + dip}, 620 ${y + 18}, 700 ${y + 18}`);
  pts.push(`L 1140 ${y + 20} L 1140 ${y + 130} C 620 ${y + 130 + dip}, 460 ${y + 130 + dip}, -60 ${y + 130} Z`);
  const d = pts.join(' ');
  return (
    <g>
      <path d={d} fill={X.gum} stroke={X.line} strokeWidth={6} strokeLinejoin="round" />
      <path d={d} fill="url(#gumShadeDown)" />
      <Neck xs={teeth} y={y + 30} />
      {/* specular highlight */}
      <path d={`M -20 ${y + 56} Q 540 ${y + 76 + dip} 1100 ${y + 56}`} stroke={X.gumLight} strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.85} />
      <path d={`M 120 ${y + 44} Q 300 ${y + 36} 420 ${y + 44}`} stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.55} />
    </g>
  );
};
const UpperGum: React.FC<{papillae: number[]; teeth: number[]}> = ({papillae, teeth}) => {
  const y = UG;
  const pts = [`M -60 ${y - 20}`];
  for (const px of papillae) pts.push(`L ${px - 80} ${y - 16}`, `C ${px - 36} ${y - 10}, ${px - 20} ${y + 70}, ${px} ${y + 74}`, `C ${px + 20} ${y + 70}, ${px + 36} ${y - 10}, ${px + 80} ${y - 16}`);
  pts.push(`L 1140 ${y - 20} L 1140 ${y - 130} Q 540 ${y - 150} -60 ${y - 130} Z`);
  const d = pts.join(' ');
  return (
    <g>
      <path d={d} fill={X.gum} stroke={X.line} strokeWidth={6} strokeLinejoin="round" />
      <path d={d} fill="url(#gumShadeUp)" />
      <Neck xs={teeth} y={y - 30} />
      <path d={`M -20 ${y - 56} Q 540 ${y - 76} 1100 ${y - 56}`} stroke={X.gumLight} strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.85} />
    </g>
  );
};

/** The running gag: a little sign on the gap that changes with the story. */
type SignState = 'rent' | 'reno' | 'squatters' | 'leased';
const SIGN_TEXT: Record<SignState, [string, string]> = {
  rent: ['FOR RENT', '#FFFFFF'],
  reno: ['UNDER RENOVATION', X.gold],
  squatters: ['SQUATTERS!', '#FF6B6B'],
  leased: ['LEASED ✓', '#7BE08F'],
};
const Sign: React.FC<{state: SignState; since: number; f: number}> = ({state, since, f}) => {
  const s = sp(f, since, {mass: 1, damping: 9});
  const [text, color] = SIGN_TEXT[state];
  const w = state === 'reno' ? 420 : 320;
  return (
    <g transform={state === 'leased' ? `translate(${MO_X} ${LG + 40})` : `translate(${MO_X - 70} ${LG + 6})`}>
      {state !== 'leased' && <rect x={-7} y={-300} width={14} height={300} rx={6} fill="#B98A5A" stroke={X.line} strokeWidth={5} />}
      <g transform={`translate(0 ${state === 'leased' ? 0 : -330}) rotate(${(1 - s) * -90 + (state === 'leased' ? -4 : 0)}) scale(${0.6 + 0.4 * s})`}>
        <rect x={-w / 2} y={-46} width={w} height={92} rx={16} fill="#3B1517" stroke={X.line} strokeWidth={7} />
        <text x={0} y={6} textAnchor="middle" dominantBaseline="middle" fontFamily={CAPTION_FONT} fontSize={state === 'reno' ? 40 : 52} fill={color}>
          {text}
        </text>
      </g>
    </g>
  );
};

const Clot: React.FC<{s: number; fade: number}> = ({s, fade}) =>
  s <= 0 || fade <= 0 ? null : (
    <g opacity={fade} transform={`translate(${MO_X} ${LG + 20}) scale(${s})`}>
      <ellipse rx={120} ry={46} fill="#5E0F1E" stroke={X.line} strokeWidth={6} />
      <ellipse cx={-34} cy={-16} rx={34} ry={10} fill="#C24A5C" opacity={0.85} />
      <ellipse cx={30} cy={8} rx={10} ry={5} fill="#FF8FA0" opacity={0.7} />
    </g>
  );

/** Titanium implant: screw post + crown. */
const Implant: React.FC<{y: number; s: number}> = ({y, s}) => (
  <g transform={`translate(${MO_X} ${y}) scale(${s})`}>
    <rect x={-34} y={0} width={68} height={190} rx={18} fill="#B7BEC9" stroke={X.line} strokeWidth={6} />
    {Array.from({length: 7}).map((_, i) => (
      <path key={i} d={`M -40 ${22 + i * 24} L 40 ${12 + i * 24}`} stroke="#7E8796" strokeWidth={8} strokeLinecap="round" />
    ))}
    <rect x={-48} y={-26} width={96} height={30} rx={8} fill="#D6DBE3" stroke={X.line} strokeWidth={6} />
  </g>
);

// ======================================================================= the mouth
const Mouth: React.FC<{f: number}> = ({f}) => {
  // --- Mo, then the gap
  const moThere = f < B.pop;
  const wiggle = f >= B.wiggle[0] && f < B.wiggle[1] ? Math.sin((f - B.wiggle[0]) * 0.75) * 8 : 0;
  const fly = interpolate(f, [B.pop + 1, B.pop + 40], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const flying = f >= B.pop && fly < 1;
  const scream = f < B.hq1[0];
  const pulse = scream ? 0.6 + 0.4 * Math.abs(Math.sin(f * 0.35)) : 0.55;
  let mo: {eyes: XEyes; mouth: any; brows: any; look: [number, number]} = {eyes: 'squeeze', mouth: 'yell', brows: 'none', look: [0, 0]};
  if (f >= B.fine && f < B.clampAt) mo = {eyes: 'half', mouth: 'grin', brows: 'worried', look: [10, -18]}; // forced smile, eyes darting up
  if (f >= B.clampAt && f < B.pop) mo = {eyes: 'wide', mouth: 'o', brows: 'worried', look: [0, -20]};
  if (f >= B.pop) mo = {eyes: 'wide', mouth: 'yell', brows: 'worried', look: [0, 10]};

  // --- forceps: shadow first, then in, clamp, wiggle, pull
  const reach = sp(f, B.clampAt - 10);
  const tip: [number, number] = [MO_X + 30 + (1 - reach) * 700, 1050 - (1 - reach) * 600 - fly * 1500];
  const forcepsOn = f >= B.clampAt - 10 && f < B.pop + 40;
  const shadowX = interpolate(f, [B.fine, B.clampAt], [900, 560], clamp);

  // --- healing: clot, then smooth gum
  const clotIn = f >= B.clot ? sp(f, B.clot, {mass: 1, damping: 10}) : 0;
  const healed = f >= B.weeks[1] - 12;
  const clotFade = healed ? 0 : 1;
  const socketOpen = f >= B.pop && !healed;

  // --- six months later
  const lefty = sp(f, B.lefty, {mass: 1, damping: 18});
  const righty = sp(f, B.righty, {mass: 1, damping: 18});
  const drop = interpolate(f, [B.upper, B.upper + 50], [0, 120], {...clamp, easing: Easing.inOut(Easing.quad)});
  const boneDip = interpolate(f, B.bone, [0, 70], {...clamp, easing: Easing.inOut(Easing.quad)});
  const falling = f >= B.bonkShot; // Upper has left for the brain room
  const upperBack = f >= B.implantShot; // and it's back for the implant shots (still dropped)

  // --- reactions
  const popRecoil = f >= B.pop ? sp(f, B.pop, {mass: 1, damping: 7}) * Math.max(0, 1 - (f - B.pop) / 30) : 0;
  const quiz = f >= B.quiz[0] && f < B.quiz[1];
  const shocked = f >= B.pop && f < B.clot;
  const lFace = (): Face & {brows: any} => {
    if (scream) return {eyes: 'squeeze', mouth: 'grit' as any, brows: 'worried', look: [0, 0]};
    if (shocked) return {eyes: 'wide', mouth: 'o', brows: 'worried', look: [10, -10]};
    if (quiz) return {eyes: 'open', mouth: 'grin', brows: 'proud', look: [14, -4]};
    if (f >= B.lefty) return {eyes: f >= B.stay ? 'wide' : 'half', mouth: f >= B.stay ? 'o' : 'smirk' as any, brows: f >= B.stay ? 'worried' : 'proud', look: [12, 0]};
    return {eyes: 'open', mouth: 'smile', brows: 'none', look: [12, -6]};
  };
  const rFace = (): Face & {brows: any} => {
    if (scream) return {eyes: 'squeeze', mouth: 'grit' as any, brows: 'worried', look: [0, 0]};
    if (shocked) return {eyes: 'wide', mouth: 'o', brows: 'worried', look: [-10, -10]};
    if (quiz) return {eyes: 'half', mouth: 'smirk' as any, brows: 'proud', look: [-14, -4]};
    if (f >= B.righty) return {eyes: 'open', mouth: 'grin', brows: 'proud', look: [-14, 4]};
    return {eyes: 'open', mouth: 'smile', brows: 'none', look: [-12, -6]};
  };
  const lf = lFace();
  const rf = rFace();
  const jl = jit('lefty');
  const jr = jit('righty');
  const ju = jit('upper');

  // --- the tongue: blocked by bouncers, later pokes the healed gap
  const tongueOn = (f >= B.poke && f < B.weeks[0]) || (f >= B.smooth && f < B.quiz[0]);
  const tongueIn = sp(f, f < B.weeks[0] ? B.poke : B.smooth);
  const blocked = f < B.weeks[0];
  const tonguePoke = POKES.reduce((acc, p) => acc + Math.max(0, 1 - Math.abs(f - p - 3) / 5), 0);
  const tongueTip: [number, number] = blocked ? [700, LG - 60] : [MO_X + 20, LG + 6];

  // --- the sign
  let sign: SignState | null = null;
  let since = 0;
  if (f >= B.pop + 16) [sign, since] = ['rent', B.pop + 16];
  if (f >= B.reno) [sign, since] = ['reno', B.reno];
  if (f >= B.weeks[1]) sign = null; // healed: the sign is put away until the squatters arrive
  if (f >= B.later[0]) [sign, since] = ['squatters', B.later[0] + 6];
  if (f >= B.lefty && f < B.reveal + 10) sign = null; // keep close-ups clean
  if (f >= B.reveal + 10 && f < B.implant) since = B.reveal + 10;
  if (f >= B.bone[0] && f < B.implant) sign = null;
  if (f >= B.implant) [sign, since] = ['leased', B.implant + 4];
  if (f >= B.stay && f < B.end) sign = null;

  const implantY = interpolate(sp(f, B.implant, {mass: 1, damping: 11}), [0, 1], [LG - 900, LG - 40]);
  const implantOn = f >= B.implant;

  return (
    <g>
      <UpperBone />
      {/* depth: a faded back row */}
      <g opacity={0.42}>
        <XTooth {...upperTooth(360, -30, 1.0)} flip faceless frame={f} />
        <XTooth {...upperTooth(720, -30, 1.0)} flip faceless frame={f} />
      </g>
      <XTooth {...upperTooth(LEFTY_X)} flip faceless shade frame={f} tilt={-2} />
      <XTooth {...upperTooth(RIGHTY_X)} flip faceless shade frame={f} tilt={2} />
      {(!falling || upperBack) && (
        <XTooth
          {...upperTooth(MO_X, drop)}
          flip
          shade
          frame={f}
          tilt={ju.rot * 0.5 + (quiz ? Math.sin(f * 0.3) * 3 : 0)}
          throb={ju.scale}
          eyes={eyesOf(f, 'upper', scream || shocked ? 'wide' : f >= B.upper ? 'half' : 'open')}
          brows={f >= B.upper ? 'proud' : scream ? 'worried' : 'none'}
          mouth={f >= B.upper ? 'smirk' : scream || shocked ? 'o' : 'smile'}
          look={quiz ? [0, -18] : [0, -14]}
          talk={talkOf(f, 'upper')}
        />
      )}
      <UpperGum papillae={[360, 722]} teeth={[LEFTY_X, MO_X, RIGHTY_X]} />

      <LowerBone dip={boneDip} f={f} />
      <XTooth
        {...lowerTooth(LEFTY_X, 1.12 * jl.scale)}
        squash={[0.82, quiz ? 1 + Math.abs(Math.sin(f * 0.25)) * 0.06 : 1]}
        tilt={jl.rot - popRecoil * 10}
        apexTilt={lefty * 13}
        shade
        frame={f}
        {...lf}
        eyes={eyesOf(f, 'lefty', lf.eyes ?? 'open')}
        arms={shocked ? 'panic' : quiz ? 'reach' : 'rest'}
        talk={talkOf(f, 'lefty')}
      />
      <XTooth
        {...lowerTooth(RIGHTY_X, S * jr.scale)}
        left={RIGHTY_X - 200 * S * jr.scale - righty * 75}
        tilt={jr.rot + popRecoil * 10 - righty * 4}
        shade
        frame={f}
        {...rf}
        eyes={eyesOf(f, 'righty', rf.eyes ?? 'open')}
        arms={shocked ? 'panic' : 'rest'}
        talk={talkOf(f, 'righty')}
      />
      {moThere && (
        <XTooth
          {...lowerTooth(MO_X)}
          tilt={wiggle}
          squash={f >= B.wiggle[0] && f < B.pop ? [1 - Math.abs(wiggle) * 0.004, 1 + Math.abs(wiggle) * 0.01] : [1, 1]}
          shade
          frame={f}
          {...mo}
          crack={1}
          pain={pulse}
          sweat={f >= B.fine ? 4 : 2}
          arms={scream ? 'panic' : 'rest'}
          talk={talkOf(f, 'mo')}
        />
      )}
      {implantOn && (
        <g>
          <Implant y={implantY} s={1} />
          <XTooth {...lowerTooth(MO_X, 1.05)} top={implantY - (320 - 0) * 1.05 + 10} faceless shade frame={f} />
        </g>
      )}
      <LowerGum dip={boneDip * 0.8} papillae={moThere ? [360, 722] : []} teeth={moThere ? [LEFTY_X, MO_X, RIGHTY_X] : [LEFTY_X, RIGHTY_X - righty * 75]} />
      {moThere && f < B.fine && (
        <g transform={`translate(${MO_X + 10} ${LG - 320 * S - 40}) rotate(-12)`}>
          <rect x={-110} y={-42} width={220} height={84} rx={30} fill="#BFE6FF" stroke={X.ink} strokeWidth={7} />
          <path d="M -80 -16 L -40 -16" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" />
        </g>
      )}
      {/* forceps shadow falls over Mo before the forceps arrive */}
      {f >= B.fine && f < B.clampAt + 4 && <ellipse cx={shadowX + 120} cy={900} rx={220} ry={110} fill="#000" opacity={0.12} transform={`rotate(-30 ${shadowX + 120} 900)`} />}

      {socketOpen && <ellipse cx={MO_X} cy={LG + 26} rx={150} ry={40} fill="#8E2E3E" stroke={X.line} strokeWidth={6} />}
      {/* impact burst lines at the socket */}
      {f >= B.pop && f < B.pop + 14 && (
        <g stroke={X.gold} strokeWidth={12} strokeLinecap="round" opacity={1 - (f - B.pop) / 14}>
          {Array.from({length: 10}).map((_, i) => {
            const a = Math.PI + (i / 9) * Math.PI;
            const r1 = 170 + (f - B.pop) * 10;
            return <line key={i} x1={MO_X + Math.cos(a) * r1} y1={LG + 20 + Math.sin(a) * r1 * 0.55} x2={MO_X + Math.cos(a) * (r1 + 60)} y2={LG + 20 + Math.sin(a) * (r1 + 60) * 0.55} />;
          })}
        </g>
      )}
      <Clot s={clotIn} fade={clotFade} />
      {implantOn && f < B.implant + 22 && (
        <ellipse cx={MO_X} cy={LG + 20} rx={60 + (f - B.implant) * 18} ry={(60 + (f - B.implant) * 18) * 0.35} fill="none" stroke="#FFFFFF" strokeWidth={10} opacity={1 - (f - B.implant) / 22} />
      )}

      {/* gum cells in hard hats: march in, then stand guard over the clot */}
      {f >= B.cells[0] - 6 && f < B.cells[1] + 12 && (
        <g opacity={interpolate(f, [B.cells[1], B.cells[1] + 12], [1, 0], clamp)}>
          {[-1, 1].map((k) => {
            const march = sp(f, B.cells[0] - 6 + (k + 1) * 4);
            const guard = f >= B.dont[0];
            const hx = MO_X + k * 215 + (1 - march) * -600;
            const bob = guard ? Math.abs(Math.sin(f * 0.8 + k)) * -14 : Math.abs(Math.sin(f * 0.6 + k)) * -10;
            const gt = talkOf(f, 'gums');
            return (
              <g key={k}>
                {guard && <Noodle d={`M ${hx - 40} ${LG - 20 + bob} L ${hx + 40} ${LG + 10 + bob}`} hand={[hx + 40, LG + 10 + bob]} />}
                {guard && <Noodle d={`M ${hx + 40} ${LG - 20 + bob} L ${hx - 40} ${LG + 10 + bob}`} hand={[hx - 40, LG + 10 + bob]} />}
                <Googly x={hx} y={LG - 40 + bob} s={0.85} eyes={guard ? 'open' : 'open'} brows={guard ? 'angry' : 'none'} mouth={guard ? 'flat' : 'grin'} look={guard ? [16, 0] : [0, 6]} talk={k === -1 ? gt : guard ? gt : 0} />
                <HardHat x={hx + 2} y={LG - 104 + bob} s={1.4} />
              </g>
            );
          })}
        </g>
      )}

      {sign && <Sign state={sign} since={since} f={f} />}

      {flying && (
        <g transform={`translate(${fly * 380} ${-fly * 1500}) rotate(${fly * 540} ${MO_X} ${LG - 180})`}>
          <XTooth {...lowerTooth(MO_X)} shade frame={f} {...mo} crack={1} arms="panic" talk={talkOf(f, 'mo')} />
        </g>
      )}
      {forcepsOn && <Forceps tip={[tip[0] + (flying ? fly * 380 : 0), tip[1]]} open={f < B.clampAt + 2 ? 1 : 0} />}

      {tongueOn && (
        <g transform={`translate(${(1 - tongueIn) * 700} 0)`}>
          <Tongue tip={tongueTip} squish={tonguePoke * 26} eyes={tonguePoke > 0.3 ? 'squeeze' : blocked && f >= B.dont[0] ? 'wide' : 'open'} mouth={blocked && f >= B.dont[0] ? 'o' : 'grin'} look={[-12, 14]} talk={talkOf(f, 'tongue')} />
        </g>
      )}
      {f >= B.bone[0] && f < B.bone[1] + 4 && (
        <Googly x={540} y={1660} s={1.15} eyes={f < B.bone[0] + 30 ? 'half' : 'wide'} brows="worried" mouth="frown" look={[0, 8]} talk={talkOf(f, 'bone')} />
      )}
    </g>
  );
};

// ======================================================================= Brain HQ (monitor = the story's HUD)
type Hud = 'pain' | 'alarm' | 'fixed';
const HudPanel: React.FC<{f: number; state: Hud; since: number}> = ({f, state, since}) => {
  const blink = Math.floor(f / 6) % 2 === 0;
  const icon = (x: number, color: string, rot = 0, implant = false) => (
    <g transform={`translate(${x} 430) rotate(${rot} 0 70) scale(0.34)`}>
      <path d="M 50 180 C 30 60, 130 10, 160 50 C 185 80, 215 80, 240 50 C 270 10, 370 60, 350 180 C 340 260, 330 300, 310 360 C 300 420, 290 470, 260 470 C 230 470, 225 400, 200 380 C 175 400, 170 470, 140 470 C 110 470, 100 420, 90 360 C 70 300, 60 260, 50 180 Z" transform="translate(-200 -260)" fill={color} />
      {implant && <rect x={-22} y={110} width={44} height={150} rx={10} fill="#B7BEC9" />}
    </g>
  );
  const green = (i: number) => (f - since > 10 + i * 10 ? '#5FD38A' : '#FF4545');
  let title = '';
  let titleColor = '#FFFFFF';
  let icons: React.ReactNode = null;
  if (state === 'pain') {
    title = 'MOLAR: CRITICAL';
    titleColor = blink ? '#FF5050' : '#FF9A9A';
    icons = (
      <>
        {icon(370, '#5FD38A')}
        {icon(540, blink ? '#FF4545' : '#992222')}
        {icon(710, '#5FD38A')}
      </>
    );
  } else if (state === 'alarm') {
    title = 'RED ALERT';
    titleColor = blink ? '#FF5050' : '#FF9A9A';
    icons = (
      <>
        {icon(390, blink ? '#FF4545' : '#992222', 14)}
        <path d="M 488 400 L 592 400 L 592 500 L 488 500 Z" fill="none" stroke="#FF4545" strokeWidth={8} strokeDasharray="14 10" />
        {icon(690, blink ? '#FF4545' : '#992222', -6)}
      </>
    );
  } else {
    title = 'STABLE';
    titleColor = '#7BE08F';
    icons = (
      <>
        {icon(390, green(0), 14)}
        {icon(540, green(1), 0, true)}
        {icon(690, green(2), -6)}
      </>
    );
  }
  return (
    <g>
      <rect x={200} y={170} width={680} height={460} rx={34} fill="#3A1A1E" stroke={X.ink} strokeWidth={9} />
      <rect x={226} y={196} width={628} height={408} rx={20} fill="#24110F" />
      <text x={540} y={270} textAnchor="middle" fontFamily={CAPTION_FONT} fontSize={62} fill={titleColor}>
        {title}
      </text>
      {icons}
      {/* scanlines */}
      {Array.from({length: 13}).map((_, i) => (
        <rect key={i} x={226} y={204 + i * 31} width={628} height={3} fill="#FFFFFF" opacity={0.04} />
      ))}
    </g>
  );
};

const BrainHQ: React.FC<{f: number; hud: Hud; hudSince: number; face: Face; armsUp: boolean; lever?: number; children?: React.ReactNode}> = ({f, hud, hudSince, face, armsUp, lever = 0, children}) => {
  const red = hud !== 'fixed';
  const blink = red && Math.floor(f / 6) % 2 === 0;
  return (
    <g>
      <Cavity />
      {red && <path d={`M 540 110 L ${blink ? 120 : 960} -40 L ${blink ? 300 : 780} -40 Z`} fill="#FF4040" opacity={0.25} />}
      <rect x={490} y={100} width={100} height={60} rx={30} fill={red ? (blink ? '#FF3030' : '#B02424') : '#3FA96A'} stroke={X.ink} strokeWidth={7} />
      <HudPanel f={f} state={hud} since={hudSince} />
      <path d="M -60 1660 L 1140 1660 L 1140 1990 L -60 1990 Z" fill="#E9CFA9" stroke={X.ink} strokeWidth={8} />
      <rect x={-60} y={1660} width={1200} height={34} fill="#D7B88C" stroke={X.ink} strokeWidth={6} />
      {/* the lever */}
      <g transform={`translate(930 1676) rotate(${-35 + lever * 70})`}>
        <rect x={-8} y={-150} width={16} height={150} rx={8} fill="#8B8F9A" stroke={X.ink} strokeWidth={6} />
        <circle cx={0} cy={-156} r={26} fill={X.red} stroke={X.ink} strokeWidth={6} />
      </g>
      <Brain x={520} y={1340} s={1.38} frame={f} armsUp={armsUp} {...face} talk={talkOf(f, 'brain')} />
      {children}
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
const LABEL_MIN = 40;
const Label: React.FC<{text: string; x: number; y: number; from: number; to: number; f: number}> = ({text, x, y, from, to, f}) => {
  const end = Math.max(to, from + LABEL_MIN + 8);
  if (f < from || f > end) return null;
  const s = Math.min(sp(f, from), interpolate(f, [end - 8, end], [1, 0], clamp));
  return (
    <text x={x} y={y} transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`} textAnchor="middle" dominantBaseline="middle" fontFamily={fontFamily} fontWeight={700} fontSize={76} fill={X.white} stroke={X.ink} strokeWidth={14} paintOrder="stroke" strokeLinejoin="round">
      {text}
    </text>
  );
};
const Banner: React.FC<{text: string; a: number; b: number; f: number}> = ({text, a, b, f}) => {
  if (f < a || f > b) return null;
  const s = sp(f, a) * interpolate(f, [b - 10, b], [1, 0], clamp);
  return (
    <g transform={`translate(540 280) scale(${s})`}>
      <rect x={-360} y={-90} width={720} height={180} rx={26} fill="#FFFFFF" stroke={X.ink} strokeWidth={9} />
      <rect x={-360} y={-90} width={720} height={50} rx={26} fill={X.red} stroke={X.ink} strokeWidth={9} />
      <Big text={text} x={0} y={30} size={74} color={X.gold} s={1} />
    </g>
  );
};
const BrainInset: React.FC<{f: number; yell?: boolean}> = ({f, yell}) => (
  <g>
    <circle cx={170} cy={250} r={130} fill={X.bg} stroke={X.white} strokeWidth={10} />
    <defs>
      <clipPath id="g3inset">
        <circle cx={170} cy={250} r={124} />
      </clipPath>
    </defs>
    <g clipPath="url(#g3inset)">
      <Brain x={170} y={295} s={0.42} frame={f} headset eyes={yell ? 'squeeze' : 'open'} brows={yell ? 'angry' : 'none'} mouth={yell ? 'yell' : 'smile'} look={[0, 0]} talk={talkOf(f, 'brain')} />
    </g>
  </g>
);

const Quiz: React.FC<{f: number}> = ({f}) => {
  if (f < B.quiz[0] || f >= B.quiz[1]) return null;
  const n = f >= B.countdown[2] ? 1 : f >= B.countdown[1] ? 2 : f >= B.countdown[0] ? 3 : null;
  const last = [...B.countdown].reverse().find((c) => f >= c) ?? B.quiz[0];
  const badge = (x: number, y: number, ch: string, d: number) => {
    const s = sp(f, B.quiz[0] + d);
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <circle r={96} fill="none" stroke={X.gold} strokeWidth={10} strokeDasharray="22 14" transform={`rotate(${f * 3})`} />
        <circle r={74} fill={X.gold} stroke={X.ink} strokeWidth={10} />
        <text y={8} textAnchor="middle" dominantBaseline="middle" fontFamily={CAPTION_FONT} fontSize={110} fill={X.ink}>
          {ch}
        </text>
      </g>
    );
  };
  return (
    <g>
      {/* no dimming: the scene stays alive under the quiz */}
      <Big text="WHO MOVES IN?" x={540} y={250} size={112} color="#FFFFFF" s={sp(f, B.quiz[0])} />
      {badge(150, 790, 'A', 4)}
      {badge(935, 790, 'B', 8)}
      {badge(905, 470, 'C', 12)}
      {n !== null && (
        <g transform={`translate(540 400) scale(${0.8 + 0.2 * sp(f, last)})`}>
          <circle r={70} fill="#FFFFFF" stroke={X.ink} strokeWidth={10} />
          <text y={8} textAnchor="middle" dominantBaseline="middle" fontFamily={CAPTION_FONT} fontSize={96} fill={X.red}>
            {n}
          </text>
        </g>
      )}
    </g>
  );
};

const EndCard: React.FC<{f: number}> = ({f}) => {
  const a = B.end;
  if (f < a) return null;
  const words = ['TEETH', "DON'T", 'GROW.'];
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2040} fill="#000" opacity={0.6 * Math.min(1, (f - a) / 6)} />
      {words.map((w, i) => (
        <Big key={w} text={w} x={[215, 535, 860][i]} y={640} size={100} color="#FFFFFF" s={sp(f, a + i * 6, {mass: 1, damping: 9})} />
      ))}
      <Big text="THEY MOVE." x={540} y={820} size={190} color={X.gold} s={sp(f, a + 22, {mass: 1, damping: 8})} stroke={22} />
      <g opacity={Math.min(1, sp(f, a + 40))}>
        <Big text="IT WAS ALL OF THEM." x={540} y={1030} size={72} color="#FFFFFF" s={1} stroke={12} />
        <Big text="GOT A GAP? COMMENT" x={500} y={1150} size={72} color="#FFFFFF" s={1} stroke={12} />
        <PointDown x={960} y={1140} s={0.9} bob={Math.sin(f * 0.35) * 10} />
      </g>
    </g>
  );
};

// ======================================================================= camera
const lerp = (a: Cam, b: Cam, t: number): Cam => ({s: a.s + (b.s - a.s) * t, cx: a.cx + (b.cx - a.cx) * t, cy: a.cy + (b.cy - a.cy) * t});
const CAM_KEYS: [number, Cam, boolean][] = [
  [0, camOn(MO_X, MO_MOUTH, 1.6), true], // cold open on the screaming molar
  [B.fine, camOn(MO_X, MO_MOUTH, 1.5), true],
  [B.pop, camOn(MO_X, MO_MOUTH, 1.68), false], // push in through the struggle
  [B.afterPop, GAP_CAM, true], // the gap, framing #1
  [B.cells[0], GAP_CAM, false],
  [B.cells[0] + 20, camOn(MO_X, LG + 20, 1.55), false],
  [B.poke, camOn(620, LG - 10, 1.4), false],
  [B.weeks[0], camOn(620, LG - 10, 1.45), false],
  [B.weeks[0] + 1, GAP_CAM, true], // healed: same framing
  [B.smooth + 10, camOn(620, 1126, 1.4), false],
  [B.quiz[0], GAP_CAM, false], // quiz on the live scene
  [B.later[0], GAP_CAM, false],
  [B.lefty, camOn(LEFTY_X + 60, LEFTY_MOUTH, 1.8), false], // pan to A
  [B.righty - 10, camOn(LEFTY_X + 60, LEFTY_MOUTH, 1.85), false],
  [B.righty, camOn(RIGHTY_X - 75, MO_MOUTH, 1.75), false], // pan to B
  [B.upper - 10, camOn(RIGHTY_X - 75, MO_MOUTH, 1.8), false],
  [B.upper, camOn(MO_X, upperMouth(60), 1.7), false], // tilt up to C
  [B.reveal, camOn(MO_X, upperMouth(120), 1.75), false],
  [B.reveal + 14, GAP_CAM, false], // the reveal: framing #2
  [B.bone[0], {s: 1.5, cx: 540, cy: 1663}, true],
  [B.implantShot, GAP_CAM, true], // implant: framing #3
  [B.stay, camOn(LEFTY_X + 60, LEFTY_MOUTH, 1.8), true],
  [B.end, GAP_CAM, true],
  [B.total, {...GAP_CAM, s: 1.14}, false],
];
const camAt = (f: number): Cam => {
  let prev = CAM_KEYS[0];
  for (let i = 1; i < CAM_KEYS.length; i++) {
    const k = CAM_KEYS[i];
    if (f < k[0]) {
      if (k[2]) return prev[1];
      return lerp(prev[1], k[1], interpolate(f, [prev[0], k[0]], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)}));
    }
    prev = k;
  }
  return prev[1];
};

// ======================================================================= root
export const Gap3Scene: React.FC = () => {
  const f = useCurrentFrame();
  const inHQ1 = f >= B.hq1[0] && f < B.fine;
  const inBonk = f >= B.bonkShot && f < B.implantShot;
  const inHQ2 = f >= B.early[0] && f < B.end;
  const cam = camAt(f);
  // shake: 2px during the scream, a hit on the POP
  const shakeAmp = f < B.hq1[0] ? 2 : f >= B.pop && f < B.pop + 8 ? 14 * (1 - (f - B.pop) / 8) : f >= B.bonk && f < B.bonk + 8 ? 16 * (1 - (f - B.bonk) / 8) : 0;
  const sx = shakeAmp ? (random(`sx${f}`) - 0.5) * 2 * shakeAmp : 0;
  const sy = shakeAmp ? (random(`sy${f}`) - 0.5) * 2 * shakeAmp : 0;
  const flash = f === B.pop || f === B.bonk;

  // bonk: Upper falls onto the brain, then the hold
  const fallT = interpolate(f, [B.bonkShot + 4, B.bonk], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const bonked = f >= B.bonk;
  const stars = bonked
    ? Array.from({length: 5}).map((_, i) => {
        const a = f * 0.18 + (i / 5) * Math.PI * 2;
        return <path key={i} transform={`translate(${520 + Math.cos(a) * 200} ${1000 + Math.sin(a) * 50}) scale(0.7)`} d="M 0 -30 L 9 -9 L 30 -6 L 13 9 L 18 30 L 0 18 L -18 30 L -13 9 L -30 -6 L -9 -9 Z" fill={X.gold} stroke={X.ink} strokeWidth={5} />;
      })
    : null;

  return (
    <g transform={`translate(${sx} ${sy})`}>
      <ShadeDefs />
      <SoftShadeDefs />
      {inHQ1 && <BrainHQ f={f} hud="pain" hudSince={B.hq1[0]} face={{eyes: 'wide', brows: 'angry', mouth: 'yell', look: [20, 10]}} armsUp={false} lever={interpolate(f, [B.lever, B.lever + 6], [0, 1], clamp)} />}
      {inBonk && (
        <BrainHQ
          f={f}
          hud="alarm"
          hudSince={B.bonk}
          face={bonked ? (f < L('ow').from ? {eyes: 'dizzy', brows: 'none', mouth: 'o', look: [0, 0]} : {eyes: 'squeeze', brows: 'angry', mouth: 'yell', look: [0, 0]}) : {eyes: 'wide', brows: 'worried', mouth: 'o', look: [0, -26]}}
          armsUp={bonked}
        >
          {/* C lands on the brain's head and stays there */}
          <g transform={`translate(0 ${interpolate(fallT, [0, 1], [-1200, 0])})`}>
            <XTooth left={520 - 200 * 0.9} top={1035 - 610 * 0.9} scale={0.9} flip shade frame={f} eyes={bonked ? 'wide' : 'open'} brows="worried" mouth="o" look={[0, 0]} squash={bonked ? squash(f, B.bonk, 0.2) : [1, 1]} />
          </g>
          {stars}
          {bonked && f < B.bonk + 40 && <Big text="BONK!" x={810} y={820} size={130} color={X.gold} s={sp(f, B.bonk, {mass: 1, damping: 8})} rot={-12} />}
        </BrainHQ>
      )}
      {inHQ2 && <BrainHQ f={f} hud="fixed" hudSince={B.early[0]} face={{eyes: 'open', brows: 'none', mouth: 'smile', look: [0, 4]}} armsUp={false} />}
      {!inHQ1 && !inBonk && !inHQ2 && (
        <g>
          <Cavity />
          <g transform={`translate(540 960) scale(${cam.s}) translate(${-cam.cx} ${-cam.cy})`}>
            <Mouth f={f} />
          </g>
          <Label text="Molar" x={540} y={250} from={B.scream[0] + 4} to={B.scream[1]} f={f} />
          <Label text="Blood clot" x={540} y={1330} from={B.clot + 6} to={L('clot').to} f={f} />
          <Label text="Tipping" x={540} y={1330} from={B.lefty} to={B.righty} f={f} />
          <Label text="Drifting" x={540} y={1330} from={B.righty} to={B.upper} f={f} />
          <Label text="Over-erupting" x={540} y={1330} from={B.upper + 8} to={B.reveal} f={f} />
          <Label text="Jaw bone" x={540} y={1300} from={B.bone[0]} to={B.bone[1]} f={f} />
          <Label text="Implant" x={540} y={250} from={B.implant + 6} to={L('implant').to} f={f} />
          {/* the dry-socket lesson, as a sticker */}
          {f >= B.dont[0] && f < B.dont[1] + 30 && (
            <g opacity={interpolate(f, [B.dont[1] + 18, B.dont[1] + 30], [1, 0], clamp)}>
              <g transform={`translate(540 300) scale(${sp(f, B.dont[0])}) rotate(-3)`}>
                <rect x={-460} y={-100} width={920} height={200} rx={30} fill="#FFFFFF" stroke={X.ink} strokeWidth={9} />
                <text x={0} y={-30} textAnchor="middle" dominantBaseline="middle" fontFamily={CAPTION_FONT} fontSize={58} fill={X.ink}>
                  POKE THE CLOT &gt; DRY SOCKET
                </text>
                <text x={0} y={44} textAnchor="middle" dominantBaseline="middle" fontFamily={CAPTION_FONT} fontSize={74} fill={X.red}>
                  = OUCH!!!
                </text>
              </g>
            </g>
          )}
          <Banner text="A FEW WEEKS LATER" a={B.weeks[0]} b={B.weeks[1] + 18} f={f} />
          <Banner text="6 MONTHS LATER" a={B.later[0]} b={B.later[1]} f={f} />
          {f >= B.stop[0] - 2 && f < B.stop[1] + 6 && <BrainInset f={f} yell />}
          {f >= L('implant').from - 2 && f < L('implant').to + 6 && <BrainInset f={f} />}
          {f >= L('all').from && f < B.bone[0] && (
            <g>
              <BrainInset f={f} />
              <Big text="ALL OF THEM!" x={600} y={250} size={100} color={X.gold} s={sp(f, L('all').from + 10)} />
            </g>
          )}
          <Quiz f={f} />
          <EndCard f={f} />
        </g>
      )}
      {flash && <rect x={-100} y={-100} width={1300} height={2200} fill="#FFFFFF" />}
    </g>
  );
};

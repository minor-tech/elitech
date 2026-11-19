import React from 'react';
import {Easing, interpolate, random, spring, useCurrentFrame} from 'remotion';
import {FPS, SPRING, clamp, fontFamily, squash} from '../theme';
import {Cavity} from '../enamelv3/Backdrop';
import {ShadeDefs, XTooth} from '../enamelv3/XTooth';
import {CAPTION_FONT, X} from '../enamelv3/style';
import {GAP_TOTAL_FRAMES, L, gapDialogue} from '../audio/gapDialogue';
import timings from '../audio/gapTimings.json';
import {Brain, Forceps, Googly, HardHat, IcePack, PointDown, SoftShadeDefs, Tongue} from './Props';
import type {Face} from './Props';

const sp = (f: number, at: number) => spring({frame: f - at, fps: FPS, config: SPRING});
const T = timings as Record<string, {mouth: number[]}>;
export const talkOf = (f: number, who: string) => {
  for (const l of gapDialogue) {
    if (l.character !== who) continue;
    const start = l.fromFrame + (l.delay ?? 0);
    const m = T[l.id]?.mouth;
    if (m && f >= start && f < start + m.length) return ((m[f - start] ?? 0) * 2 + (m[f - start - 1] ?? 0)) / 3;
  }
  return 0;
};

// ---------------------------------------------------------------- beats (all derived from the voice timeline)
export const BEAT = (() => {
  const grab = L('mo2').to;
  const pop = L('mo3').from - 8;
  const quiz0 = L('brain4').from;
  const quiz1 = L('righty1').from - 24;
  const end0 = L('upper2').to + 4;
  return {
    hqEnd: L('mo1').from,
    forceps: grab - 22,
    grab,
    wiggle: grab + 2,
    pop,
    gums: L('gums1').from,
    patchEnd: L('gums1').to,
    tongueIn: L('tongue1').from - 12,
    brain3: [L('brain3').from, L('brain3').to] as const,
    tongue2: L('tongue2').from,
    quiz: [quiz0, quiz1] as const,
    countdown: [quiz1 - 90, quiz1 - 60, quiz1 - 30] as const, // 3, 2, 1
    later: quiz1,
    righty: L('righty1').from,
    lefty: L('lefty1').from,
    upper: L('upper1').from,
    reveal: L('brain5').from - 6,
    bone: [L('bone1').from, L('bone1').to] as const,
    brain6: [L('brain6').from, L('brain6').to] as const,
    upper2: L('upper2').from,
    endCard: end0,
    reaction: end0 + 75, // end card holds 2.5 s, then the reaction face
    total: GAP_TOTAL_FRAMES,
  };
})();
export const POKES = [L('tongue1').from + 6, L('tongue1').from + 22, L('tongue1').from + 38, L('tongue2').from + 4, L('tongue2').from + 18];

// ---------------------------------------------------------------- layout (world space = wide shot)
const S = 1.25;
const LG = 1420;
const UG = 440;
const LEFTY_X = 180;
const MO_X = 540;
const RIGHTY_X = 905;
const lowerTooth = (cx: number, s = S) => ({left: cx - 200 * s, top: LG - 320 * s, scale: s});
const upperTooth = (cx: number, drop = 0) => ({left: cx - 200 * S, top: UG - 320 * S + drop, scale: S});
// where each speaker's mouth sits in the world (cameras put it at screen y≈740, above the captions)
const MOUTH_SCREEN_Y = 740;
const camOn = (x: number, mouthY: number, s: number) => ({s, cx: x, cy: mouthY + (960 - MOUTH_SCREEN_Y) / s});
const MO_MOUTH = LG - 320 * S + 138 * S;
const LEFTY_MOUTH = LG - 320 * 1.12 + 138 * 1.12;
const upperMouth = (drop: number) => UG - 320 * S + drop + 586 * S;

// ---------------------------------------------------------------- set pieces
const LowerBone: React.FC<{dip: number}> = ({dip}) => {
  const y = LG + 70;
  const d = `M -60 ${y} L 370 ${y} C 450 ${y}, 460 ${y + dip}, 540 ${y + dip} C 620 ${y + dip}, 630 ${y}, 710 ${y} L 1140 ${y} L 1140 2600 L -60 2600 Z`;
  return (
    <g>
      <defs>
        <clipPath id="lbone">
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill={X.bone} stroke={X.line} strokeWidth={6} />
      <g clipPath="url(#lbone)">
        {Array.from({length: 46}).map((_, i) => (
          <ellipse key={i} cx={random(`lx${i}`) * 1080} cy={y + 40 + random(`ly${i}`) * 600} rx={8 + random(`lr${i}`) * 14} ry={6 + random(`lq${i}`) * 9} fill={X.boneDot} opacity={0.7} />
        ))}
      </g>
    </g>
  );
};
const UpperBone: React.FC = () => {
  const y = UG - 70;
  return (
    <g>
      <rect x={-60} y={-400} width={1200} height={y + 400} fill={X.bone} stroke={X.line} strokeWidth={6} />
      {Array.from({length: 26}).map((_, i) => (
        <ellipse key={i} cx={random(`ux${i}`) * 1080} cy={random(`uy${i}`) * (y - 30)} rx={8 + random(`ur${i}`) * 14} ry={6 + random(`uq${i}`) * 9} fill={X.boneDot} opacity={0.7} />
      ))}
    </g>
  );
};
/** Soft drop shadows where teeth meet the gum. */
const NeckShadows: React.FC<{xs: number[]; y: number}> = ({xs, y}) => (
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
      <NeckShadows xs={teeth} y={y + 30} />
      <path d={`M -20 ${y + 56} Q 540 ${y + 76 + dip} 1100 ${y + 56}`} stroke={X.gumLight} strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.85} />
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
      <NeckShadows xs={teeth} y={y - 30} />
      <path d={`M -20 ${y - 56} Q 540 ${y - 76} 1100 ${y - 56}`} stroke={X.gumLight} strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.85} />
    </g>
  );
};

// ---------------------------------------------------------------- the mouth
const Mouth: React.FC<{f: number}> = ({f}) => {
  const moThere = f < BEAT.pop;
  const wiggle = f >= BEAT.wiggle && f < BEAT.pop ? Math.sin((f - BEAT.wiggle) * 1.2) * 9 : 0;
  const rise = interpolate(f, [BEAT.pop, BEAT.pop + 70], [0, -1800], {...clamp, easing: Easing.in(Easing.quad)});
  let moFace: Face & {brows: any} = {eyes: 'half', mouth: 'frown', brows: 'worried', look: [0, 6]};
  if (f >= L('mo2').from && f < BEAT.forceps) moFace = {eyes: 'wide', mouth: 'yell', brows: 'angry', look: [0, 0]};
  if (f >= BEAT.forceps && f < BEAT.pop) moFace = {eyes: 'wide', mouth: 'o', brows: 'worried', look: [14, -18]};
  if (f >= BEAT.pop) moFace = {eyes: 'closed', mouth: 'smile', brows: 'none', look: [0, 0]};
  const moTalk = talkOf(f, 'mo');

  const reach = sp(f, BEAT.forceps);
  const tip: [number, number] = [MO_X + 30 + (1 - reach) * 700, 1050 - (1 - reach) * 600 + rise];
  const showForceps = f >= BEAT.forceps && f < BEAT.pop + 70;

  const socketOpen = f >= BEAT.pop;
  const patch = interpolate(f, [BEAT.gums, BEAT.patchEnd], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});

  const righty = sp(f, BEAT.righty);
  const lefty = sp(f, BEAT.lefty);
  const drop =
    interpolate(f, [BEAT.upper, BEAT.upper + 60], [0, 120], {...clamp, easing: Easing.inOut(Easing.quad)}) +
    interpolate(f, [BEAT.upper2, BEAT.upper2 + 36], [0, 40], {...clamp, easing: Easing.inOut(Easing.quad)});
  const boneDip = interpolate(f, BEAT.bone, [0, 70], {...clamp, easing: Easing.inOut(Easing.quad)});

  const shocked = f >= BEAT.pop && f < BEAT.gums;
  const quiz = f >= BEAT.quiz[0] && f < BEAT.quiz[1];
  const reacting = f >= BEAT.reaction;
  const nbLook: [number, number] = quiz ? [0, 0] : shocked ? [0, -20] : [0, 4];

  const tonguePoke = POKES.reduce((acc, p) => acc + Math.max(0, 1 - Math.abs(f - p - 3) / 5), 0);
  const tongueOn = f >= BEAT.tongueIn && f < BEAT.quiz[0];
  const tongueIn = sp(f, BEAT.tongueIn);

  return (
    <g>
      <UpperBone />
      <XTooth {...upperTooth(LEFTY_X)} flip faceless shade frame={f} />
      <XTooth {...upperTooth(RIGHTY_X)} flip faceless shade frame={f} />
      <XTooth
        {...upperTooth(MO_X, drop)}
        flip
        shade
        frame={f}
        eyes={reacting ? 'wide' : f >= BEAT.upper ? (f < BEAT.reveal ? 'half' : 'open') : quiz || shocked ? 'wide' : 'open'}
        brows={reacting ? 'worried' : f >= BEAT.upper ? 'proud' : 'none'}
        mouth={reacting ? 'o' : f >= BEAT.upper ? 'smirk' : shocked ? 'o' : 'smile'}
        look={reacting ? [0, -4] : quiz ? [0, 0] : [0, -14]}
        sweat={reacting ? 3 : 0}
        talk={talkOf(f, 'upper')}
        squash={reacting ? squash(f, BEAT.reaction, 0.12) : [1, 1]}
      />
      <UpperGum papillae={[360, 722]} teeth={[LEFTY_X, MO_X, RIGHTY_X]} />

      <LowerBone dip={boneDip} />
      <XTooth
        {...lowerTooth(LEFTY_X, 1.12)}
        left={LEFTY_X - 200 * 1.12 + lefty * 45}
        squash={[0.82, 1]}
        tilt={lefty * 12}
        shade
        frame={f}
        eyes={f >= BEAT.lefty ? 'half' : shocked || quiz ? 'wide' : 'open'}
        brows={f >= BEAT.lefty ? 'proud' : 'none'}
        mouth={f >= BEAT.lefty ? 'smirk' : shocked ? 'o' : 'smile'}
        look={f >= BEAT.lefty ? [12, 0] : nbLook}
        arms={shocked ? 'reach' : 'rest'}
        talk={talkOf(f, 'lefty')}
      />
      <XTooth
        {...lowerTooth(RIGHTY_X)}
        left={RIGHTY_X - 200 * S - righty * 70}
        tilt={-16 * righty}
        shade
        frame={f}
        eyes={f >= BEAT.righty ? 'open' : shocked || quiz ? 'wide' : 'open'}
        brows={f >= BEAT.righty ? 'proud' : 'none'}
        mouth={f >= BEAT.righty ? 'grin' : shocked ? 'o' : 'smile'}
        look={f >= BEAT.righty ? [-14, 4] : nbLook}
        arms={shocked ? 'reach' : f >= BEAT.righty && f < BEAT.lefty + 10 ? 'flex' : 'rest'}
        talk={talkOf(f, 'righty')}
      />
      {moThere && (
        <XTooth
          {...lowerTooth(MO_X)}
          tilt={wiggle}
          shade
          frame={f}
          {...moFace}
          crack={1}
          pain={0.6 + 0.3 * Math.abs(Math.sin(f * 0.15))}
          sweat={f >= L('mo2').from ? 4 : 2}
          arms={f >= L('mo2').from ? 'panic' : 'rest'}
          talk={moTalk}
        />
      )}
      <LowerGum dip={boneDip * 0.8} papillae={moThere ? [360, 722] : []} teeth={moThere ? [LEFTY_X, MO_X, RIGHTY_X] : [LEFTY_X + lefty * 45, RIGHTY_X - righty * 70]} />
      {moThere && f < L('mo2').from && <IcePack x={MO_X + 10} y={LG - 320 * S + 10} />}

      {socketOpen && (
        <g>
          <ellipse cx={MO_X} cy={LG + 26 + boneDip * 0.8} rx={150 * (1 - patch) + 4} ry={40 * (1 - patch) + 2} fill="#8E2E3E" stroke={X.line} strokeWidth={6} opacity={1 - patch * 0.95} />
          {f >= BEAT.gums - 4 && f < BEAT.patchEnd + 20 && (
            <g opacity={interpolate(f, [BEAT.patchEnd + 8, BEAT.patchEnd + 20], [1, 0], clamp)}>
              {[-1, 1].map((side) => {
                const hx = MO_X + side * (190 - patch * 70);
                const bob = Math.abs(Math.sin(f * 0.6 + side)) * -16;
                const gt = talkOf(f, 'gums');
                return (
                  <g key={side}>
                    <Googly x={hx} y={LG - 40 + bob} s={0.9} eyes="open" mouth="grin" look={[side * -10, 6]} talk={gt} />
                    <HardHat x={hx + 2} y={LG - 108 + bob} s={1.5} />
                  </g>
                );
              })}
            </g>
          )}
        </g>
      )}

      {!moThere && rise > -1800 && (
        <XTooth {...lowerTooth(MO_X)} top={LG - 320 * S + rise} tilt={Math.sin(f * 0.25) * 8} shade frame={f} {...moFace} crack={1} arms="reach" talk={moTalk} />
      )}
      {showForceps && <Forceps tip={tip} open={f < BEAT.grab ? 1 : 0} />}

      {tongueOn && (
        <g transform={`translate(${(1 - tongueIn) * 700} 0)`}>
          <Tongue tip={[MO_X + 20, LG + 6]} squish={tonguePoke * 26} eyes={tonguePoke > 0.3 ? 'squeeze' : 'open'} mouth="grin" look={[-12, 14]} talk={talkOf(f, 'tongue')} />
        </g>
      )}
      {f >= BEAT.bone[0] && f < BEAT.bone[1] + 4 && (
        <Googly x={540} y={1660} s={1.15} eyes="half" brows="worried" mouth="frown" look={[0, 8]} talk={talkOf(f, 'bone')} />
      )}
    </g>
  );
};

// ---------------------------------------------------------------- Brain HQ (big brain)
const BrainHQ: React.FC<{f: number; mood: 'alarm' | 'yell' | 'calm'}> = ({f, mood}) => {
  const alarm = mood === 'alarm';
  const blink = alarm && Math.floor(f / 6) % 2 === 0;
  const face: Face =
    mood === 'alarm'
      ? {eyes: 'wide', brows: 'worried', mouth: 'yell', look: [0, -26]}
      : mood === 'yell'
        ? {eyes: 'squeeze', brows: 'angry', mouth: 'yell', look: [0, 0]}
        : {eyes: 'open', brows: 'none', mouth: 'smile', look: [0, 4]};
  const zoom = 1 + (f % 400) * 0.0003;
  return (
    <g>
      <Cavity />
      {alarm && <path d={`M 540 120 L ${blink ? 120 : 960} -40 L ${blink ? 300 : 780} -40 Z`} fill="#FF4040" opacity={0.25} />}
      <rect x={490} y={110} width={100} height={60} rx={30} fill={blink ? '#FF3030' : '#B02424'} stroke={X.ink} strokeWidth={7} />
      <rect x={250} y={170} width={580} height={360} rx={30} fill="#3A1A1E" stroke={X.ink} strokeWidth={9} />
      <rect x={276} y={196} width={528} height={308} rx={18} fill="#24110F" />
      {[0, 1, 2].map((i) => {
        const hot = i === 1 && alarm;
        return (
          <g key={i} transform={`translate(${370 + i * 170} 380) scale(0.36)`}>
            <path
              d="M 50 180 C 30 60, 130 10, 160 50 C 185 80, 215 80, 240 50 C 270 10, 370 60, 350 180 C 340 260, 330 300, 310 360 C 300 420, 290 470, 260 470 C 230 470, 225 400, 200 380 C 175 400, 170 470, 140 470 C 110 470, 100 420, 90 360 C 70 300, 60 260, 50 180 Z"
              transform="translate(-200 -260)"
              fill={hot ? (blink ? '#FF4545' : '#992222') : '#5FD38A'}
            />
          </g>
        );
      })}
      <path d="M -60 1640 L 1140 1640 L 1140 1990 L -60 1990 Z" fill="#E9CFA9" stroke={X.ink} strokeWidth={8} />
      <rect x={-60} y={1640} width={1200} height={34} fill="#D7B88C" stroke={X.ink} strokeWidth={6} />
      {[150, 280, 800, 930].map((x, i) => (
        <circle key={i} cx={x} cy={1760} r={30} fill={i % 2 ? '#5FD38A' : alarm && blink ? '#FF4545' : '#FFC94A'} stroke={X.ink} strokeWidth={6} />
      ))}
      <g transform={`translate(540 1330) scale(${zoom}) translate(-540 -1330)`}>
        <Brain x={540} y={1330} s={1.45} frame={f} armsUp={mood !== 'calm'} {...face} talk={talkOf(f, 'brain')} />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- camera
type Cam = {s: number; cx: number; cy: number};
const WIDE: Cam = {s: 1, cx: 540, cy: 960};
const lerpCam = (a: Cam, b: Cam, t: number): Cam => ({s: a.s + (b.s - a.s) * t, cx: a.cx + (b.cx - a.cx) * t, cy: a.cy + (b.cy - a.cy) * t});
/** Keyframes: [frame, cam, cut?]. Between keyframes the camera eases (pan / zoom); `cut` jumps. */
const CAM_KEYS: [number, Cam, boolean][] = [
  [BEAT.hqEnd, camOn(MO_X, MO_MOUTH, 1.5), true], // Mo close-up
  [BEAT.grab, camOn(MO_X, MO_MOUTH, 1.68), false], // slow push-in while he protests
  [BEAT.pop, camOn(MO_X, MO_MOUTH, 1.6), false],
  [BEAT.pop + 50, {s: 1.35, cx: 540, cy: 980}, false], // tilt up as Mo floats away
  [BEAT.gums, camOn(MO_X, LG + 23, 1.75), true], // socket + gum workers
  [BEAT.patchEnd, camOn(MO_X, LG + 23, 1.85), false],
  [BEAT.tongueIn, camOn(650, 1126, 1.35), true], // tongue + socket
  [BEAT.brain3[0], camOn(650, 1126, 1.45), false],
  [BEAT.tongue2, camOn(660, 1126, 1.6), true],
  [BEAT.quiz[0], WIDE, true], // the quiz needs the whole row
  [BEAT.righty - 16, WIDE, false],
  [BEAT.righty, camOn(RIGHTY_X - 70, MO_MOUTH, 1.75), false], // pan to Righty
  [BEAT.lefty - 12, camOn(RIGHTY_X - 70, MO_MOUTH, 1.8), false],
  [BEAT.lefty, camOn(LEFTY_X + 45, LEFTY_MOUTH, 1.9), false], // pan to Lefty
  [BEAT.upper - 12, camOn(LEFTY_X + 45, LEFTY_MOUTH, 1.95), false],
  [BEAT.upper, camOn(MO_X, upperMouth(40), 1.75), false], // tilt up to Upper
  [BEAT.reveal, camOn(MO_X, upperMouth(120), 1.8), false],
  [BEAT.reveal + 16, WIDE, false], // pull back: the reveal
  [BEAT.bone[0], camOn(MO_X, 1730, 1.7), true], // jaw bone
  [BEAT.upper2, camOn(MO_X, upperMouth(130), 1.85), true], // Upper: "or I keep coming down"
  [BEAT.endCard, WIDE, true],
  [BEAT.reaction, camOn(MO_X, upperMouth(160), 2.3), true], // final reaction face
  [BEAT.total, camOn(MO_X, upperMouth(160), 2.45), false],
];
const camAt = (f: number): Cam => {
  let prev = CAM_KEYS[0];
  for (let i = 1; i < CAM_KEYS.length; i++) {
    const k = CAM_KEYS[i];
    if (f < k[0]) {
      if (k[2]) return prev[1]; // next is a cut: hold until it happens
      const t = interpolate(f, [prev[0], k[0]], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
      return lerpCam(prev[1], k[1], t);
    }
    prev = k;
  }
  return prev[1];
};
type Shot = 'hq' | 'mouth';
const shotAt = (f: number): {kind: Shot; mood?: 'alarm' | 'yell' | 'calm'} => {
  if (f < BEAT.hqEnd) return {kind: 'hq', mood: 'alarm'};
  if (f >= BEAT.brain3[0] && f < BEAT.tongue2) return {kind: 'hq', mood: 'yell'};
  if (f >= BEAT.brain6[0] && f < BEAT.upper2) return {kind: 'hq', mood: 'calm'};
  return {kind: 'mouth'};
};

// ---------------------------------------------------------------- overlays (screen space)
const Big: React.FC<{text: string; x: number; y: number; size: number; color: string; s: number; stroke?: number}> = ({text, x, y, size, color, s, stroke = 16}) =>
  s <= 0 ? null : (
    <text
      x={x}
      y={y}
      transform={`translate(${x} ${y}) scale(${s}) skewX(-6) translate(${-x} ${-y})`}
      textAnchor="middle"
      dominantBaseline="middle"
      fontFamily={CAPTION_FONT}
      fontSize={size}
      fill={color}
      stroke={X.ink}
      strokeWidth={stroke}
      paintOrder="stroke"
    >
      {text}
    </text>
  );

/** Readable label: 76px bold, white with a dark outline, at least 1.2 s on screen. */
const LABEL_MIN = 36;
const Label: React.FC<{text: string; x: number; y: number; from: number; to: number; f: number}> = ({text, x, y, from, to, f}) => {
  const end = Math.max(to, from + LABEL_MIN + 8);
  if (f < from || f > end) return null;
  const s = Math.min(sp(f, from), interpolate(f, [end - 8, end], [1, 0], clamp));
  return (
    <text
      x={x}
      y={y}
      transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}
      textAnchor="middle"
      dominantBaseline="middle"
      fontFamily={fontFamily}
      fontWeight={700}
      fontSize={76}
      fill={X.white}
      stroke={X.ink}
      strokeWidth={14}
      paintOrder="stroke"
      strokeLinejoin="round"
    >
      {text}
    </text>
  );
};

const Quiz: React.FC<{f: number}> = ({f}) => {
  if (f < BEAT.quiz[0] || f >= BEAT.quiz[1]) return null;
  const n = f >= BEAT.countdown[2] ? 1 : f >= BEAT.countdown[1] ? 2 : f >= BEAT.countdown[0] ? 3 : null;
  const lastTick = [...BEAT.countdown].reverse().find((c) => f >= c) ?? BEAT.quiz[0];
  const badge = (x: number, y: number, ch: string, d: number, tx: number, ty: number) => {
    const s = sp(f, BEAT.quiz[0] + d);
    return (
      <g>
        <line x1={x} y1={y} x2={x + (tx - x) * s} y2={y + (ty - y) * s} stroke={X.gold} strokeWidth={14} strokeLinecap="round" />
        <g transform={`translate(${x} ${y}) scale(${s})`}>
          <circle r={118} fill={X.gold} stroke={X.ink} strokeWidth={12} />
          <text y={10} textAnchor="middle" dominantBaseline="middle" fontFamily={CAPTION_FONT} fontSize={150} fill={X.ink}>
            {ch}
          </text>
        </g>
      </g>
    );
  };
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2040} fill="#000" opacity={0.3} />
      <ellipse cx={540} cy={LG + 20} rx={170} ry={60} fill={X.gold} opacity={0.4 + 0.2 * Math.sin(f * 0.4)} />
      {badge(150, 1345, 'A', 4, 175, 1240)}
      {badge(930, 1345, 'B', 9, 900, 1240)}
      {badge(840, 600, 'C', 14, 640, 700)}
      <Big text="WHO MOVES IN?" x={540} y={290} size={118} color={X.white} s={sp(f, BEAT.quiz[0])} />
      {n !== null && (
        <g transform={`translate(540 455) scale(${0.8 + 0.2 * sp(f, lastTick)})`}>
          <circle r={80} fill={X.white} stroke={X.ink} strokeWidth={10} />
          <text y={10} textAnchor="middle" dominantBaseline="middle" fontFamily={CAPTION_FONT} fontSize={110} fill={X.red}>
            {n}
          </text>
        </g>
      )}
      <g opacity={Math.min(1, sp(f, BEAT.quiz[0] + 18))}>
        <Big text="COMMENT A, B OR C" x={490} y={1560} size={86} color={X.white} s={1} stroke={14} />
        <PointDown x={960} y={1560} s={1.1} bob={Math.sin(f * 0.35) * 10} />
      </g>
    </g>
  );
};

const LaterCard: React.FC<{f: number}> = ({f}) => {
  const a = BEAT.later;
  if (f < a || f > BEAT.righty + 26) return null;
  const flip = interpolate(f, [a, a + 6, a + 12, a + 18], [1, -1, 1, -1], clamp);
  const s = sp(f, a) * interpolate(f, [BEAT.righty + 14, BEAT.righty + 26], [1, 0], clamp);
  return (
    <g transform={`translate(540 300) scale(${s})`}>
      <g transform={`scale(1 ${Math.abs(flip) * 0.6 + 0.4})`}>
        <rect x={-320} y={-115} width={640} height={230} rx={26} fill={X.white} stroke={X.ink} strokeWidth={9} />
        <rect x={-320} y={-115} width={640} height={62} rx={26} fill={X.red} stroke={X.ink} strokeWidth={9} />
      </g>
      <Big text="6 MONTHS LATER" x={0} y={40} size={84} color={X.gold} s={1} />
    </g>
  );
};

const EndCard: React.FC<{f: number}> = ({f}) => {
  if (f < BEAT.endCard || f >= BEAT.reaction) return null;
  const a = BEAT.endCard;
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2040} fill="#000" opacity={0.4 * Math.min(1, (f - a) / 6)} />
      <Big text="TEETH DON'T GROW." x={540} y={780} size={112} color={X.white} s={sp(f, a)} />
      <Big text="THEY MOVE." x={540} y={950} size={176} color={X.gold} s={sp(f, a + 8)} stroke={20} />
      <g opacity={Math.min(1, sp(f, a + 18))}>
        <Big text="GOT A GAP?" x={540} y={1210} size={100} color={X.white} s={1} />
        <Big text="COMMENT" x={480} y={1340} size={100} color={X.white} s={1} />
        <PointDown x={790} y={1330} s={1.05} bob={Math.sin(f * 0.35) * 10} />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- root
export const GapScene: React.FC = () => {
  const f = useCurrentFrame();
  const shot = shotAt(f);
  const cam = camAt(f);
  return (
    <g>
      <ShadeDefs />
      <SoftShadeDefs />
      {shot.kind === 'hq' && <BrainHQ f={f} mood={shot.mood ?? 'calm'} />}
      {shot.kind === 'mouth' && (
        <g>
          <Cavity />
          <g transform={`translate(540 960) scale(${cam.s}) translate(${-cam.cx} ${-cam.cy})`}>
            <Mouth f={f} />
          </g>
          {/* labels in screen space, clear of the caption band (y≈860-1000) */}
          <Label text="Molar" x={540} y={330} from={L('mo1').from} to={L('mo1').to} f={f} />
          <Label text="Socket" x={300} y={1330} from={BEAT.gums} to={BEAT.patchEnd} f={f} />
          <Label text="Gums" x={800} y={1330} from={BEAT.gums + 6} to={BEAT.patchEnd} f={f} />
          <Label text="Tongue" x={540} y={330} from={BEAT.tongueIn + 6} to={L('tongue1').to} f={f} />
          <Label text="Tipping" x={540} y={1330} from={BEAT.righty} to={BEAT.lefty} f={f} />
          <Label text="Drifting" x={540} y={1330} from={BEAT.lefty} to={BEAT.upper} f={f} />
          <Label text="Over-erupting" x={540} y={1330} from={BEAT.upper + 10} to={BEAT.reveal} f={f} />
          <Label text="Jaw Bone" x={540} y={330} from={BEAT.bone[0]} to={BEAT.bone[1]} f={f} />
          <Quiz f={f} />
          <LaterCard f={f} />
          {f >= BEAT.reveal + 6 && f < BEAT.bone[0] && <Big text="ALL OF THEM!" x={540} y={300} size={118} color={X.gold} s={sp(f, BEAT.reveal + 10)} />}
          <EndCard f={f} />
        </g>
      )}
    </g>
  );
};

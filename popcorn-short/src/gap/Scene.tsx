import React from 'react';
import {Easing, interpolate, random, spring, useCurrentFrame} from 'remotion';
import {FPS, SPRING, clamp, fontFamily, squash} from '../theme';
import {Cavity} from '../enamelv3/Backdrop';
import {XTooth} from '../enamelv3/XTooth';
import {CAPTION_FONT, X} from '../enamelv3/style';
import {gapDialogue} from '../audio/gapDialogue';
import timings from '../audio/gapTimings.json';
import {Brain, Forceps, Googly, HardHat, Heart, IcePack, Lungs, Tongue} from './Props';
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

// ---------------------------------------------------------------- layout
const S = 1.25;
const LG = 1420; // lower gum line
const UG = 440; // upper gum line
const LEFTY_X = 180;
const MO_X = 540;
const RIGHTY_X = 905;
const lowerTooth = (cx: number, s = S) => ({left: cx - 200 * s, top: LG - 320 * s, scale: s});
const upperTooth = (cx: number, drop = 0) => ({left: cx - 200 * S, top: UG - 320 * S + drop, scale: S});

// key moments
export const POP = 378; // Mo comes out
export const PATCH = [456, 530];
export const POKES = [546, 562, 578, 640, 654, 1326];
export const QUIZ = [668, 792];
export const LATER = 792;
export const RIGHTY_GO = 812;
export const LEFTY_GO = 854;
export const UPPER_GO = 918;
export const BONE = [1062, 1172];
export const END = 1290;

// ---------------------------------------------------------------- pieces
const LowerBone: React.FC<{dip: number}> = ({dip}) => {
  const y = LG + 70;
  const d = `M -60 ${y} L 370 ${y} C 450 ${y}, 460 ${y + dip}, 540 ${y + dip} C 620 ${y + dip}, 630 ${y}, 710 ${y} L 1140 ${y} L 1140 1990 L -60 1990 Z`;
  return (
    <g>
      <defs>
        <clipPath id="lbone">
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill={X.bone} stroke={X.line} strokeWidth={6} />
      <g clipPath="url(#lbone)">
        {Array.from({length: 40}).map((_, i) => (
          <ellipse key={i} cx={random(`lx${i}`) * 1080} cy={y + 40 + random(`ly${i}`) * 420} rx={8 + random(`lr${i}`) * 14} ry={6 + random(`lq${i}`) * 9} fill={X.boneDot} opacity={0.7} />
        ))}
      </g>
    </g>
  );
};
const UpperBone: React.FC = () => {
  const y = UG - 70;
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={y + 60} fill={X.bone} stroke={X.line} strokeWidth={6} />
      {Array.from({length: 26}).map((_, i) => (
        <ellipse key={i} cx={random(`ux${i}`) * 1080} cy={random(`uy${i}`) * (y - 30)} rx={8 + random(`ur${i}`) * 14} ry={6 + random(`uq${i}`) * 9} fill={X.boneDot} opacity={0.7} />
      ))}
    </g>
  );
};
const LowerGum: React.FC<{dip: number; papillae: number[]}> = ({dip, papillae}) => {
  const y = LG;
  const pts = [`M -60 ${y + 20}`];
  for (const px of papillae) pts.push(`L ${px - 80} ${y + 16}`, `C ${px - 36} ${y + 10}, ${px - 20} ${y - 70}, ${px} ${y - 74}`, `C ${px + 20} ${y - 70}, ${px + 36} ${y + 10}, ${px + 80} ${y + 16}`);
  pts.push(`L 380 ${y + 18} C 460 ${y + 18}, 470 ${y + 18 + dip}, 540 ${y + 18 + dip} C 610 ${y + 18 + dip}, 620 ${y + 18}, 700 ${y + 18}`);
  pts.push(`L 1140 ${y + 20} L 1140 ${y + 130} C 620 ${y + 130 + dip}, 460 ${y + 130 + dip}, -60 ${y + 130} Z`);
  return (
    <g>
      <path d={pts.join(' ')} fill={X.gum} stroke={X.line} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M -20 ${y + 62} Q 540 ${y + 82 + dip} 1100 ${y + 62}`} stroke={X.gumLight} strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.8} />
    </g>
  );
};
const UpperGum: React.FC<{papillae: number[]}> = ({papillae}) => {
  const y = UG;
  const pts = [`M -60 ${y - 20}`];
  for (const px of papillae) pts.push(`L ${px - 80} ${y - 16}`, `C ${px - 36} ${y - 10}, ${px - 20} ${y + 70}, ${px} ${y + 74}`, `C ${px + 20} ${y + 70}, ${px + 36} ${y - 10}, ${px + 80} ${y - 16}`);
  pts.push(`L 1140 ${y - 20} L 1140 ${y - 130} Q 540 ${y - 150} -60 ${y - 130} Z`);
  return (
    <g>
      <path d={pts.join(' ')} fill={X.gum} stroke={X.line} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M -20 ${y - 62} Q 540 ${y - 82} 1100 ${y - 62}`} stroke={X.gumLight} strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.8} />
    </g>
  );
};

export const Label: React.FC<{text: string; x: number; y: number; s: number; px?: number; py?: number}> = ({text, x, y, s, px, py}) =>
  s <= 0 ? null : (
    <g opacity={Math.min(1, s)}>
      {px !== undefined && py !== undefined && (
        <>
          <line x1={x} y1={y + (py > y ? 20 : -50)} x2={px} y2={py} stroke={X.white} strokeWidth={5} strokeLinecap="round" />
          <circle cx={px} cy={py} r={9} fill={X.white} stroke={X.ink} strokeWidth={3} />
        </>
      )}
      <text x={x} y={y} transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={60} fill={X.white} style={{filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.4))'}}>
        {text}
      </text>
    </g>
  );
const labelS = (f: number, a: number, b: number) => (f < a || f > b ? 0 : Math.min(sp(f, a), interpolate(f, [b - 8, b], [1, 0], clamp)));

// ---------------------------------------------------------------- the mouth set
const Mouth: React.FC<{f: number}> = ({f}) => {
  // --- Mo (the patient)
  const moThere = f < POP;
  const wiggle = f >= 350 && f < POP ? Math.sin((f - 350) * 1.1) * 8 : 0;
  const rise = interpolate(f, [POP, 452], [0, -1700], {...clamp, easing: Easing.in(Easing.quad)});
  let moFace: {eyes: any; mouth: any; brows: any; look: [number, number]} = {eyes: 'half', mouth: 'frown', brows: 'worried', look: [0, 6]};
  if (f >= 268 && f < 350) moFace = {eyes: 'wide', mouth: 'o', brows: 'angry', look: [0, 0]};
  if (f >= 330 && f < POP) moFace = {eyes: 'wide', mouth: 'o', brows: 'worried', look: [14, -16]};
  if (f >= POP) moFace = {eyes: 'closed', mouth: 'smile', brows: 'none', look: [0, 0]};
  const moTalk = talkOf(f, 'mo');

  // --- forceps: in from the upper right, grab, wiggle, pull
  const reach = interpolate(sp(f, 330), [0, 1], [0, 1]);
  const tip: [number, number] = [MO_X + 30 + (1 - reach) * 700, 1050 - (1 - reach) * 600 + rise];
  const showForceps = f >= 330 && f < 452;

  // --- socket + gums patching
  const socketOpen = f >= POP;
  const patch = interpolate(f, PATCH, [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});

  // --- the land grab
  const righty = sp(f, RIGHTY_GO);
  const lefty = sp(f, LEFTY_GO);
  const drop = interpolate(f, [UPPER_GO, 990], [0, 120], {...clamp, easing: Easing.inOut(Easing.quad)}) + interpolate(f, [1300, 1340], [0, 40], {...clamp, easing: Easing.inOut(Easing.quad)});
  const boneDip = interpolate(f, BONE, [0, 70], {...clamp, easing: Easing.inOut(Easing.quad)});

  // --- reactions
  const shocked = f >= POP && f < 456;
  const quiz = f >= QUIZ[0] && f < QUIZ[1];
  const nbLook: [number, number] = quiz ? [0, 0] : shocked ? [0, -20] : f >= 540 && f < 668 ? [0, 10] : [0, 0];
  const rTalk = talkOf(f, 'righty');
  const lTalk = talkOf(f, 'lefty');
  const uTalk = talkOf(f, 'upper');

  const lowerPapillae = moThere ? [360, 722] : [];
  const tonguePoke = POKES.reduce((acc, p) => acc + Math.max(0, 1 - Math.abs(f - p - 3) / 5), 0);
  const tongueOn = (f >= 528 && f < 668) || (f >= 1312 && f < 1350);
  const tongueIn = f < 1000 ? sp(f, 528) : sp(f, 1312);

  return (
    <g>
      {/* upper jaw */}
      <UpperBone />
      <XTooth {...upperTooth(LEFTY_X)} flip faceless frame={f} />
      <XTooth {...upperTooth(RIGHTY_X)} flip faceless frame={f} />
      <XTooth
        {...upperTooth(MO_X, drop)}
        flip
        frame={f}
        eyes={f >= UPPER_GO ? (f < 1000 ? 'half' : 'open') : quiz ? 'wide' : shocked ? 'wide' : 'open'}
        brows={f >= UPPER_GO ? 'proud' : 'none'}
        mouth={f >= UPPER_GO ? 'smirk' : shocked ? 'o' : 'smile'}
        look={quiz ? [0, 0] : [0, -14]}
        talk={uTalk}
      />
      <UpperGum papillae={[360, 722]} />

      {/* lower jaw */}
      <LowerBone dip={boneDip} />
      <XTooth
        {...lowerTooth(LEFTY_X, 1.12)}
        left={LEFTY_X - 200 * 1.12 + lefty * 45}
        squash={[0.82, 1]}
        tilt={lefty * 12}
        frame={f}
        eyes={f >= LEFTY_GO ? 'half' : shocked || quiz ? 'wide' : 'open'}
        brows={f >= LEFTY_GO ? 'proud' : 'none'}
        mouth={f >= LEFTY_GO ? 'smirk' : shocked ? 'o' : 'smile'}
        look={f >= LEFTY_GO ? [12, 0] : nbLook}
        arms={shocked ? 'reach' : 'rest'}
        talk={lTalk}
      />
      <XTooth
        {...lowerTooth(RIGHTY_X)}
        left={RIGHTY_X - 200 * S - righty * 70}
        tilt={-16 * righty}
        frame={f}
        eyes={f >= RIGHTY_GO ? 'open' : shocked || quiz ? 'wide' : 'open'}
        brows={f >= RIGHTY_GO ? 'proud' : 'none'}
        mouth={f >= RIGHTY_GO ? 'grin' : shocked ? 'o' : 'smile'}
        look={f >= RIGHTY_GO ? [-14, 4] : nbLook}
        arms={shocked ? 'reach' : f >= RIGHTY_GO && f < 900 ? 'flex' : 'rest'}
        talk={rTalk}
      />
      {moThere && (
        <XTooth
          {...lowerTooth(MO_X)}
          tilt={wiggle}
          frame={f}
          {...moFace}
          crack={1}
          pain={0.6 + 0.3 * Math.abs(Math.sin(f * 0.15))}
          sweat={2}
          arms={f >= 268 ? 'panic' : 'rest'}
          talk={moTalk}
        />
      )}
      <LowerGum dip={boneDip * 0.8} papillae={lowerPapillae} />
      {moThere && f < 268 && <IcePack x={MO_X + 10} y={LG - 320 * S + 10} />}

      {/* socket (empty hole) that the gums patch up */}
      {socketOpen && (
        <g>
          <ellipse cx={MO_X} cy={LG + 26 + boneDip * 0.8} rx={150 * (1 - patch) + 4} ry={40 * (1 - patch) + 2} fill="#8E2E3E" stroke={X.line} strokeWidth={6} opacity={1 - patch * 0.95} />
          {f >= PATCH[0] - 4 && f < PATCH[1] + 20 && (
            <g opacity={interpolate(f, [PATCH[1] + 8, PATCH[1] + 20], [1, 0], clamp)}>
              {[-1, 1].map((side) => {
                const hx = MO_X + side * (170 - patch * 80);
                const bob = Math.abs(Math.sin(f * 0.6 + side)) * -12;
                return (
                  <g key={side}>
                    <Googly x={hx} y={LG + 70 + bob} s={0.45} eyes="open" mouth={talkOf(f, 'gums') > 0.08 ? 'grin' : 'smile'} look={[side * -10, 6]} talk={talkOf(f, 'gums')} />
                    <HardHat x={hx + 2} y={LG + 34 + bob} s={0.75} />
                  </g>
                );
              })}
            </g>
          )}
        </g>
      )}

      {/* Mo floats away, waving */}
      {!moThere && rise > -1700 && (
        <XTooth {...lowerTooth(MO_X)} top={LG - 320 * S + rise} tilt={Math.sin(f * 0.25) * 8} frame={f} {...moFace} crack={1} arms="reach" talk={moTalk} />
      )}
      {showForceps && <Forceps tip={tip} open={f < 348 ? 1 : 0} />}

      {/* tongue */}
      {tongueOn && (
        <g transform={`translate(${(1 - tongueIn) * 700} 0)`}>
          <Tongue
            tip={[MO_X + 20, LG + 6]}
            squish={tonguePoke * 26}
            eyes={tonguePoke > 0.3 ? 'squeeze' : 'open'}
            mouth="grin"
            look={[-12, 14]}
            talk={talkOf(f, 'tongue')}
          />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- Brain HQ
const BrainHQ: React.FC<{f: number; alarm: boolean; mood: 'alarm' | 'yell' | 'calm'}> = ({f, alarm, mood}) => {
  const blink = alarm && Math.floor(f / 6) % 2 === 0;
  const talk = talkOf(f, 'brain');
  const face: Face =
    mood === 'alarm'
      ? {eyes: 'wide', brows: 'worried', mouth: 'yell', look: [0, -26]}
      : mood === 'yell'
        ? {eyes: 'squeeze', brows: 'angry', mouth: 'yell', look: [0, 0]}
        : {eyes: 'open', brows: 'none', mouth: 'smile', look: [0, 4]};
  return (
    <g>
      <Cavity />
      {/* siren */}
      {alarm && <path d={`M 540 160 L ${blink ? 120 : 960} -40 L ${blink ? 300 : 780} -40 Z`} fill="#FF4040" opacity={0.25} />}
      <rect x={490} y={150} width={100} height={60} rx={30} fill={blink ? '#FF3030' : '#B02424'} stroke={X.ink} strokeWidth={7} />
      {/* monitor with the tooth map */}
      <rect x={180} y={210} width={720} height={440} rx={34} fill="#3A1A1E" stroke={X.ink} strokeWidth={9} />
      <rect x={210} y={240} width={660} height={380} rx={20} fill="#24110F" />
      {[0, 1, 2].map((i) => {
        const hot = i === 1 && alarm;
        return (
          <g key={i} transform={`translate(${320 + i * 220} 450) scale(0.42)`}>
            <path
              d="M 50 180 C 30 60, 130 10, 160 50 C 185 80, 215 80, 240 50 C 270 10, 370 60, 350 180 C 340 260, 330 300, 310 360 C 300 420, 290 470, 260 470 C 230 470, 225 400, 200 380 C 175 400, 170 470, 140 470 C 110 470, 100 420, 90 360 C 70 300, 60 260, 50 180 Z"
              transform="translate(-200 -260)"
              fill={hot ? (blink ? '#FF4545' : '#992222') : '#5FD38A'}
              opacity={0.9}
            />
          </g>
        );
      })}
      {alarm && (
        <text x={540} y={330} textAnchor="middle" fontFamily={CAPTION_FONT} fontSize={64} fill={blink ? '#FF5050' : '#FF9A9A'}>
          !!!
        </text>
      )}
      {/* desk */}
      <path d="M -60 1590 L 1140 1590 L 1140 1990 L -60 1990 Z" fill="#E9CFA9" stroke={X.ink} strokeWidth={8} />
      <rect x={-60} y={1590} width={1200} height={34} fill="#D7B88C" stroke={X.ink} strokeWidth={6} />
      {[200, 330, 750, 880].map((x, i) => (
        <circle key={i} cx={x} cy={1700} r={30} fill={i % 2 ? '#5FD38A' : alarm && blink ? '#FF4545' : '#FFC94A'} stroke={X.ink} strokeWidth={6} />
      ))}
      <Brain x={540} y={1300} s={1.2} frame={f} armsUp={mood !== 'calm'} {...face} talk={talk} />
    </g>
  );
};

// ---------------------------------------------------------------- chest
const Chest: React.FC<{f: number}> = ({f}) => {
  const beat = Math.abs(Math.sin(f * 0.55)) ** 6;
  const exhale = interpolate(f, [238, 256], [0, 1], clamp);
  const puff = 1.1 - exhale * 0.2;
  return (
    <g>
      <Cavity />
      <Lungs
        x={540}
        y={1330}
        s={1.4}
        puff={puff}
        eyes={f < 238 ? 'squeeze' : 'half'}
        mouth={f < 238 ? 'flat' : 'frown'}
        brows={f < 238 ? 'worried' : 'none'}
        talk={talkOf(f, 'lungs')}
      />
      <Heart x={540} y={1560} s={1.15 + beat * 0.1} eyes="wide" brows="worried" mouth="o" look={[0, -8]} talk={talkOf(f, 'heart')} />
      {/* sweat on the heart */}
      <path transform={`translate(${770} ${1390 + ((f * 3) % 60)})`} d="M 0 -20 C 8 -8, 14 0, 14 6 A 14 14 0 0 1 -14 6 C -14 0, -8 -8, 0 -20 Z" fill="#9ED8FF" stroke={X.ink} strokeWidth={4} />
      <Label text="Heart" x={890} y={1800} s={labelS(f, 146, 236)} />
      <Label text="Lungs" x={150} y={760} s={labelS(f, 150, 236)} />
    </g>
  );
};

// ---------------------------------------------------------------- shots + overlays
type Cam = {s: number; cx: number; cy: number};
const WIDE: Cam = {s: 1, cx: 540, cy: 960};
const shotAt = (f: number): {kind: 'hq' | 'mouth' | 'chest'; cam: Cam; mood?: 'alarm' | 'yell' | 'calm'} => {
  if (f < 80) return {kind: 'hq', cam: WIDE, mood: 'alarm'};
  if (f < 142) return {kind: 'mouth', cam: {s: 1.35, cx: 540, cy: 1180}};
  if (f < 268) return {kind: 'chest', cam: WIDE};
  if (f >= 592 && f < 632) return {kind: 'hq', cam: WIDE, mood: 'yell'};
  if (f >= BONE[0] && f < 1176) return {kind: 'mouth', cam: {s: 1.6, cx: 540, cy: 1520}};
  return {kind: 'mouth', cam: WIDE};
};

const BrainInset: React.FC<{f: number}> = ({f}) => (
  <g>
    <circle cx={160} cy={190} r={130} fill={X.bg} stroke={X.white} strokeWidth={10} />
    <defs>
      <clipPath id="inset">
        <circle cx={160} cy={190} r={124} />
      </clipPath>
    </defs>
    <g clipPath="url(#inset)">
      <Brain x={160} y={235} s={0.42} frame={f} headset eyes="open" mouth="smile" look={[0, 0]} talk={talkOf(f, 'brain')} />
    </g>
  </g>
);

const Big: React.FC<{text: string; x: number; y: number; size: number; color: string; s: number}> = ({text, x, y, size, color, s}) =>
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
      strokeWidth={16}
      paintOrder="stroke"
    >
      {text}
    </text>
  );

const Quiz: React.FC<{f: number}> = ({f}) => {
  if (f < QUIZ[0] || f >= QUIZ[1]) return null;
  const t = f - QUIZ[0];
  const left = Math.max(1, 3 - Math.floor(Math.max(0, t - 30) / 30));
  const badge = (x: number, y: number, ch: string, d: number, tx: number, ty: number) => {
    const s = sp(f, QUIZ[0] + d);
    return (
      <g>
        <line x1={x} y1={y} x2={x + (tx - x) * s} y2={y + (ty - y) * s} stroke={X.gold} strokeWidth={10} strokeLinecap="round" />
        <g transform={`translate(${x} ${y}) scale(${s})`}>
          <circle r={58} fill={X.gold} stroke={X.ink} strokeWidth={8} />
          <text y={6} textAnchor="middle" dominantBaseline="middle" fontFamily={CAPTION_FONT} fontSize={70} fill={X.ink}>
            {ch}
          </text>
        </g>
      </g>
    );
  };
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2040} fill="#000" opacity={0.35} />
      <ellipse cx={540} cy={LG + 20} rx={170} ry={60} fill={X.gold} opacity={0.35 + 0.2 * Math.sin(f * 0.4)} />
      {badge(140, 1010, 'A', 6, 180, 1150)}
      {badge(940, 1010, 'B', 12, 905, 1150)}
      {badge(800, 700, 'C', 18, 640, 720)}
      <Big text="WHO MOVES IN?" x={540} y={300} size={104} color={X.white} s={sp(f, QUIZ[0])} />
      <g transform="translate(960 150)">
        <circle r={74} fill={X.white} stroke={X.ink} strokeWidth={8} />
        <circle r={60} fill="none" stroke={X.red} strokeWidth={14} strokeDasharray={377} strokeDashoffset={377 * ((t % 30) / 30)} transform="rotate(-90)" />
        <text y={8} textAnchor="middle" dominantBaseline="middle" fontFamily={CAPTION_FONT} fontSize={72} fill={X.ink}>
          {left}
        </text>
      </g>
    </g>
  );
};

const LaterCard: React.FC<{f: number}> = ({f}) => {
  if (f < LATER || f > 870) return null;
  const flip = interpolate(f, [LATER, LATER + 6, LATER + 12, LATER + 18], [1, -1, 1, -1], clamp);
  const s = sp(f, LATER) * interpolate(f, [856, 870], [1, 0], clamp);
  return (
    <g transform={`translate(540 300) scale(${s})`}>
      <g transform={`scale(1 ${Math.abs(flip) * 0.6 + 0.4})`}>
        <rect x={-300} y={-110} width={600} height={220} rx={26} fill={X.white} stroke={X.ink} strokeWidth={9} />
        <rect x={-300} y={-110} width={600} height={60} rx={26} fill={X.red} stroke={X.ink} strokeWidth={9} />
      </g>
      <Big text="6 MONTHS LATER" x={0} y={40} size={78} color={X.gold} s={1} />
    </g>
  );
};

export const GapScene: React.FC = () => {
  const f = useCurrentFrame();
  const shot = shotAt(f);
  const insetOn = (f >= QUIZ[0] && f < QUIZ[1]) || (f >= 1000 && f < 1060) || f >= 1176;
  return (
    <g>
      {shot.kind === 'hq' && <BrainHQ f={f} alarm={f < 80} mood={shot.mood ?? 'calm'} />}
      {shot.kind === 'chest' && <Chest f={f} />}
      {shot.kind === 'mouth' && (
        <g>
          <Cavity />
          <g transform={`translate(540 960) scale(${shot.cam.s}) translate(${-shot.cam.cx} ${-shot.cam.cy})`}>
            <Mouth f={f} />
            {/* labels (world space) */}
            <Label text="Molar" x={850} y={980} s={labelS(f, 84, 140)} px={700} py={1090} />
            <Label text="Socket" x={250} y={1760} s={labelS(f, 392, 452)} px={MO_X} py={LG + 30} />
            <Label text="Gums" x={830} y={1760} s={labelS(f, 460, 528)} px={650} py={LG + 60} />
            <Label text="Tongue" x={870} y={760} s={labelS(f, 536, 590)} />
            <Label text="Tipping" x={905} y={1760} s={labelS(f, 822, 1000)} />
            <Label text="Drifting" x={185} y={1760} s={labelS(f, 862, 1000)} />
            <Label text="Over-erupting" x={540} y={120} s={labelS(f, 930, 1058)} />
            <Label text="Jaw Bone" x={300} y={1720} s={labelS(f, BONE[0], BONE[1])} />
          </g>
          {/* bone gets a face in its close-up */}
          {f >= BONE[0] && f < 1176 && (
            <g transform={`translate(540 960) scale(${shot.cam.s}) translate(${-shot.cam.cx} ${-shot.cam.cy})`}>
              <Googly x={540} y={1640} s={0.7} eyes="half" brows="worried" mouth="frown" look={[0, 8]} talk={talkOf(f, 'bone')} />
            </g>
          )}
          <Quiz f={f} />
          <LaterCard f={f} />
          {(f >= 1000 && f < 1058) && <Big text="ALL OF THEM!" x={540} y={300} size={104} color={X.gold} s={sp(f, 1018)} />}
          {f >= END && (
            <g>
              <Big text="TEETH DON'T GROW." x={540} y={250} size={92} color={X.white} s={sp(f, END)} />
              <Big text="THEY MOVE." x={540} y={360} size={104} color={X.gold} s={sp(f, END + 8)} />
              <Big text="GOT A GAP? COMMENT 🦷" x={540} y={1640} size={72} color={X.white} s={sp(f, END + 16)} />
            </g>
          )}
        </g>
      )}
      {insetOn && shot.kind === 'mouth' && <BrainInset f={f} />}
    </g>
  );
};

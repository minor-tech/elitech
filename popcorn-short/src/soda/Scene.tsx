import React from 'react';
import {Easing, interpolate, random, spring, useCurrentFrame} from 'remotion';
import {FPS, SPRING, clamp, fontFamily, squash} from '../theme';
import {Cavity} from '../enamelv3/Backdrop';
import {ShadeDefs, XTooth} from '../enamelv3/XTooth';
import {CAPTION_FONT, X} from '../enamelv3/style';
import {Brain, PointDown, SoftShadeDefs} from '../gap/Props';
import type {Face} from '../gap/Props';
import {L, TOTAL_FRAMES, dialogue} from '../audio/sodaDialogue';
import timings from '../audio/sodaTimings.json';
import {Burp, CanInHand, Liquid, PhDial, Saliva, Spray, SugarBug, Twinkle} from './Props';

const sp = (f: number, at: number) => spring({frame: f - at, fps: FPS, config: SPRING});
type TL = Record<string, {mouth: number[]; words: {text: string; frame: number}[]}>;
const T = timings as unknown as TL;
const talkOf = (f: number, who: string) => {
  for (const l of dialogue) {
    if (l.character !== who) continue;
    const m = T[l.id]?.mouth;
    if (m && f >= l.fromFrame && f < l.fromFrame + m.length) return ((m[f - l.fromFrame] ?? 0) * 2 + (m[f - l.fromFrame - 1] ?? 0)) / 3;
  }
  return 0;
};
/** Absolute frame at which `word` is spoken in line `id` (falls back to the line's end). */
const wordAt = (id: string, word: string) => {
  const w = T[id]?.words?.find((x) => x.text.toUpperCase().includes(word));
  return w ? L(id).from + w.frame : L(id).to - 8;
};

// ---------------------------------------------------------------- beats (all from the voice timeline)
export const BEAT = (() => {
  const quizEnd = L('brain3').to + 46;
  const end0 = L('bug3').to + 4;
  return {
    tab: 8,
    spray: 12,
    inside: 34,
    waveIn: [34, 56] as const,
    brain1: [L('brain1').from, L('brain1').to] as const,
    bugsIn: L('bug1').from - 16,
    burp1: wordAt('bug1', 'BURP'),
    molar2: L('molar2').from,
    bug2: L('bug2').from,
    burp2: wordAt('bug2', 'BURP'),
    quiz: [L('brain2').from, quizEnd] as const,
    countdown: [L('brain3').to, L('brain3').to + 15, L('brain3').to + 30] as const,
    card: [quizEnd, L('saliva1').from] as const,
    sips: [quizEnd + 12, quizEnd + 24, quizEnd + 36] as const,
    salivaIn: L('saliva1').from - 6,
    sipHit: L('saliva2').from - 18,
    brain4: [L('brain4').from, L('brain4').to] as const,
    molar3: [L('molar3').from, L('molar3').to] as const,
    brain5: [L('brain5').from, L('brain5').to] as const,
    water: L('bug3').from - 18,
    smallBurp: wordAt('bug3', 'BURP'),
    endCard: end0,
    reaction: end0 + 78,
    total: TOTAL_FRAMES,
  };
})();

// ---------------------------------------------------------------- layout (world space)
const GUM = 1350;
const MS = 1.6; // molar scale
const molar = {left: 540 - 200 * MS, top: GUM - 320 * MS, scale: MS};
const W = (lx: number, ly: number): [number, number] => [540 + (lx - 200) * MS, GUM + (ly - 320) * MS];
const CUSP_L = W(140, 35);
const CUSP_R = W(262, 35);
const SODA_LEVEL = 690;

// ---------------------------------------------------------------- the mouth
const Gum: React.FC = () => {
  const y = GUM;
  const d = `M -60 ${y + 20} L 250 ${y + 18} C 285 ${y + 10}, 290 ${y - 60}, 300 ${y - 64} C 310 ${y - 60}, 320 ${y + 10}, 340 ${y + 16} L 740 ${y + 16} C 760 ${y + 10}, 770 ${y - 60}, 780 ${y - 64} C 790 ${y - 60}, 800 ${y + 10}, 830 ${y + 18} L 1140 ${y + 20} L 1140 ${y + 150} Q 540 ${y + 180} -60 ${y + 150} Z`;
  return (
    <g>
      <path d={d} fill={X.gum} stroke={X.line} strokeWidth={6} strokeLinejoin="round" />
      <path d={d} fill="url(#gumShadeDown)" />
      {[60, 540, 1020].map((x) => (
        <ellipse key={x} cx={x} cy={y + 30} rx={200} ry={36} fill="url(#xtDrop)" />
      ))}
      <path d={`M -20 ${y + 62} Q 540 ${y + 86} 1100 ${y + 62}`} stroke={X.gumLight} strokeWidth={20} fill="none" strokeLinecap="round" opacity={0.85} />
    </g>
  );
};
const Bone: React.FC = () => (
  <g>
    <rect x={-60} y={GUM + 80} width={1200} height={1200} fill={X.bone} stroke={X.line} strokeWidth={6} />
    {Array.from({length: 40}).map((_, i) => (
      <ellipse key={i} cx={random(`sbx${i}`) * 1080} cy={GUM + 120 + random(`sby${i}`) * 700} rx={8 + random(`sbr${i}`) * 14} ry={6 + random(`sbq${i}`) * 9} fill={X.boneDot} opacity={0.7} />
    ))}
  </g>
);

const Mouth: React.FC<{f: number}> = ({f}) => {
  // --- soda: rolls in, pools around the teeth, drains for the quiz; sips come back later
  const sodaFront = f < BEAT.waveIn[1] ? interpolate(f, BEAT.waveIn, [1200, -120], {...clamp, easing: Easing.out(Easing.quad)}) : -120;
  const sodaOn = f >= BEAT.waveIn[0] && f < BEAT.quiz[0];
  const sipFront = interpolate(f, [BEAT.sipHit, BEAT.sipHit + 14], [1200, -120], {...clamp, easing: Easing.out(Easing.quad)});
  const sipLevel = interpolate(f, [BEAT.sipHit + 20, BEAT.sipHit + 44], [SODA_LEVEL, GUM - 6], clamp);
  const sipOn = f >= BEAT.sipHit && f < BEAT.sipHit + 46;
  const waterFront = interpolate(f, [BEAT.water, BEAT.water + 18], [1200, -200], {...clamp, easing: Easing.out(Easing.quad)});
  const waterOn = f >= BEAT.water && f < BEAT.endCard;

  // --- enamel wear builds with every acid hit; saliva buys a little back
  const erosion =
    interpolate(f, [BEAT.burp1, BEAT.burp1 + 10], [0, 0.28], clamp) +
    interpolate(f, [BEAT.burp2, BEAT.burp2 + 10], [0, 0.17], clamp) +
    interpolate(f, [BEAT.card[0], BEAT.card[1]], [0, 0.17], clamp) -
    interpolate(f, [BEAT.salivaIn + 10, BEAT.sipHit], [0, 0.08], clamp) +
    interpolate(f, [BEAT.sipHit, BEAT.sipHit + 16], [0, 0.22], clamp) +
    interpolate(f, BEAT.molar3, [0, 0.14], clamp);

  // --- Molar's acting
  let face: {eyes: any; mouth: any; brows: any; look: [number, number]} = {eyes: 'open', mouth: 'smile', brows: 'none', look: [0, -10]};
  if (f >= BEAT.inside && f < BEAT.brain1[0]) face = {eyes: 'wide', mouth: 'o', brows: 'worried', look: [16, -10]};
  if (f >= BEAT.burp1 && f < BEAT.bug2) face = {eyes: 'wide', mouth: 'yell', brows: 'angry', look: [-12, -18]};
  if (f >= BEAT.bug2 && f < BEAT.quiz[0]) face = {eyes: 'squeeze', mouth: 'wavy', brows: 'none', look: [0, 0]};
  if (f >= BEAT.salivaIn && f < BEAT.sipHit) face = {eyes: 'relief', mouth: 'grin', brows: 'none', look: [-16, -4]} as any;
  if (f >= BEAT.sipHit && f < BEAT.molar3[0]) face = {eyes: 'wide', mouth: 'o', brows: 'worried', look: [12, -8]};
  if (f >= BEAT.molar3[0]) face = {eyes: 'half', mouth: 'frown', brows: 'worried', look: [0, 10]};
  if (f >= BEAT.water) face = {eyes: 'open', mouth: 'grin', brows: 'proud', look: [-14, -6]};
  if (f >= BEAT.reaction) face = {eyes: 'relief', mouth: 'grin', brows: 'proud', look: [0, -4]} as any;
  const hit = f >= BEAT.sipHit ? squash(f, BEAT.sipHit, 0.1) : f >= BEAT.burp2 ? squash(f, BEAT.burp2, 0.07) : squash(f, BEAT.burp1, 0.07);

  // --- Sugar Bugs: ride the wave in, party on the crown, get washed out by water
  const arrive = sp(f, BEAT.bugsIn);
  const washed = interpolate(f, [BEAT.water + 6, BEAT.water + 40], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const bugsOn = f >= BEAT.bugsIn && f < BEAT.quiz[0];
  const bugsBack = f >= BEAT.water - 30 && f < BEAT.endCard;
  const bugPos = (cusp: [number, number], dx: number): [number, number] => [cusp[0] + dx + (1 - arrive) * 900 - washed * 1300, cusp[1] - 86 + (1 - arrive) * -160 + Math.sin(washed * 9) * 40 * washed];
  const b1 = bugPos(CUSP_L, -10);
  const b2 = bugPos(CUSP_R, 20);
  const bugTalk1 = f < BEAT.bug2 + 2 ? talkOf(f, 'bug') : 0;
  const bugTalk2 = f >= BEAT.bug2 ? talkOf(f, 'bug') : 0;
  const bugFace = (talk: number, burpAt: number): Face => ({
    eyes: f >= BEAT.water ? 'wide' : Math.abs(f - burpAt) < 6 ? 'squeeze' : 'open',
    mouth: f >= BEAT.water ? 'o' : 'grin',
    brows: f >= BEAT.water ? 'worried' : 'none',
    look: [-10, 10],
    talk,
  });

  // --- Saliva: arrives, polishes, gets knocked away by the next sip
  const salIn = sp(f, BEAT.salivaIn);
  const knock = interpolate(f, [BEAT.sipHit + 4, BEAT.sipHit + 20], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
  const salOn = f >= BEAT.salivaIn && f < BEAT.brain4[0];
  const salX = -300 + salIn * 500 - knock * 330; // rests at x≈200 so its hand polishes the chalky spot, not the face
  const salY = 960 - knock * 120;

  const shine = f < BEAT.inside + 20 || f >= BEAT.reaction;
  return (
    <g>
      <Bone />
      <XTooth left={60 - 200 * 1.3} top={GUM - 320 * 1.3} scale={1.3} faceless shade frame={f} erosion={erosion * 0.6} />
      <XTooth left={1020 - 200 * 1.3} top={GUM - 320 * 1.3} scale={1.3} faceless shade frame={f} erosion={erosion * 0.6} />
      <XTooth
        {...molar}
        shade
        frame={f}
        {...face}
        squash={hit}
        erosion={erosion}
        sweat={f >= BEAT.bug2 && f < BEAT.quiz[0] ? 2 : f >= BEAT.molar3[0] && f < BEAT.water ? 3 : 0}
        arms={f >= BEAT.burp1 && f < BEAT.quiz[0] ? 'panic' : 'rest'}
        talk={talkOf(f, 'mo')}
      />
      <Gum />
      {shine && (
        <g>
          <Twinkle x={W(320, 60)[0]} y={W(320, 60)[1]} s={0.9 + 0.2 * Math.sin(f * 0.3)} rot={f * 3} />
          <Twinkle x={W(80, 90)[0]} y={W(80, 90)[1]} s={0.6} rot={-f * 3} />
        </g>
      )}

      {(bugsOn || bugsBack) && (
        <g>
          <SugarBug x={b1[0]} y={b1[1]} s={1.2} rot={washed * 300} f={f} {...bugFace(bugTalk1, BEAT.burp1)} />
          <SugarBug x={b2[0]} y={b2[1]} s={1.2} rot={washed * -260} f={f} hat="#5AA8FF" diet {...bugFace(bugTalk2, BEAT.burp2)} />
        </g>
      )}
      <Burp x={b1[0] + 20} y={b1[1] - 150} t={f - BEAT.burp1} />
      <Burp x={b2[0]} y={b2[1] - 150} t={f - BEAT.burp2} />
      <Burp x={Math.max(170, b1[0] + 80)} y={760} t={f - BEAT.smallBurp} small />

      {salOn && (
        <Saliva
          x={salX}
          y={salY}
          s={0.9}
          rot={knock * -200}
          f={f}
          wipe={f < BEAT.sipHit}
          eyes={knock > 0.2 ? 'squeeze' : 'open'}
          mouth={knock > 0.2 ? 'o' : 'grin'}
          look={[18, 6]}
          talk={talkOf(f, 'saliva')}
        />
      )}

      {sodaOn && <Liquid front={sodaFront} level={SODA_LEVEL} f={f} color="#8A4A24" opacity={0.26} edge="#B2683A" floor={GUM - 6} />}
      {sipOn && <Liquid front={sipFront} level={sipLevel} f={f} color="#8A4A24" opacity={0.26} edge="#B2683A" floor={GUM - 6} />}
      {waterOn && <Liquid front={waterFront} level={interpolate(f, [BEAT.water + 40, BEAT.endCard], [SODA_LEVEL, GUM - 6], clamp)} f={f} color="#BFE9FF" opacity={0.32} edge="#7FC8F0" floor={GUM - 6} />}
    </g>
  );
};

// ---------------------------------------------------------------- Brain HQ with the pH dial
const phAt = (f: number) => {
  if (f < BEAT.brain1[0]) return 7;
  if (f < BEAT.brain5[0]) {
    const crash = interpolate(f, [BEAT.brain1[0], BEAT.brain1[0] + 30], [7, 3.4], {...clamp, easing: Easing.out(Easing.quad)});
    return Math.min(crash, 3.4 + Math.abs(Math.sin(f * 0.21)) * 1.2);
  }
  return interpolate(f, [BEAT.brain5[0], BEAT.brain5[1]], [4.2, 7], {...clamp, easing: Easing.inOut(Easing.quad)});
};
const BrainHQ: React.FC<{f: number; mood: 'alarm' | 'quiz' | 'calm'}> = ({f, mood}) => {
  const face: Face = mood === 'alarm' ? {eyes: 'wide', brows: 'worried', mouth: 'yell', look: [0, -26]} : mood === 'quiz' ? {eyes: 'open', brows: 'proud', mouth: 'smile', look: [0, 4]} : {eyes: 'open', brows: 'none', mouth: 'smile', look: [0, 4]};
  const red = phAt(f) < 5.5;
  const blink = red && Math.floor(f / 6) % 2 === 0;
  return (
    <g>
      <Cavity />
      {red && <path d={`M 540 120 L ${blink ? 120 : 960} -40 L ${blink ? 300 : 780} -40 Z`} fill="#FF4040" opacity={0.25} />}
      <rect x={490} y={100} width={100} height={60} rx={30} fill={red ? (blink ? '#FF3030' : '#B02424') : '#3FA96A'} stroke={X.ink} strokeWidth={7} />
      <rect x={200} y={160} width={680} height={520} rx={34} fill="#3A1A1E" stroke={X.ink} strokeWidth={9} />
      <rect x={226} y={186} width={628} height={468} rx={20} fill="#24110F" />
      <PhDial x={540} y={510} ph={phAt(f)} f={f} />
      <path d="M -60 1660 L 1140 1660 L 1140 1990 L -60 1990 Z" fill="#E9CFA9" stroke={X.ink} strokeWidth={8} />
      <rect x={-60} y={1660} width={1200} height={34} fill="#D7B88C" stroke={X.ink} strokeWidth={6} />
      <Brain x={540} y={1340} s={1.42} frame={f} armsUp={mood === 'alarm'} {...face} talk={talkOf(f, 'brain')} />
    </g>
  );
};

// ---------------------------------------------------------------- outside: the can opens
const Outside: React.FC<{f: number}> = ({f}) => {
  const open = interpolate(f, [BEAT.tab, BEAT.tab + 4], [0, 1], clamp);
  const shake = f >= BEAT.spray && f < BEAT.spray + 8 ? Math.sin(f * 3) * 6 : 0;
  return (
    <g>
      <defs>
        <linearGradient id="kitchen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE9D6" />
          <stop offset="1" stopColor="#F7C9B6" />
        </linearGradient>
      </defs>
      <rect x={-60} y={-60} width={1200} height={2040} fill="url(#kitchen)" />
      <rect x={-60} y={1500} width={1200} height={500} fill="#C98E6A" stroke={X.line} strokeWidth={8} />
      <g transform={`translate(${shake} 0)`}>
        <CanInHand x={560} y={1080} s={1.35} open={open} tilt={-6} />
      </g>
      <Spray x={600} y={720} t={f - BEAT.spray} />
      <text x={540} y={330} textAnchor="middle" dominantBaseline="middle" fontFamily={CAPTION_FONT} fontSize={130 * Math.min(1, sp(f, BEAT.spray))} fill="#FFFFFF" stroke={X.line} strokeWidth={16} paintOrder="stroke" transform="rotate(-6 540 330)">
        PSSHHT!
      </text>
    </g>
  );
};

// ---------------------------------------------------------------- full-screen time card
const TimeCard: React.FC<{f: number}> = ({f}) => {
  const [a, b] = BEAT.card;
  const t = f - a;
  const hand = t * 22;
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2040} fill="#3B1517" />
      <g transform={`translate(540 760) scale(${sp(f, a)})`}>
        <circle r={230} fill="#FFFFFF" stroke={X.line} strokeWidth={14} />
        {Array.from({length: 12}).map((_, i) => (
          <line key={i} x1={0} y1={-196} x2={0} y2={-170} stroke={X.line} strokeWidth={10} transform={`rotate(${i * 30})`} strokeLinecap="round" />
        ))}
        <line x1={0} y1={0} x2={0} y2={-150} stroke={X.line} strokeWidth={14} strokeLinecap="round" transform={`rotate(${hand})`} />
        <line x1={0} y1={0} x2={0} y2={-100} stroke={X.red} strokeWidth={14} strokeLinecap="round" transform={`rotate(${hand / 12})`} />
        <circle r={16} fill={X.line} />
      </g>
      <text x={540} y={1150} textAnchor="middle" fontFamily={CAPTION_FONT} fontSize={110} fill={X.gold} stroke={X.ink} strokeWidth={16} paintOrder="stroke" transform={`translate(540 1150) scale(${sp(f, a + 6)}) translate(-540 -1150)`}>
        8 HOURS OF
      </text>
      <text x={540} y={1280} textAnchor="middle" fontFamily={CAPTION_FONT} fontSize={130} fill="#FFFFFF" stroke={X.ink} strokeWidth={16} paintOrder="stroke" transform={`translate(540 1280) scale(${sp(f, a + 10)}) translate(-540 -1280)`}>
        SIPPING
      </text>
      {BEAT.sips.map((s, i) => {
        const sc = f >= s ? sp(f, s) : 0;
        const pos = [[220, 330], [850, 400], [300, 1500]][i];
        return sc > 0 ? (
          <text key={i} x={pos[0]} y={pos[1]} textAnchor="middle" fontFamily={CAPTION_FONT} fontSize={84} fill="#B2683A" stroke="#FFFFFF" strokeWidth={14} paintOrder="stroke" transform={`translate(${pos[0]} ${pos[1]}) scale(${sc}) rotate(${i % 2 ? 10 : -10}) translate(${-pos[0]} ${-pos[1]})`}>
            SIP!
          </text>
        ) : null;
      })}
      {f > b - 6 && <rect x={-60} y={-60} width={1200} height={2040} fill="#000" opacity={0} />}
    </g>
  );
};

// ---------------------------------------------------------------- overlays
const Big: React.FC<{text: string; x: number; y: number; size: number; color: string; s: number; stroke?: number}> = ({text, x, y, size, color, s, stroke = 16}) =>
  s <= 0 ? null : (
    <text x={x} y={y} transform={`translate(${x} ${y}) scale(${s}) skewX(-6) translate(${-x} ${-y})`} textAnchor="middle" dominantBaseline="middle" fontFamily={CAPTION_FONT} fontSize={size} fill={color} stroke={X.ink} strokeWidth={stroke} paintOrder="stroke">
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

const Quiz: React.FC<{f: number}> = ({f}) => {
  const [a] = BEAT.quiz;
  if (f < a + 6 || f >= BEAT.quiz[1]) return null;
  const n = f >= BEAT.countdown[2] ? 1 : f >= BEAT.countdown[1] ? 2 : f >= BEAT.countdown[0] ? 3 : null;
  const last = [...BEAT.countdown].reverse().find((c) => f >= c) ?? a;
  const badge = (x: number, ch: string, l1: string, l2: string, d: number) => {
    const s = sp(f, a + d);
    return (
      <g transform={`translate(${x} 760) scale(${s})`}>
        <circle r={120} fill={X.gold} stroke={X.ink} strokeWidth={12} />
        <text y={10} textAnchor="middle" dominantBaseline="middle" fontFamily={CAPTION_FONT} fontSize={150} fill={X.ink}>
          {ch}
        </text>
        <text y={182} textAnchor="middle" fontFamily={CAPTION_FONT} fontSize={56} fill="#FFFFFF" stroke={X.ink} strokeWidth={12} paintOrder="stroke">
          {l1}
        </text>
        <text y={244} textAnchor="middle" fontFamily={CAPTION_FONT} fontSize={56} fill="#FFFFFF" stroke={X.ink} strokeWidth={12} paintOrder="stroke">
          {l2}
        </text>
      </g>
    );
  };
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2040} fill="#000" opacity={0.3} />
      {/* the quiz sits on its own panel so the dial behind can't collide with it */}
      <rect x={50} y={130} width={980} height={940} rx={46} fill="#3B1517" stroke={X.ink} strokeWidth={10} opacity={0.96} />
      <Big text="WHAT'S WORSE?" x={540} y={290} size={120} color="#FFFFFF" s={sp(f, a + 6)} />
      {badge(275, 'A', 'SIPPING', 'ALL DAY', 10)}
      {badge(805, 'B', 'ONE QUICK', 'DRINK', 16)}
      {n !== null && (
        <g transform={`translate(540 760) scale(${0.8 + 0.2 * sp(f, last)})`}>
          <circle r={74} fill="#FFFFFF" stroke={X.ink} strokeWidth={10} />
          <text y={10} textAnchor="middle" dominantBaseline="middle" fontFamily={CAPTION_FONT} fontSize={100} fill={X.red}>
            {n}
          </text>
        </g>
      )}
    </g>
  );
};

const EndCard: React.FC<{f: number}> = ({f}) => {
  const a = BEAT.endCard;
  if (f < a || f >= BEAT.reaction) return null;
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2040} fill="#000" opacity={0.42 * Math.min(1, (f - a) / 6)} />
      <Big text="SIP LESS." x={540} y={700} size={170} color="#FFFFFF" s={sp(f, a)} stroke={20} />
      <Big text="RINSE MORE." x={540} y={880} size={170} color={X.gold} s={sp(f, a + 8)} stroke={20} />
      <g opacity={Math.min(1, sp(f, a + 18))}>
        <Big text="COMMENT A OR B" x={480} y={1140} size={90} color="#FFFFFF" s={1} stroke={14} />
        <PointDown x={960} y={1130} s={1.05} bob={Math.sin(f * 0.35) * 10} />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- camera
type Cam = {s: number; cx: number; cy: number};
const FOCUS_Y = 800; // the speaker sits here on screen (captions live at y≈1500)
const camOn = (x: number, y: number, s: number): Cam => ({s, cx: x, cy: y + (960 - FOCUS_Y) / s});
const WIDE: Cam = {s: 1.05, cx: 540, cy: 1000};
const MOLAR_FACE = W(200, 100);
const CAM_KEYS: [number, Cam, boolean][] = [
  [BEAT.inside, WIDE, true],
  [BEAT.brain1[0], {s: 1.12, cx: 540, cy: 990}, false],
  [BEAT.bugsIn, camOn(470, 870, 1.35), true], // the bugs arrive
  [BEAT.molar2, camOn(500, 880, 1.45), false],
  [BEAT.bug2 - 8, camOn(560, MOLAR_FACE[1] - 60, 1.42), false], // Molar shouts
  [BEAT.bug2, camOn(CUSP_R[0] + 20, 860, 1.55), false], // pan to bug 2
  [BEAT.quiz[0], camOn(CUSP_R[0] + 20, 860, 1.6), false],
  [BEAT.salivaIn, camOn(470, 940, 1.25), true], // saliva arrives
  [BEAT.sipHit, camOn(470, 940, 1.32), false],
  [BEAT.molar3[0], camOn(540, MOLAR_FACE[1] - 40, 1.85), true], // worn enamel close-up
  [BEAT.molar3[1], camOn(540, MOLAR_FACE[1] - 40, 1.95), false],
  [BEAT.water - 4, WIDE, true], // water wash
  [BEAT.endCard, WIDE, true],
  [BEAT.reaction, camOn(540, MOLAR_FACE[1], 1.9), true], // relieved reaction
  [BEAT.total, camOn(540, MOLAR_FACE[1], 2.02), false],
];
const camAt = (f: number): Cam => {
  let prev = CAM_KEYS[0];
  for (let i = 1; i < CAM_KEYS.length; i++) {
    const k = CAM_KEYS[i];
    if (f < k[0]) {
      if (k[2]) return prev[1];
      const t = interpolate(f, [prev[0], k[0]], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
      return {s: prev[1].s + (k[1].s - prev[1].s) * t, cx: prev[1].cx + (k[1].cx - prev[1].cx) * t, cy: prev[1].cy + (k[1].cy - prev[1].cy) * t};
    }
    prev = k;
  }
  return prev[1];
};
type Shot = 'outside' | 'mouth' | 'hq' | 'card';
const shotAt = (f: number): {kind: Shot; mood?: 'alarm' | 'quiz' | 'calm'} => {
  if (f < BEAT.inside) return {kind: 'outside'};
  if (f >= BEAT.brain1[0] && f < BEAT.bugsIn) return {kind: 'hq', mood: 'alarm'};
  if (f >= BEAT.quiz[0] && f < BEAT.quiz[1]) return {kind: 'hq', mood: 'quiz'};
  if (f >= BEAT.card[0] && f < BEAT.card[1]) return {kind: 'card'};
  if (f >= BEAT.brain4[0] && f < BEAT.molar3[0]) return {kind: 'hq', mood: 'alarm'};
  if (f >= BEAT.brain5[0] && f < BEAT.water - 4) return {kind: 'hq', mood: 'calm'};
  return {kind: 'mouth'};
};

export const SodaScene: React.FC = () => {
  const f = useCurrentFrame();
  const shot = shotAt(f);
  const cam = camAt(f);
  return (
    <g>
      <ShadeDefs />
      <SoftShadeDefs />
      {shot.kind === 'outside' && <Outside f={f} />}
      {shot.kind === 'card' && <TimeCard f={f} />}
      {shot.kind === 'hq' && (
        <g>
          <BrainHQ f={f} mood={shot.mood ?? 'calm'} />
          <Quiz f={f} />
        </g>
      )}
      {shot.kind === 'mouth' && (
        <g>
          <Cavity />
          <g transform={`translate(540 960) scale(${cam.s}) translate(${-cam.cx} ${-cam.cy})`}>
            <Mouth f={f} />
          </g>
          <Label text="Enamel" x={540} y={250} from={L('molar1').from} to={L('molar1').to} f={f} />
          <Label text="Sugar Bugs" x={540} y={250} from={BEAT.bugsIn + 8} to={L('bug1').to} f={f} />
          <Label text="Saliva" x={540} y={250} from={BEAT.salivaIn + 6} to={L('saliva1').to} f={f} />
          <Label text="Dentin showing" x={540} y={250} from={BEAT.molar3[0]} to={BEAT.molar3[1]} f={f} />
          <EndCard f={f} />
        </g>
      )}
    </g>
  );
};

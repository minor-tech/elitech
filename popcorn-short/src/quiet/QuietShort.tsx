import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {HEIGHT, WIDTH, clamp} from '../theme';
import {L, dialogue} from '../audio/quietDialogue';
import timings from '../audio/quietTimings.json';
import {CAPTION_FONT, X} from '../enamelv3/style';
import {ShadeDefs, XTooth} from '../enamelv3/XTooth';
import {Cavity} from '../enamelv3/Backdrop';
import {SoftShadeDefs} from '../gap/Props';
import {B, QuietScene} from './Scene';

type TL = Record<string, {durationFrames: number; words: {text: string; frame: number}[]; voicedTo: number}>;
const T = timings as unknown as TL;
export const QUIET_FRAMES = B.total;

// ---------------------------------------------------------------- captions: yellow = stressed (scale-pop), white = weak
const WEAK = new Set(['A', 'AN', 'OR', 'IT', 'OF', 'TO', 'ON', 'IN', 'MY', 'THE', 'AND', 'FOR', 'IS', 'I', "I'M", "IT'S", 'WE', "WE'RE", 'YOU', 'WITH', 'NO', 'UH', "DIDN'T"]);
const STRESS = new Set(['CRACK', 'FINE', 'PAIN', 'ALIVE', 'HELP', 'HURTS', 'HURT', 'GOOD', 'ALARM', 'PARTY', 'FREE', 'EXPANDING', 'PUSHING', 'DONE', 'SCREAM', "COULDN'T", 'SILENCE', 'BREAK-IN', 'NOTHING', 'TOLD', 'ALMOST']);
type W = {text: string; start: number; end: number; stress: boolean};
const bare = (s: string) => s.replace(/[^A-Z'-]/g, '');
const WORDS: W[] = dialogue.flatMap((l) => {
  const t = T[l.id];
  if (!t) return [];
  const lineEnd = Math.min(l.toFrame, l.fromFrame + t.voicedTo + 10);
  const raw = t.words.map((w, i) => ({
    text: w.text.replace(/^\.+/, '').toUpperCase(),
    start: l.fromFrame + w.frame,
    end: i < t.words.length - 1 ? l.fromFrame + t.words[i + 1].frame : lineEnd,
  }));
  const out: W[] = [];
  let carry: {text: string; start: number} | null = null;
  for (let i = 0; i < raw.length; i++) {
    const r = raw[i];
    const text: string = carry ? `${carry.text} ${r.text}` : r.text;
    const start: number = carry ? carry.start : r.start;
    carry = null;
    const endsSentence = /[.!?]$/.test(r.text);
    if (WEAK.has(bare(r.text)) && !endsSentence && i < raw.length - 1) {
      carry = {text, start};
      continue;
    }
    out.push({text, start, end: r.end, stress: text.split(' ').some((x: string) => STRESS.has(bare(x)))});
  }
  if (carry) out.push({...carry, end: raw[raw.length - 1].end, stress: false});
  return out;
});

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const w = WORDS.find((x) => f >= x.start && f < x.end);
  if (!w || f >= B.thesis) return null;
  const inBrain = (f >= B.hq1 && f < B.crew) || (f >= B.hq2 && f < B.bone) || (f >= B.hq3 && f < B.couldnt);
  const t = f - w.start;
  const pop = w.stress ? interpolate(t, [0, 3, 6], [1.25, 1.06, 1], clamp) : interpolate(t, [0, 2, 4], [0.85, 1.05, 1], clamp);
  const base = w.stress ? 140 : 116;
  const size = w.text.length > 9 ? Math.max(80, base - (w.text.length - 9) * 8) : base;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 40,
          right: 40,
          top: inBrain ? 1600 : 1520,
          transform: `translateY(-50%) scale(${pop}) skewX(-6deg)`,
          textAlign: 'center',
          fontFamily: CAPTION_FONT,
          fontSize: size,
          lineHeight: 1.05,
          letterSpacing: 2,
          color: w.stress ? X.gold : X.white,
          WebkitTextStroke: `16px ${X.ink}`,
          paintOrder: 'stroke fill',
          textShadow: '0 8px 0 rgba(0,0,0,0.35)',
        }}
      >
        {w.text}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- sound: an effect on every state change
const g = (n: string) => `assets/audio/gap/sfx/${n}.mp3`;
const q = (n: string) => `assets/audio/quiet/sfx/${n}.mp3`;
const s = (n: string) => `assets/audio/sfx/${n}.mp3`;
const CUES: {file: string; at: number; vol: number}[] = [
  {file: g('alarm'), at: 0, vol: 0.55},
  {file: g('sting'), at: 2, vol: 0.5},
  {file: q('beeps'), at: B.beep, vol: 0.7},
  {file: q('beeps'), at: B.beep + 16, vol: 0.6},
  {file: g('whoosh'), at: B.crew, vol: 0.5},
  ...[0, 5, 10].map((d) => ({file: g('tok'), at: B.crew + 8 + d, vol: 0.45})),
  {file: g('pop'), at: B.bandaid, vol: 0.5},
  {file: g('whoosh'), at: B.push, vol: 0.6},
  {file: g('deflate'), at: B.ghost + 4, vol: 0.35},
  {file: g('whoosh'), at: B.inside2, vol: 0.5},
  {file: g('flip'), at: B.squat, vol: 0.7},
  {file: 'assets/audio/soda/sfx/fizz.mp3', at: B.abscess, vol: 0.3},
  {file: g('ding'), at: B.hq2 + 4, vol: 0.35},
  {file: q('rumble'), at: B.bone, vol: 0.9},
  {file: q('rumble'), at: B.gray + 10, vol: 0.6},
  {file: g('pop'), at: B.pop, vol: 1},
  {file: g('thump'), at: B.pop + 2, vol: 0.9},
  {file: g('boing'), at: B.pop + 3, vol: 0.6},
  {file: g('alarm'), at: B.redFlip, vol: 0.75},
  // the hold after "...couldn't" is dead air - nothing until the alarm
  {file: g('alarm'), at: B.alarm, vol: 0.8},
  {file: g('whoosh'), at: B.seal, vol: 0.6},
  {file: 'assets/audio/soda/sfx/sip.mp3', at: B.vacuum, vol: 0.8},
  {file: q('ratchet'), at: B.fill[0], vol: 0.8},
  {file: q('ratchet'), at: B.fill[0] + 28, vol: 0.7},
  {file: g('thump'), at: B.cap, vol: 1},
  {file: g('flip'), at: B.sealed, vol: 0.6},
  {file: q('chime'), at: B.sealed + 4, vol: 0.8},
  {file: g('sting'), at: B.thesis, vol: 0.9},
];

const PARTY: [number, number][] = [
  [B.inside1, B.hq2], // muffled through the enamel, even outside
];
const silentFrom = L('couldnt').from;

/** "Why the Quiet Tooth Always Dies First" (45 s). */
export const QuietShort: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: X.bgDark}}>
    <AbsoluteFill>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <QuietScene />
      </svg>
    </AbsoluteFill>
    <Sequence name="BGM" durationInFrames={silentFrom} layout="none">
      <Html5Audio src={staticFile('assets/audio/gap/bgm/quirky_bgm.mp3')} loop volume={(fr) => (fr >= B.inside1 && fr < B.hq2 ? 0.05 : fr > silentFrom - 20 ? 0.2 * Math.max(0, (silentFrom - fr) / 20) : 0.2)} />
    </Sequence>
    <Sequence name="BGM back" from={B.seal} layout="none">
      <Html5Audio src={staticFile('assets/audio/gap/bgm/quirky_bgm.mp3')} loop volume={0.2} />
    </Sequence>
    {PARTY.map(([a, b], i) => (
      <Sequence key={i} name="party (muffled)" from={a} durationInFrames={b - a} layout="none">
        <Html5Audio src={staticFile('assets/audio/quiet/sfx/party_muffled.mp3')} volume={(fr) => (fr + a >= B.told && fr + a < B.inside2 ? 0.25 : 0.55)} />
      </Sequence>
    ))}
    {dialogue.map((l) => (
      <Sequence key={l.id} name={`VO ${l.id}`} from={l.fromFrame} durationInFrames={Math.max(1, (T[l.id]?.durationFrames ?? 1) + 2)} layout="none">
        <Html5Audio src={staticFile(l.voiceFile)} />
      </Sequence>
    ))}
    {CUES.map((c, i) => (
      <Sequence key={i} name={`SFX ${c.file.split('/').pop()}`} from={Math.max(0, c.at)} layout="none">
        <Html5Audio src={staticFile(c.file)} volume={c.vol} />
      </Sequence>
    ))}
    <Captions />
  </AbsoluteFill>
);

// ---------------------------------------------------------------- thumbnail
export const QuietThumb: React.FC = () => {
  const S = 1.55;
  const LG = 1250;
  const tooth = (cx: number) => ({left: cx - 200 * S, top: LG - 320 * S, scale: S});
  const apex: [number, number] = [760 - 200 * S + 262 * S, LG - 320 * S + 470 * S];
  return (
    <AbsoluteFill style={{backgroundColor: X.bgDark}}>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <ShadeDefs />
        <SoftShadeDefs />
        <Cavity />
        <rect x={-60} y={LG + 70} width={1200} height={900} fill={X.bone} stroke={X.line} strokeWidth={6} />
        <XTooth {...tooth(300)} shade crack={1} pain={1} sweat={3} eyes="squeeze" brows="worried" mouth="yell" arms="panic" frame={4} />
        <g>
          <defs>
            <filter id="thGray">
              <feColorMatrix type="matrix" values="0.55 0.35 0.08 0 0.03  0.2 0.7 0.08 0 0.03  0.2 0.35 0.43 0 0.04  0 0 0 1 0" />
            </filter>
          </defs>
          <g filter="url(#thGray)">
            <XTooth {...tooth(760)} shade pulp={false} eyes="half" brows="proud" mouth="smirk" arms="rest" look={[-14, 0]} frame={4} />
          </g>
        </g>
        <rect x={-60} y={LG} width={1200} height={110} fill={X.gum} stroke={X.line} strokeWidth={6} />
        <circle cx={apex[0]} cy={apex[1]} r={150} fill="#8EE65A" opacity={0.35} />
        <circle cx={apex[0]} cy={apex[1]} r={70} fill="#A6EC6E" stroke={X.line} strokeWidth={6} />
        <circle cx={apex[0]} cy={apex[1] - 20} r={165} fill="none" stroke="#E8202A" strokeWidth={16} />
        <g transform="translate(540 250)">
          <rect x={-400} y={-120} width={800} height={240} rx={30} fill="#FFFFFF" stroke={X.ink} strokeWidth={10} />
          <rect x={-400} y={-120} width={800} height={64} rx={30} fill={X.red} stroke={X.ink} strokeWidth={10} />
          <text x={-70} y={50} textAnchor="end" dominantBaseline="middle" fontFamily={CAPTION_FONT} fontSize={120} fill="#FFFFFF" stroke={X.ink} strokeWidth={18} paintOrder="stroke">
            DEAD
          </text>
          <text x={-40} y={50} textAnchor="start" dominantBaseline="middle" fontFamily={CAPTION_FONT} fontSize={120} fill={X.gold} stroke={X.ink} strokeWidth={18} paintOrder="stroke">
            QUIET?
          </text>
        </g>
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1700, transform: 'translateY(-50%) skewX(-6deg)', textAlign: 'center', fontFamily: CAPTION_FONT, fontSize: 170, color: X.gold, WebkitTextStroke: `18px ${X.ink}`, paintOrder: 'stroke fill'}}>
        FINE.
      </div>
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, staticFile} from 'remotion';
import {SCENES} from './theme';
import {Scene1Hook} from './scenes/Scene1Hook';
import {S2_IMPACT, Scene2Culprit} from './scenes/Scene2Culprit';
import {S3_PULSES, Scene3Escalation} from './scenes/Scene3Escalation';
import {ATTEMPT, BRUSH_JABS, FLOSS_STUCK, STAMP_AT, Scene4Attempts, TONGUE_HIT, WATER_REWEDGE} from './scenes/Scene4Attempts';
import {S5_THUMB, Scene5Defeat} from './scenes/Scene5Defeat';
import {S6_CONFETTI, S6_OUT, Scene6Payoff} from './scenes/Scene6Payoff';

type Sfx = 'pop' | 'thump' | 'boing' | 'whoosh' | 'trombone';
const cue = (name: Sfx, at: number, volume = 1) => ({name, at, volume});

const s2 = SCENES.s2.from;
const s3 = SCENES.s3.from;
const s4 = SCENES.s4.from;
const s5 = SCENES.s5.from;
const s6 = SCENES.s6.from;

const CUES = [
  // Scene 2: slow-mo whoosh, pop when it wedges, boing as the eyes snap open
  cue('whoosh', s2 + 8, 0.5),
  cue('pop', s2 + S2_IMPACT),
  cue('boing', s2 + 92, 0.5),
  // Scene 3: pulses as low "thump" pops, getting louder
  ...S3_PULSES.map((p, i) => cue('thump', s3 + p, Math.min(1, 0.35 + i * 0.06))),
  // Scene 4: attempts (each ends in a FAIL stamp pop)
  cue('whoosh', s4 + 2, 0.6),
  cue('boing', s4 + TONGUE_HIT),
  ...BRUSH_JABS.map((j) => cue('whoosh', s4 + ATTEMPT + j - 3, 0.55)),
  cue('whoosh', s4 + ATTEMPT * 2 + 2, 0.5),
  cue('boing', s4 + ATTEMPT * 2 + FLOSS_STUCK, 0.6),
  cue('whoosh', s4 + ATTEMPT * 3 + 4, 0.6),
  cue('pop', s4 + ATTEMPT * 3 + WATER_REWEDGE),
  ...[0, 1, 2].map((i) => cue('pop', s4 + ATTEMPT * i + STAMP_AT, 0.9)),
  cue('pop', s4 + ATTEMPT * 3 + STAMP_AT + 2, 0.9),
  // Scene 5: the sad trombone of defeat
  cue('trombone', s5 + S5_THUMB - 6),
  // Scene 6: whoosh in, pop out, celebratory pops
  cue('whoosh', s6, 0.6),
  cue('pop', s6 + S6_OUT),
  cue('whoosh', s6 + S6_OUT + 2, 0.5),
  cue('pop', s6 + S6_CONFETTI, 0.8),
  cue('pop', s6 + S6_CONFETTI + 4, 0.6),
];

export const PopcornShort: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    {/* Hard cuts: back-to-back sequences, no transitions */}
    <Sequence from={SCENES.s1.from} durationInFrames={SCENES.s1.dur} name="1 Hook">
      <Scene1Hook />
    </Sequence>
    <Sequence from={SCENES.s2.from} durationInFrames={SCENES.s2.dur} name="2 Culprit">
      <Scene2Culprit />
    </Sequence>
    <Sequence from={SCENES.s3.from} durationInFrames={SCENES.s3.dur} name="3 Escalation">
      <Scene3Escalation />
    </Sequence>
    <Sequence from={SCENES.s4.from} durationInFrames={SCENES.s4.dur} name="4 Attempts">
      <Scene4Attempts />
    </Sequence>
    <Sequence from={SCENES.s5.from} durationInFrames={SCENES.s5.dur} name="5 Defeat">
      <Scene5Defeat />
    </Sequence>
    <Sequence from={SCENES.s6.from} durationInFrames={SCENES.s6.dur} name="6 Payoff">
      <Scene6Payoff />
    </Sequence>

    {CUES.map((c, i) => (
      <Sequence key={i} from={c.at} name={`sfx ${c.name}`} layout="none">
        <Html5Audio src={staticFile(`sfx/${c.name}.wav`)} volume={c.volume} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

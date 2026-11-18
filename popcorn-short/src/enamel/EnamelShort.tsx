import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, staticFile} from 'remotion';
import {E_SCENES} from './layout';
import {E1Hero, E2Chip, E2_CRACK, E2_HOME, E2_LAND1, E2_ON_HEAD, E3Healing, E3_GHOST, E4Realization, E4_GASP, E5Takeaway, E5_GRAB, E5_KERNEL_EXIT, E5_TEXT} from './Scenes';

type Sfx = 'thump' | 'pop' | 'boing' | 'whoosh' | 'trombone' | 'clink' | 'ding' | 'ting' | 'crack' | 'poof' | 'gasp' | 'scratch' | 'sting';
const cue = (name: Sfx, at: number, volume = 1) => ({name, at, volume});
const [s1, s2, s3, s4, s5] = [E_SCENES.s1.from, E_SCENES.s2.from, E_SCENES.s3.from, E_SCENES.s4.from, E_SCENES.s5.from];
const BGM_VOL = 0.6;

const CUES = [
  // 1. The Hero: ta-DAH, armour clinks on each shine, soft ting on the text
  cue('sting', s1, 0.8),
  cue('ting', s1 + 1, 0.4),
  cue('clink', s1 + 22, 0.7),
  cue('clink', s1 + 104, 0.6),
  // 2. The Chip
  cue('whoosh', s2, 0.4),
  cue('pop', s2 + E2_LAND1, 0.5),
  cue('pop', s2 + E2_ON_HEAD, 0.6),
  cue('whoosh', s2 + E2_ON_HEAD + 2, 0.6),
  cue('crack', s2 + E2_CRACK, 1),
  cue('boing', s2 + 66, 0.45),
  cue('pop', s2 + E2_HOME, 0.4),
  // 3. Failed healing: cells poof one by one, then the sad trombone
  cue('ting', s3 + 8, 0.5),
  ...[0, 1, 2, 3].map((i) => cue('poof', s3 + E3_GHOST + i * 4, 0.7)),
  cue('trombone', s3 + 112, 0.75),
  // 4. Realization: the music stops dead, everyone gasps
  cue('scratch', s4, 0.9),
  cue('pop', s4 + 1, 0.5),
  cue('gasp', s4 + E4_GASP, 1),
  cue('boing', s4 + 110, 0.35), // the gulp
  // music is gone: a quiet lub-dub heartbeat on every other beat carries the dread
  ...Array.from({length: 5}, (_, i) => s4 + 30 + i * 30).flatMap((t) => [cue('thump', t, 0.45), cue('thump', t + 6, 0.3)]),
  // 5. Takeaway
  cue('whoosh', s5 + 2, 0.5),
  cue('ding', s5 + E5_GRAB, 0.9),
  cue('ting', s5 + E5_TEXT, 0.5),
  cue('whoosh', s5 + E5_KERNEL_EXIT, 0.4),
  cue('clink', s5 + 46, 0.5),
];

export const EnamelShort: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Sequence from={s1} durationInFrames={E_SCENES.s1.dur} name="1 The Hero">
      <E1Hero />
    </Sequence>
    <Sequence from={s2} durationInFrames={E_SCENES.s2.dur} name="2 The Chip">
      <E2Chip />
    </Sequence>
    <Sequence from={s3} durationInFrames={E_SCENES.s3.dur} name="3 The Failed Healing">
      <E3Healing />
    </Sequence>
    <Sequence from={s4} durationInFrames={E_SCENES.s4.dur} name="4 The Realization">
      <E4Realization />
    </Sequence>
    <Sequence from={s5} durationInFrames={E_SCENES.s5.dur} name="5 The Takeaway">
      <E5Takeaway />
    </Sequence>

    {/* Music: sneaky theme + sad tag until the record scratch, then the upbeat outro */}
    <Sequence from={0} durationInFrames={s4} name="bgm main" layout="none">
      <Html5Audio src={staticFile('sfx/bgm-main.wav')} volume={BGM_VOL} />
    </Sequence>
    <Sequence from={s5} name="bgm outro" layout="none">
      <Html5Audio src={staticFile('sfx/bgm-outro.wav')} volume={BGM_VOL + 0.05} />
    </Sequence>

    {CUES.map((c, i) => (
      <Sequence key={i} from={c.at} name={`sfx ${c.name}`} layout="none">
        <Html5Audio src={staticFile(`sfx/${c.name}.wav`)} volume={c.volume} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

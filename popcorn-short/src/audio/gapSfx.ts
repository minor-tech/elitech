// SFX cues for "The Gap" (30fps). Files in public/assets/audio/gap/sfx/ (stand-ins from scripts/make-gap-audio.mjs).
export type GapSfx = {id: string; file: string; frame: number; volume: number};
const s = (id: string, frame: number, volume = 0.8, name = id): GapSfx => ({id: `${id}@${frame}`, file: `assets/audio/gap/sfx/${name}.mp3`, frame, volume});

export const gapSfx: GapSfx[] = [
  s('alarm', 0, 0.55),
  s('pain', 86, 0.6, 'thump'),
  ...[144, 160, 176, 192, 208, 224].map((f) => s('heartbeat', f, 0.7)),
  s('exhale', 238, 0.7),
  s('whoosh', 330, 0.5),
  s('creak', 352, 0.8),
  s('pop', 378, 1),
  s('whoosh', 382, 0.6),
  s('violin', 398, 0.45),
  ...[468, 482, 496, 510].map((f) => s('tok', f, 0.6)),
  s('ding', 528, 0.5),
  ...[546, 562, 578, 640, 654, 1326].map((f) => s('boing', f, 0.55)),
  s('ticktock', 668, 0.5),
  s('flip', 792, 0.7),
  s('creak', 814, 0.7),
  s('creak', 858, 0.6),
  s('creak', 922, 0.75),
  s('ding', 1018, 0.8),
  s('deflate', 1066, 0.7),
  s('sting', 1290, 0.8),
];

export const GAP_BGM = {file: 'assets/audio/gap/bgm/quirky_bgm.mp3', volume: 0.26};

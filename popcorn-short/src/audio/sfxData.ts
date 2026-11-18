// SFX cues for EnamelShortV2 (30fps). Paths are relative to public/.
// Replace any file with your own (same name) - the timing stays.
export type SfxCue = {id: string; file: string; frame: number; volume: number; note: string};

export const sfx: SfxCue[] = [
  {id: 'pop', file: 'assets/audio/sfx/pop.mp3', frame: 0, volume: 0.6, note: 'character entrance'},
  {id: 'skeptical_grunt', file: 'assets/audio/sfx/skeptical_grunt.mp3', frame: 90, volume: 0.45, note: 'soft "hmm"'},
  {id: 'ice_crack', file: 'assets/audio/sfx/ice_crack.mp3', frame: 270, volume: 1, note: 'sharp, short'},
  {id: 'nut_crunch', file: 'assets/audio/sfx/nut_crunch.mp3', frame: 320, volume: 1, note: 'medium, satisfying'},
  {id: 'glass_shatter', file: 'assets/audio/sfx/glass_shatter.mp3', frame: 380, volume: 0.9, note: 'short, spreading crack'},
  {id: 'gasp', file: 'assets/audio/sfx/gasp.mp3', frame: 540, volume: 0.9, note: 'neighbour reacts'},
  {id: 'sad_trombone', file: 'assets/audio/sfx/sad_trombone.mp3', frame: 690, volume: 0.55, note: 'short, ~1s'},
  // frame 810: intentionally silent - let the last line land
];

export const BGM = {
  file: 'assets/audio/bgm/lofi_bgm.mp3',
  volume: 0.12,
  duckedVolume: 0.05,
  duckFrom: 360, // "I cracked" moment
  duckTo: 540,
  rampFrames: 12,
};

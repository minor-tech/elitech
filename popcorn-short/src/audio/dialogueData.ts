// Dialogue for EnamelShortV2. Frames are at 30fps.
// voiceFile paths are relative to public/ (Remotion serves them with staticFile()).
// Drop your real takes at the same paths, then run `npm run timings`.

export type Character = 'hero' | 'neighborLeft';

export type DialogueLine = {
  id: string;
  character: Character;
  text: string;
  fromFrame: number; // window start: the voice starts here (+ delay)
  toFrame: number; // window end: the caption is gone by here
  voiceFile: string;
  delay?: number; // frames after fromFrame before the voice starts
};

export const dialogue: DialogueLine[] = [
  {id: 'hero_line1', character: 'hero', text: "I'm the hardest thing in your whole body.", fromFrame: 0, toFrame: 90, voiceFile: 'assets/audio/voiceover/hero_line1.mp3', delay: 4},
  {id: 'neighbor_line1', character: 'neighborLeft', text: 'Hardest? You? ...Prove it.', fromFrame: 90, toFrame: 240, voiceFile: 'assets/audio/voiceover/neighbor_line1.mp3', delay: 24},
  {id: 'hero_line2', character: 'hero', text: 'Watch this.', fromFrame: 240, toFrame: 360, voiceFile: 'assets/audio/voiceover/hero_line2.mp3'},
  {id: 'hero_line3', character: 'hero', text: "Wait... something's wrong. I cracked.", fromFrame: 360, toFrame: 540, voiceFile: 'assets/audio/voiceover/hero_line3.mp3', delay: 30},
  {id: 'neighbor_line2', character: 'neighborLeft', text: 'Can you fix it?', fromFrame: 540, toFrame: 690, voiceFile: 'assets/audio/voiceover/neighbor_line2.mp3', delay: 18},
  {id: 'hero_line4', character: 'hero', text: "...I can't. Nobody can. I'm dead tissue.", fromFrame: 690, toFrame: 810, voiceFile: 'assets/audio/voiceover/hero_line4.mp3', delay: 4},
  {id: 'neighbor_line3', character: 'neighborLeft', text: "...So you're tough AND fragile?", fromFrame: 810, toFrame: 900, voiceFile: 'assets/audio/voiceover/neighbor_line3.mp3', delay: 10},
];

// Voice settings used by scripts/make_voices.py (edge-tts) and the espeak stand-ins.
export const VOICES = {
  hero: {edge: 'en-US-GuyNeural', rate: '-10%', pitch: '-5Hz'},
  neighborLeft: {edge: 'en-US-AriaNeural', rate: '+10%', pitch: '+10Hz'},
};

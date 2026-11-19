// "The Gap" (45s): dialogue windows at 30fps. Voices: public/assets/audio/gap/voiceover/<id>.mp3
// Regenerate voices: python3 scripts/make_voices_chatterbox.py --dialogue src/audio/gapDialogue.ts
// Re-sync captions: node scripts/build-voice-timings.mjs src/audio/gapDialogue.ts src/audio/gapTimings.json

export type GapCharacter = 'brain' | 'mo' | 'heart' | 'lungs' | 'gums' | 'tongue' | 'lefty' | 'righty' | 'upper' | 'bone';

export type GapLine = {
  id: string;
  character: GapCharacter;
  text: string;
  fromFrame: number;
  toFrame: number;
  voiceFile: string;
  delay?: number;
};


export const gapDialogue: GapLine[] = [
  // 1 HOOK - Brain HQ
  {id: 'brain1', character: 'brain', text: 'Red alert! Lower left molar is screaming!', fromFrame: 0, toFrame: 78, voiceFile: 'assets/audio/gap/voiceover/brain1.mp3'},
  {id: 'mo1', character: 'mo', text: "I'm fine. I'm... so not fine.", fromFrame: 80, toFrame: 140, voiceFile: 'assets/audio/gap/voiceover/mo1.mp3'},
  // 2 Dentist chair - chest
  {id: 'heart1', character: 'heart', text: "Dentist chair?! I'm beating SO fast!", fromFrame: 142, toFrame: 202, voiceFile: 'assets/audio/gap/voiceover/heart1.mp3'},
  {id: 'brain2', character: 'brain', text: 'Lungs. Breathe!', fromFrame: 204, toFrame: 236, voiceFile: 'assets/audio/gap/voiceover/brain2.mp3'},
  {id: 'lungs1', character: 'lungs', text: '...Sorry.', fromFrame: 238, toFrame: 266, voiceFile: 'assets/audio/gap/voiceover/lungs1.mp3'},
  {id: 'mo2', character: 'mo', text: "ONE tooth?! I've chewed for you for YEARS!", fromFrame: 268, toFrame: 350, voiceFile: 'assets/audio/gap/voiceover/mo2.mp3'},
  // 3 Extraction
  {id: 'mo3', character: 'mo', text: 'Tell the bone... I loved it.', fromFrame: 386, toFrame: 450, voiceFile: 'assets/audio/gap/voiceover/mo3.mp3'},
  {id: 'gums1', character: 'gums', text: 'Patching the hole! Give us a few weeks.', fromFrame: 456, toFrame: 530, voiceFile: 'assets/audio/gap/voiceover/gums1.mp3'},
  // 4 Tongue
  {id: 'tongue1', character: 'tongue', text: "Ooh, a hole. I'm touching it.", fromFrame: 532, toFrame: 590, voiceFile: 'assets/audio/gap/voiceover/tongue1.mp3'},
  {id: 'brain3', character: 'brain', text: 'Tongue! Stop poking!', fromFrame: 592, toFrame: 628, voiceFile: 'assets/audio/gap/voiceover/brain3.mp3'},
  {id: 'tongue2', character: 'tongue', text: "Can't. Won't.", fromFrame: 630, toFrame: 666, voiceFile: 'assets/audio/gap/voiceover/tongue2.mp3'},
  // 5 Quiz
  {id: 'brain4', character: 'brain', text: 'Who moves into the gap first? Guess in the comments!', fromFrame: 668, toFrame: 790, voiceFile: 'assets/audio/gap/voiceover/brain4.mp3'},
  // 6 Land grab
  {id: 'righty1', character: 'righty', text: 'Free real estate!', fromFrame: 812, toFrame: 852, voiceFile: 'assets/audio/gap/voiceover/righty1.mp3'},
  {id: 'lefty1', character: 'lefty', text: "I'm not moving. I'm just leaning.", fromFrame: 854, toFrame: 916, voiceFile: 'assets/audio/gap/voiceover/lefty1.mp3'},
  {id: 'upper1', character: 'upper', text: "Nobody bites me back... so I'm coming DOWN.", fromFrame: 918, toFrame: 998, voiceFile: 'assets/audio/gap/voiceover/upper1.mp3'},
  {id: 'brain5', character: 'brain', text: 'Trick question. All of them!', fromFrame: 1000, toFrame: 1058, voiceFile: 'assets/audio/gap/voiceover/brain5.mp3'},
  // 7 Bone
  {id: 'bone1', character: 'bone', text: "No tooth, no workout. I'll lose up to half my width in a year.", fromFrame: 1062, toFrame: 1172, voiceFile: 'assets/audio/gap/voiceover/bone1.mp3'},
  // 8 Fix it
  {id: 'brain6', character: 'brain', text: 'Lost a tooth? Ask your dentist early about filling the gap.', fromFrame: 1176, toFrame: 1290, voiceFile: 'assets/audio/gap/voiceover/brain6.mp3'},
  {id: 'upper2', character: 'upper', text: 'Or I keep coming down.', fromFrame: 1292, toFrame: 1346, voiceFile: 'assets/audio/gap/voiceover/upper2.mp3'},
];

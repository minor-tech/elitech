import {staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

// Palette sampled to sit with the reference look: a dark "inside the body" maroon,
// salmon soft tissue, thin dark-brown linework instead of black.
export const X = {
  bgDark: '#6E302E',
  bg: '#8B4541',
  bgBlob: '#9C524C',
  line: '#5A2726',
  enamel: '#FDFCF8',
  enamelShade: '#E9E3D8',
  dentin: '#F3D9A2',
  dentinDark: '#E3BF7E',
  pulp: '#EE7F86',
  pulpDark: '#C84F5C',
  nerveRed: '#D93B45',
  nerveBlue: '#5C7FD6',
  gum: '#EF7E78',
  gumLight: '#F7A7A0',
  bone: '#EBCFA9',
  boneDot: '#D9B88D',
  white: '#FFFFFF',
  ink: '#111111',
  gold: '#FFD700',
  red: '#E8202A',
};

export const CAPTION_FONT = 'Luckiest Guy';
loadFont({family: CAPTION_FONT, url: staticFile('fonts/LuckiestGuy.woff2'), weight: '400'});

export const GUM_LINE = 1240; // screen y of the gum line in the wide shot

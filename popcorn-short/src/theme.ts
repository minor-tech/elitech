import {interpolate, random, spring, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;
export const TOTAL_FRAMES = 900;

// Fredoka Bold (SIL OFL) is vendored in public/fonts so renders work offline.
export const fontFamily = 'Fredoka';
loadFont({family: fontFamily, url: staticFile('fonts/Fredoka-Bold.woff2'), weight: '700'});

export const C = {
  bg: '#FFE4E1', // soft pink
  night: '#000000',
  tooth: '#FFFFFF',
  toothShade: '#EDEDF2',
  toothOutline: '#8C8C96', // grey outline
  ink: '#2B1B1F', // face features + text outline
  gold: '#FFD700', // emphasis / kernel
  goldDark: '#B88A00',
  red: '#E8202A',
  redSoft: '#FF4D4D',
  gum: '#F59AAE',
  gumDark: '#C25C76',
  tongue: '#F06A86',
  water: '#8FD3FF',
};

// Scene boundaries (hard cuts, frames are inclusive starts)
export const SCENES = {
  s1: {from: 0, dur: 91},
  s2: {from: 91, dur: 120},
  s3: {from: 211, dur: 210},
  s4: {from: 421, dur: 240},
  s5: {from: 661, dur: 150},
  s6: {from: 811, dur: 89},
};

// Layout (all scenes share the same "mouth stage")
export const GUM_Y = 1420;
export const MAIN = {left: 145, top: GUM_Y - 350 * 1.2, scale: 1.2};
export const NEIGHBOR = {left: 560, top: GUM_Y - 350 * 0.9, scale: 0.9};
export const GAP = {x: 596, y: 1138}; // where the kernel wedges
export const TEXT_Y = 500; // caption band centre (well above the teeth)

// ---- Motion helpers -------------------------------------------------------
export const SPRING = {mass: 1, damping: 12};

export const bounce = (frame: number, delay = 0, fps = FPS) =>
  spring({frame: frame - delay, fps, config: SPRING});

/**
 * Impact squash: exactly 2 frames squashed, then a spring() back to rest.
 * Returns [scaleX, scaleY]. Anchor the transform at the contact point.
 */
export const squash = (frame: number, impactAt: number, amount = 0.22): [number, number] => {
  if (frame < impactAt) return [1, 1];
  if (frame < impactAt + 2) return [1 + amount, 1 - amount];
  const s = spring({frame: frame - impactAt - 2, fps: FPS, config: SPRING});
  const sy = interpolate(s, [0, 1], [1 - amount, 1]);
  const sx = interpolate(s, [0, 1], [1 + amount, 1]);
  return [sx, sy];
};

/** Deterministic shake offset. */
export const shake = (frame: number, amplitude: number): [number, number] => {
  if (amplitude <= 0) return [0, 0];
  return [
    (random(`sx-${frame}`) * 2 - 1) * amplitude,
    (random(`sy-${frame}`) * 2 - 1) * amplitude,
  ];
};

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

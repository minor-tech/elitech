import {interpolate} from 'remotion';
import {GUM_Y, squash} from '../theme';

export const E_SCENES = {
  s1: {from: 0, dur: 180}, // 0-6s   The Hero
  s2: {from: 180, dur: 180}, // 6-12s  The Chip
  s3: {from: 360, dur: 180}, // 12-18s The Failed Healing
  s4: {from: 540, dur: 180}, // 18-24s The Realization
  s5: {from: 720, dur: 180}, // 24-30s The Takeaway
};

export const BEAT = 15; // 120 BPM @ 30fps -> every scene is exactly 12 beats
export const E_TEXT_Y = 430; // top third, under the app's top bar
export const E_TEXT_HOLD = 130; // one card per scene, ~4.3s on screen

// A row of three teeth: hero centre, neighbours either side (all fully in frame)
export const HERO = {left: 540 - 200 * 1.45, top: GUM_Y - 350 * 1.45, scale: 1.45};
export const LEFT_N = {left: 310 - 350 * 0.95, top: GUM_Y - 350 * 0.95, scale: 0.95};
export const RIGHT_N = {left: 770 - 50 * 0.95, top: GUM_Y - 350 * 0.95, scale: 0.95};
export const PAPILLAE = [316, 764];

/** tooth-local -> screen for the hero */
export const heroXY = (lx: number, ly: number): [number, number] => [HERO.left + lx * HERO.scale, HERO.top + ly * HERO.scale];

// The kernel lives on the gum, lower right, and bounces every 2 seconds.
export const KERNEL_HOME = {x: 905, y: 1585};
export const KERNEL_LAND = 270; // absolute frame it first lands at home
export const KERNEL_PERIOD = 60;

/** Idle hop at home: [dy, squash] for an absolute frame. */
export const kernelIdle = (absFrame: number): {dy: number; sq: [number, number]} => {
  if (absFrame < KERNEL_LAND) return {dy: 0, sq: [1, 1]};
  const k = Math.floor((absFrame - KERNEL_LAND) / KERNEL_PERIOD);
  const land = KERNEL_LAND + k * KERNEL_PERIOD; // most recent landing
  const t = absFrame - land;
  const hopLen = 16; // the next hop takes off 16 frames before the next landing
  const nextLand = land + KERNEL_PERIOD;
  const tt = absFrame - (nextLand - hopLen);
  let dy = 0;
  let sq: [number, number] = squash(absFrame, land, 0.28);
  if (tt >= 0) {
    // stretch on take-off, arc up
    const p = tt / hopLen;
    dy = -Math.sin(Math.PI * p) * 80;
    const st = interpolate(p, [0, 0.2, 0.8, 1], [1, 1.18, 1.1, 1]);
    sq = [2 - st, st];
  } else if (t < 2) {
    sq = [1.28, 0.72];
  }
  return {dy, sq};
};

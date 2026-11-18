import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame} from 'remotion';
import {C, FPS, SPRING, fontFamily} from '../theme';
import {dialogue} from '../audio/dialogueData';
import timings from '../audio/voiceTimings.json';

type Timed = {text: string; frame: number};
type Page = {words: Timed[]; start: number; end: number};

const MAX_CHARS = 13; // ~60% of the frame width at the base size
const MAX_WORDS = 5;
const BASE_SIZE = 100;
const MAX_WIDTH = 1080 * 0.6;
const HOLD_AFTER_VOICE = 14; // frames a page lingers after the voice stops

/** Split each line into TikTok-style pages (<=14 chars, <=5 words, break after sentence punctuation). */
const buildPages = (): Page[] => {
  const pages: Page[] = [];
  for (const line of dialogue) {
    const t = (timings as Record<string, {words: Timed[]; voicedTo: number}>)[line.id];
    if (!t) continue;
    const base = line.fromFrame + (line.delay ?? 0);
    const words = t.words.map((w) => ({text: w.text, frame: base + w.frame}));
    let cur: Timed[] = [];
    const flush = () => {
      if (cur.length) pages.push({words: cur, start: cur[0].frame, end: 0});
      cur = [];
    };
    for (const w of words) {
      const len = [...cur, w].map((x) => x.text).join(' ').length;
      if (cur.length && (len > MAX_CHARS || cur.length >= MAX_WORDS)) flush();
      cur.push(w);
      if (/[.?!]$/.test(w.text)) flush();
    }
    flush();
    // each page ends when the next page of the same line starts, or after the voice ends
    const lineEnd = Math.min(line.toFrame, base + t.voicedTo + HOLD_AFTER_VOICE);
    const own = pages.filter((p) => p.end === 0);
    own.forEach((p, i) => (p.end = i < own.length - 1 ? own[i + 1].start : lineEnd));
  }
  return pages;
};
const PAGES = buildPages();

/** Word-by-word captions synced to the voiceover, top 25% of the frame. */
export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const page = PAGES.find((p) => f >= p.start && f < p.end);
  if (!page) return null;
  const est = page.words.map((w) => w.text).join(' ').length * BASE_SIZE * 0.56;
  const size = est > MAX_WIDTH ? (BASE_SIZE * MAX_WIDTH) / est : BASE_SIZE;
  const latest = [...page.words].reverse().find((w) => f >= w.frame);
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div
        style={{
          position: 'absolute',
          top: 480, // 25% of 1920
          transform: 'translateY(-50%)',
          maxWidth: MAX_WIDTH + 80,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: size * 0.28,
          fontFamily,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.1,
          textAlign: 'center',
        }}
      >
        {page.words.map((w, i) => {
          const shown = f >= w.frame;
          const s = shown ? spring({frame: f - w.frame, fps: FPS, config: SPRING}) : 0;
          const active = w === latest && f - w.frame < 6; // ~200ms highlight
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                opacity: shown ? 1 : 0,
                transform: `scale(${0.55 + 0.45 * s}) translateY(${(1 - s) * 18}px)`,
                color: active ? C.gold : '#FFFFFF',
                WebkitTextStroke: `8px ${C.ink}`, // half sits under the fill -> 4px visible outline
                paintOrder: 'stroke fill',
                textShadow: `0 6px 0 rgba(43,27,31,0.35)`,
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

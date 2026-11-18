# Popcorn Kernel at 3 AM: a 30s Remotion short

1080×1920 · 30 fps · 900 frames · text overlays and comedic SFX only.

```bash
npm install
npm run studio        # live preview / scrub the timeline
npm run render        # -> out/popcorn-short.mp4
npm run stills        # -> out/stills/frame-000/150/400/700.png (QA keyframes)
npm run sfx           # re-synthesise public/sfx/*.wav (already committed)
```

If Remotion can't download its own headless Chrome, point it at a local one:
`REMOTION_BROWSER=/path/to/chrome-headless-shell npm run stills` or
`npx remotion render ... --browser-executable=/path/to/chrome`.

## Structure

| Frames | Scene | File |
|---|---|---|
| 0–90 | Hook: 3 AM, peaceful tooth, zzz | `src/scenes/Scene1Hook.tsx` |
| 91–210 | Culprit: slow-mo kernel, *pop*, eyes snap open | `src/scenes/Scene2Culprit.tsx` |
| 211–420 | Escalation: 2s of fake peace, then accelerating pulses + shake | `src/scenes/Scene3Escalation.tsx` |
| 421–660 | Attempts: tongue / toothbrush boss fight / floss / water, each ends in FAIL | `src/scenes/Scene4Attempts.tsx` |
| 661–810 | Defeat: 5:47 AM, dark circles, thumbs down, sad trombone | `src/scenes/Scene5Defeat.tsx` |
| 811–899 | Payoff: dentist pulls it in one move, confetti | `src/scenes/Scene6Payoff.tsx` |

- `src/theme.ts`: palette, layout, and the motion helpers (`bounce` uses spring() with mass 1 and damping 12; `squash` holds 2 squashed frames, then springs back; `shake` is deterministic).
- `src/components/`: Tooth (expressions, sweat, red tint, squash), Kernel, TextCard (≤5 words, enforced), Clock, Gum, effects.
- SFX are synthesised by `scripts/make-sfx.mjs` (pop, thump, boing, whoosh, sad trombone), so there are no third-party audio licences.
- Font: Fredoka Bold (SIL OFL, `public/fonts/OFL.txt`), vendored so rendering works offline.

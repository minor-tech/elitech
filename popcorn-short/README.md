# Tooth shorts: 30s Remotion animations

Two compositions share one set of characters (`src/components/`):

| Composition | Video | Output |
|---|---|---|
| `PopcornShort` | #1: a popcorn kernel at 3 AM | `out/popcorn-short.mp4` |
| `EnamelShort` | #2: enamel is the hardest thing in your body, and it can't heal | `out/enamel-short.mp4` |

Render video #2 with `npm run render:enamel`, QA stills with `node scripts/render-stills.mjs EnamelShort 0 150 400 700`. Its caption and fact notes are in `CAPTION-enamel.md`.

---

## Video #1: Popcorn Kernel at 3 AM

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

## Video #2: Enamel (`src/enamel/`)

| Frames | Scene | Sound |
|---|---|---|
| 0-179 | The Hero: armoured tooth, shine, "Hardest thing in your body." | ta-DAH sting, clinks, text ting, sneaky theme |
| 180-359 | The Chip: kernel hops on, upper jaw bites, CRACK, chip flies off | crack, pops, boing |
| 360-539 | The Failed Healing: enamel cells try, turn to ghosts, "Can't heal. Can't grow back." | poofs, sad trombone, sad tag |
| 540-719 | The Realization: music stops, the row gasps, glance at the chip, gulp | record scratch, gasp, heartbeat |
| 720-899 | The Takeaway: grabs a toothbrush, "Protect what can't come back." | ding, upbeat outro |

- 120 BPM (15 frames per beat), so every 6s scene is exactly 12 beats; music and hits are synthesised in `scripts/make-sfx.mjs`.
- One caption per scene, top third, ~4.3s hold; the kernel squash-bounces every 2s; the sleeping neighbour's Zzz grow each scene until the snot bubble pops.

## Video #2 v2: dialogue + captions (`EnamelShortV2`)

Same characters, reworked: two-character dialogue, word-by-word TikTok-style captions, SFX at fixed frames, a lo-fi bed that ducks under "I cracked", and a new visual beat every ~2s.

| File | What it is |
|---|---|
| `src/audio/dialogueData.ts` | the 7 lines: character, text, frame window, voice file, start delay, edge-tts voice settings |
| `src/audio/sfxData.ts` | SFX cues (frame, volume) + BGM volume/ducking |
| `src/audio/voiceTimings.json` | generated: per-word frames + per-frame mouth loudness (do not edit by hand) |
| `src/components/Captions.tsx` | word-by-word captions, top 25%, <=60% width, active word in gold |
| `src/components/EndCard.tsx` | "Enamel can't heal. Protect it." from frame 810, bottom third |
| `src/components/FactPop.tsx` | fact stickers between lines (frames 120 and 600) |
| `src/enamelv2/` | the composition + reworked animation |

### Audio: drop-in workflow

Everything lives in **`public/assets/audio/`** (Remotion serves files from `public/` via `staticFile()`, so `src/assets` would not be bundled):

```
public/assets/audio/voiceover/hero_line1.mp3 ... neighbor_line3.mp3
public/assets/audio/sfx/pop.mp3 skeptical_grunt.mp3 ice_crack.mp3 nut_crunch.mp3 glass_shatter.mp3 gasp.mp3 sad_trombone.mp3
public/assets/audio/bgm/lofi_bgm.mp3
```

The committed files are **stand-ins** (espeak robot voices, synthesised SFX/BGM) so the video renders today. To upgrade:

1. **Voices (recommended: Chatterbox, free + expressive)** on your Mac:
   ```bash
   python3.11 -m venv ~/chatterbox-env && source ~/chatterbox-env/bin/activate
   pip install chatterbox-tts faster-whisper
   python3 scripts/make_voices_chatterbox.py --only hero_line1   # test one line
   python3 scripts/make_voices_chatterbox.py --takes 3           # all lines, 3 takes each
   ```
   Acting per line (`ACTING`) and cartoon pitch per character (`CHARACTERS`) sit at the top of the script. Lines that run long are sped up to fit their slot. Alternative: `pip install edge-tts && npm run voices` (flatter delivery).
2. **SFX / BGM**: download from Pixabay / Mixkit / Uppbeat and save over the files above with the same names (any length; volumes live in `sfxData.ts`).
3. `npm run timings`: re-syncs captions and talking mouths to the new audio and warns if a line runs past its window.
4. `npm run render:enamel-v2` -> `out/enamel-short-v2.mp4`

`npm run audio:v2` recreates missing stand-ins and never overwrites existing files (`-- --force` to regenerate them).

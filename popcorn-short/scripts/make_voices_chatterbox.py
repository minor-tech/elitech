#!/usr/bin/env python3
r"""EnamelShortV2 voiceovers with Chatterbox (resemble-ai/chatterbox, MIT, free, runs locally).

One-time setup (Python 3.11 or 3.12):
    Mac:     python3.11 -m venv ~/chatterbox-env && source ~/chatterbox-env/bin/activate
    Windows: py -3.12 -m venv %USERPROFILE%\chatterbox-env   (then use chatterbox-env\Scripts\python.exe)
    pip install chatterbox-tts
    pip install faster-whisper        # optional: exact word timings for the captions

Then, from popcorn-short/ (on Windows replace "python3" with the venv's python.exe):
    python3 scripts/make_voices_chatterbox.py --only hero_line1   # test one line first
    python3 scripts/make_voices_chatterbox.py                     # all 7 lines
    python3 scripts/make_voices_chatterbox.py --takes 3           # 3 takes per line to pick from
    npm run timings && npm run render:enamel-v2

What it does per line:
  1. Chatterbox generates the line with that line's acting (exaggeration / cfg_weight below)
  2. trims silence, then pitches it up for the cartoon voice WITHOUT changing its length
     (ffmpeg asetrate + atempo); hero ~1.15x, neighbour ~1.3x so the two teeth sound different
  3. if the line is too long for its slot in dialogueData.ts, speeds it up just enough (max 1.3x)
  4. writes public/assets/audio/voiceover/<id>.mp3 (+ <id>.words.json if faster-whisper is installed)
Every take carries Resemble's inaudible Perth watermark (doesn't affect TikTok).
"""
import argparse, json, pathlib, re, shutil, subprocess, sys, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public/assets/audio/voiceover"
REFS = ROOT / "public/assets/audio/voice_refs"  # optional: hero.wav / neighborLeft.wav (~10s of YOUR OWN voice)
FPS = 30

# ---- Voice per character -------------------------------------------------------
# target_hz: each take is measured and pitch-shifted so its median pitch lands here.
# "pitch" is the fallback multiplier if a take's pitch can't be measured.
# Measured on the reference: main voices ~250-360 Hz, ~4 syllables/s, very wide pitch swings.
CHARACTERS = {
    "hero": {"target_hz": 290, "pitch": 1.3, "speed": 1.12},
    "neighborLeft": {"target_hz": 350, "pitch": 1.45, "speed": 1.15},
}
# ---- Acting per line (from the script's directions) ----------------------------
# exaggeration: 0.25 flat ... 0.5 default ... 1.0+ over the top
# cfg_weight:   lower (~0.3) = looser, more dramatic pacing; 0.5 = default
ACTING = {
    "hero_line1": {"exaggeration": 0.75, "cfg_weight": 0.35},  # deep, confident
    "neighbor_line1": {"exaggeration": 0.85, "cfg_weight": 0.30},  # skeptical
    "hero_line2": {"exaggeration": 0.85, "cfg_weight": 0.35},  # proud, showing off
    "hero_line3": {"exaggeration": 0.95, "cfg_weight": 0.30},  # suddenly pained
    "neighbor_line2": {"exaggeration": 0.90, "cfg_weight": 0.30},  # alarmed
    "hero_line4": {"exaggeration": 0.35, "cfg_weight": 0.45},  # defeated, quiet
    "neighbor_line3": {"exaggeration": 0.55, "cfg_weight": 0.40},  # deadpan beat
}
TEMPERATURE = 0.8
MAX_SPEEDUP = 1.3
MARGIN_S = 0.15  # breathing room before the next line's window


def load_lines():
    src = (ROOT / "src/audio/dialogueData.ts").read_text()
    pat = re.compile(
        r"\{id: '(\w+)', character: '(\w+)', text: (?:\"([^\"]*)\"|'([^']*)'), fromFrame: (\d+), toFrame: (\d+), voiceFile: '([^']+)'(?:, delay: (\d+))?"
    )
    lines = []
    for m in pat.finditer(src):
        lines.append({
            "id": m[1], "character": m[2], "text": m[3] or m[4],
            "slot_s": (int(m[6]) - int(m[5]) - int(m[8] or 0)) / FPS - MARGIN_S,
            "file": ROOT / "public" / m[7],
        })
    if not lines:
        sys.exit("Could not read any lines from src/audio/dialogueData.ts")
    return lines


def ffmpeg_cmd():
    if shutil.which("ffmpeg"):
        return ["ffmpeg"]
    npx = shutil.which("npx") or shutil.which("npx.cmd") or "npx"  # npx.cmd on Windows
    return [npx, "remotion", "ffmpeg"]  # the ffmpeg bundled with Remotion


def tts_text(text):
    # ALL-CAPS words ("AND") are written for the captions; say them as words, not letters
    return re.sub(r"\b[A-Z]{2,}\b", lambda m: m[0].lower(), text)


def median_pitch(y, sr):
    """Median f0 (Hz) of the voiced part of a take, or None."""
    import numpy as np
    import librosa
    f0, voiced, _ = librosa.pyin(y, fmin=70, fmax=600, sr=sr, frame_length=2048)
    f0 = f0[voiced & ~np.isnan(f0)] if voiced is not None else f0[~np.isnan(f0)]
    return float(np.median(f0)) if len(f0) > 10 else None


def atempo_chain(x):
    # atempo accepts 0.5..2.0 per stage; chain stages for anything outside that
    stages = []
    while x > 2.0:
        stages.append(2.0); x /= 2.0
    while x < 0.5:
        stages.append(0.5); x /= 0.5
    stages.append(x)
    return ",".join(f"atempo={s:.5f}" for s in stages)


def post(wav_in, mp3_out, sr, pitch, speed):
    # pitch up by `pitch` (asetrate also speeds up), then undo the speed-up with atempo,
    # then apply the real speed change -> cartoon pitch, controlled length
    af = f"asetrate={int(sr * pitch)},aresample={sr},{atempo_chain(speed / pitch)},loudnorm=I=-16:TP=-1.5:LRA=11"
    subprocess.run(ffmpeg_cmd() + ["-y", "-loglevel", "error", "-i", str(wav_in), "-af", af,
                                   "-ar", "44100", "-codec:a", "libmp3lame", "-q:a", "2", str(mp3_out)],
                   check=True, cwd=ROOT)


def word_timings(mp3, words_json, whisper):
    if whisper is None:
        words_json.unlink(missing_ok=True)  # stale edge-tts timings would be wrong now
        return "estimated by npm run timings"
    segments, _ = whisper.transcribe(str(mp3), word_timestamps=True, language="en")
    words = [{"text": w.word.strip(), "startMs": w.start * 1000, "endMs": w.end * 1000}
             for s in segments for w in (s.words or [])]
    words_json.write_text(json.dumps(words, indent=1))
    return f"{len(words)} word timings (whisper)"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", nargs="*", help="line ids to (re)generate, e.g. hero_line1")
    ap.add_argument("--takes", type=int, default=1, help="extra takes saved to voiceover/takes/ to pick from")
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--device", default=None, help="mps | cuda | cpu (auto)")
    ap.add_argument("--dry-run", action="store_true", help="print the plan without loading the model")
    args = ap.parse_args()

    lines = [l for l in load_lines() if not args.only or l["id"] in args.only]
    for l in lines:
        c, a = CHARACTERS[l["character"]], ACTING[l["id"]]
        print(f"{l['id']:15} ->{c['target_hz']}Hz  exag {a['exaggeration']:.2f}  cfg {a['cfg_weight']:.2f}  slot {l['slot_s']:.2f}s  \"{l['text']}\"")
    if args.dry_run:
        return

    import torch
    import torchaudio as ta
    import librosa
    from chatterbox.tts import ChatterboxTTS

    device = args.device or ("mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu")
    print(f"\nloading Chatterbox on {device} (first run downloads ~2 GB of weights)...")
    model = ChatterboxTTS.from_pretrained(device=device)

    whisper = None
    try:
        from faster_whisper import WhisperModel
        whisper = WhisperModel("base.en", device="cpu", compute_type="int8")
    except ImportError:
        print("(faster-whisper not installed: caption timings will be estimated from loudness)")

    OUT.mkdir(parents=True, exist_ok=True)
    tmp = pathlib.Path(tempfile.mkdtemp())
    for l in lines:
        c, a = CHARACTERS[l["character"]], ACTING[l["id"]]
        ref = REFS / f"{l['character']}.wav"
        for take in range(1, max(1, args.takes) + 1):
            torch.manual_seed(args.seed + take * 1000 + hash(l["id"]) % 997)
            wav = model.generate(
                tts_text(l["text"]),
                audio_prompt_path=str(ref) if ref.exists() else None,
                exaggeration=a["exaggeration"],
                cfg_weight=a["cfg_weight"],
                temperature=TEMPERATURE,
            )
            y = wav.squeeze(0).cpu().numpy()
            y, _ = librosa.effects.trim(y, top_db=35)  # no dead air at either end
            raw = tmp / f"{l['id']}_{take}.wav"
            ta.save(str(raw), torch.from_numpy(y).unsqueeze(0), model.sr)

            measured = median_pitch(y, model.sr)
            pitch = min(1.8, max(0.85, c["target_hz"] / measured)) if measured else c["pitch"]

            length = len(y) / model.sr / c["speed"]
            speed = c["speed"]
            note = ""
            if length > l["slot_s"]:
                need = length / l["slot_s"]
                speed *= min(MAX_SPEEDUP, need)
                note = f"  sped up x{min(MAX_SPEEDUP, need):.2f} to fit"
                if need > MAX_SPEEDUP:
                    note += f"  STILL {length / MAX_SPEEDUP - l['slot_s']:.2f}s TOO LONG: try another take or lower exaggeration"

            if take == 1:
                dest = l["file"]
            else:
                (OUT / "takes").mkdir(exist_ok=True)
                dest = OUT / "takes" / f"{l['id']}_take{take}.mp3"
            post(raw, dest, model.sr, pitch, speed)
            words = word_timings(dest, dest.with_suffix(".words.json"), whisper) if take == 1 else ""
            hz = f"{measured:.0f}->{measured * pitch:.0f} Hz" if measured else f"pitch x{pitch:.2f}"
            print(f"made  {dest.relative_to(ROOT)}  {length * c['speed'] / speed:.2f}s  {hz}{note}  {words}")

    print("\nNext: npm run timings && npm run render:enamel-v2")
    if args.takes > 1:
        print("To use another take: copy voiceover/takes/<id>_takeN.mp3 over voiceover/<id>.mp3, then npm run timings")


if __name__ == "__main__":
    main()

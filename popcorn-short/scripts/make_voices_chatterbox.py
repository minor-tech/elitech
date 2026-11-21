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
import argparse, json, math, pathlib, re, shutil, subprocess, sys, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public/assets/audio/voiceover"
REFS = ROOT / "public/assets/audio/voice_refs"  # optional: hero.wav / neighborLeft.wav (~10s of YOUR OWN voice)
FPS = 30

# ---- Voice per character -------------------------------------------------------
# target_hz: each take is measured and pitch-shifted so its median pitch lands here.
# "pitch" is the fallback multiplier if a take's pitch can't be measured.
# Measured on the reference: main voices ~250-360 Hz, ~4 syllables/s, very wide pitch swings.
# rate = target syllables/second of speech; exag/cfg = default acting for the character
CHARACTERS = {
    # Enamel short
    "hero": {"target_hz": 290, "pitch": 1.3, "rate": 4.2, "exag": 1.0, "cfg": 0.4},
    "neighborLeft": {"target_hz": 350, "pitch": 1.45, "rate": 4.2, "exag": 1.1, "cfg": 0.35},
    # The Gap v2: fixed cartoon pitch-up (length unchanged), exaggeration 0.8 / cfg 0.3 for everyone
    "brain": {"fixed_pitch": 1.1, "exag": 0.8, "cfg": 0.3},
    "mo": {"fixed_pitch": 1.15, "exag": 0.8, "cfg": 0.3},  # the main molar
    "lefty": {"fixed_pitch": 1.3, "exag": 0.8, "cfg": 0.3},  # neighbour teeth
    "righty": {"fixed_pitch": 1.3, "exag": 0.8, "cfg": 0.3},
    "upper": {"fixed_pitch": 1.3, "exag": 0.8, "cfg": 0.3},
    "tongue": {"fixed_pitch": 1.3, "exag": 0.8, "cfg": 0.3},
    "gums": {"fixed_pitch": 1.3, "exag": 0.8, "cfg": 0.3},
    "bone": {"fixed_pitch": 1.1, "exag": 0.8, "cfg": 0.3},
    # Soda short
    "bug": {"fixed_pitch": 1.45, "exag": 0.9, "cfg": 0.3},  # squeaky party villains
    "saliva": {"fixed_pitch": 1.3, "exag": 0.85, "cfg": 0.3},  # upbeat lifeguard
}
# ---- Acting per line (from the script's directions) ----------------------------
# exaggeration: 0.25 flat ... 0.5 default ... 1.0+ over the top
# cfg_weight:   lower (~0.3) = looser, more dramatic pacing; 0.5 = default
ACTING = {
    "hero_line1": {"exaggeration": 1.0, "cfg_weight": 0.4},  # deep, confident
    "neighbor_line1": {"exaggeration": 1.1, "cfg_weight": 0.35},  # skeptical
    "hero_line2": {"exaggeration": 1.1, "cfg_weight": 0.4},  # proud, showing off
    "hero_line3": {"exaggeration": 1.2, "cfg_weight": 0.35},  # suddenly pained
    "neighbor_line2": {"exaggeration": 1.15, "cfg_weight": 0.35},  # alarmed
    "hero_line4": {"exaggeration": 0.6, "cfg_weight": 0.45},  # defeated, quiet
    "neighbor_line3": {"exaggeration": 0.8, "cfg_weight": 0.4},  # deadpan beat
}
TEMPERATURE = 0.85
PITCH_RANGE = (0.7, 1.8)  # never shift further than this (artefacts)
MAX_SPEEDUP = 1.3
MIN_SPEED = 0.8
MARGIN_S = 0.15  # breathing room before the next line's window


def load_lines(dialogue="src/audio/dialogueData.ts"):
    src = (ROOT / dialogue).read_text()
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
        sys.exit(f"Could not read any lines from {dialogue}")
    return lines


def ffmpeg_cmd():
    if shutil.which("ffmpeg"):
        return ["ffmpeg"]
    npx = shutil.which("npx") or shutil.which("npx.cmd") or "npx"  # npx.cmd on Windows
    return [npx, "remotion", "ffmpeg"]  # the ffmpeg bundled with Remotion


def tts_text(text, variant=0):
    """Text as fed to Chatterbox. Same words every time; later variants only change punctuation,
    which helps when a take keeps mangling a word (e.g. a lone "Hardest?" at the start)."""
    t = re.sub(r"\b[A-Z]{2,}\b", lambda m: m[0].lower(), text)  # "AND" -> "and", not letters
    if variant % 3 == 1:
        t = t.replace("...", " ").replace("?", "?!")
    elif variant % 3 == 2:
        t = t.replace("...", " ").replace("?", "!")
    return re.sub(r"\s+", " ", t).strip(" ,")


def median_pitch(y, sr):
    """Median f0 (Hz) of the voiced part of a take, or None."""
    import numpy as np
    import librosa
    f0, voiced, _ = librosa.pyin(y, fmin=70, fmax=600, sr=sr, frame_length=1024)  # short frames: works on 0.5s lines
    f0 = f0[~np.isnan(f0)]
    return float(np.median(f0)) if len(f0) > 4 else None


def syllables(text):
    words = re.findall(r"[a-z']+", text.lower())
    return sum(max(1, len(re.findall(r"[aeiouy]+", w)) - (1 if w.endswith("e") and len(w) > 3 else 0)) for w in words)


HOMOPHONES = {"whole": "hole", "wont": "won't", "your": "you're", "to": "too", "two": "too", "for": "four"}


def norm_words(text):
    """Lower-case words; sound-alikes collapse so a correct take isn't failed for Whisper's spelling."""
    words = [w for w in re.sub(r"[^a-z' ]", " ", text.lower()).split() if w]
    return [HOMOPHONES.get(w, w) for w in words]


def pitch_swing(y, sr):
    import numpy as np
    import librosa
    f0, voiced, _ = librosa.pyin(y, fmin=70, fmax=700, sr=sr, frame_length=1024)
    f0 = f0[~np.isnan(f0)]
    if len(f0) < 5:
        return 0.0
    st = 12 * np.log2(f0 / np.median(f0))
    return float(np.percentile(st, 90) - np.percentile(st, 10))


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


def transcribe(path, whisper):
    segments, _ = whisper.transcribe(str(path), word_timestamps=True, language="en")
    return [{"text": w.word.strip(), "startMs": w.start * 1000, "endMs": w.end * 1000} for s in segments for w in (s.words or [])]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dialogue", default="src/audio/dialogueData.ts", help="dialogue file to voice")
    ap.add_argument("--only", nargs="*", help="line ids to (re)generate, e.g. hero_line1")
    ap.add_argument("--takes", type=int, default=3, help="takes per line; the best is picked automatically, all are kept in voiceover/takes/")
    ap.add_argument("--max-takes", type=int, default=9, help="keep trying up to this many takes if a line is mispronounced")
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--device", default=None, help="mps | cuda | cpu (auto)")
    ap.add_argument("--dry-run", action="store_true", help="print the plan without loading the model")
    args = ap.parse_args()

    lines = [l for l in load_lines(args.dialogue) if not args.only or l["id"] in args.only]
    for l in lines:
        c = CHARACTERS[l["character"]]
        a = ACTING.get(l["id"], {"exaggeration": c["exag"], "cfg_weight": c["cfg"]})
        print(f"{l['id']:15} {'x' + str(c['fixed_pitch']) if 'fixed_pitch' in c else '->' + str(c['target_hz']) + 'Hz'}  exag {a['exaggeration']:.2f}  cfg {a['cfg_weight']:.2f}  slot {l['slot_s']:.2f}s  \"{l['text']}\"")
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

    for l in lines:
        (l["file"].parent / "takes").mkdir(parents=True, exist_ok=True)  # takes live next to each video's voices
    tmp = pathlib.Path(tempfile.mkdtemp())
    from difflib import SequenceMatcher
    for l in lines:
        c = CHARACTERS[l["character"]]
        a = ACTING.get(l["id"], {"exaggeration": c["exag"], "cfg_weight": c["cfg"]})
        ref = REFS / f"{l['character']}.wav"
        want = norm_words(l["text"])
        n_syl = syllables(l["text"])
        results = []
        take = 0
        # at least --takes takes; keep going (up to --max-takes) until one says every word right
        good = lambda: any(r["accuracy"] >= 0.99 and r["on_pitch"] and r["fits"] for r in results)
        while take < max(1, args.takes) or (take < args.max_takes and not good()):
            take += 1
            torch.manual_seed(args.seed + take * 1000 + sum(map(ord, l["id"])))
            wav = model.generate(
                tts_text(l["text"], variant=(take - 1) // 2),
                audio_prompt_path=str(ref) if ref.exists() else None,
                exaggeration=a["exaggeration"],
                cfg_weight=a["cfg_weight"],
                temperature=TEMPERATURE,
            )
            y = wav.squeeze(0).cpu().numpy()
            y, _ = librosa.effects.trim(y, top_db=45)  # no dead air, but keep soft first/last sounds
            raw = tmp / f"{l['id']}_{take}.wav"
            ta.save(str(raw), torch.from_numpy(y).unsqueeze(0), model.sr)

            measured = median_pitch(y, model.sr)
            fixed = "fixed_pitch" in c
            if fixed:
                pitch = c["fixed_pitch"]  # same multiplier on every take; length kept (speed 1)
            else:
                pitch = min(PITCH_RANGE[1], max(PITCH_RANGE[0], c["target_hz"] / measured)) if measured else c["pitch"]
            natural = len(y) / model.sr
            speed = 1.0 if fixed else min(MAX_SPEEDUP, max(MIN_SPEED, (n_syl / natural) and c["rate"] / (n_syl / natural)))
            if natural / speed > l["slot_s"]:
                speed = min(MAX_SPEEDUP, natural / l["slot_s"])
            final_len = natural / speed

            mp3 = l["file"].parent / "takes" / f"{l['id']}_take{take}.mp3"
            post(raw, mp3, model.sr, pitch, speed)
            words = transcribe(mp3, whisper) if whisper else []
            got = norm_words(" ".join(w["text"] for w in words))
            accuracy = SequenceMatcher(None, want, got).ratio() if whisper else 1.0
            swing = pitch_swing(y, model.sr)
            rate = n_syl / final_len
            fits = final_len <= l["slot_s"]
            # same character = same voice: a take whose pitch can't reach the target (shift capped at 1.8x) is penalised
            if fixed:
                on_pitch = True
                # fixed multiplier: prefer brighter base voices (more cartoony, more consistent)
                pitch_term = 0.4 * min(1.0, max(0.0, ((measured or 150) - 150) / 90))
                rate_term = 0.0
            else:
                on_pitch = bool(measured) and abs(math.log(measured * pitch / c["target_hz"])) < math.log(1.08)
                pitch_term = 0.0 if on_pitch else -1.0
                rate_term = -0.5 * abs(rate - c["rate"]) / c["rate"]
            score = 3 * accuracy + 0.6 * min(swing, 14) / 14 + rate_term + pitch_term - (0 if fits else 2)
            results.append({"take": take, "mp3": mp3, "words": words, "score": score, "accuracy": accuracy, "on_pitch": on_pitch, "fits": fits})
            print(f"  {l['id']} take {take}: \"{' '.join(got)}\"  acc {accuracy:.2f}  swing {swing:4.1f}st  "
                  f"{rate:.1f} syl/s  {final_len:.2f}s/{l['slot_s']:.2f}s  {measured or 0:.0f}->{(measured or 0) * pitch:.0f}Hz  score {score:.2f}")

        best = max(results, key=lambda r: r["score"])
        if best["accuracy"] < 0.99 or not best["on_pitch"]:
            print(f"  WARNING {l['id']}: best take is not word-perfect AND on pitch (acc {best['accuracy']:.2f}) - listen to it")
        shutil.copyfile(best["mp3"], l["file"])
        words_json = l["file"].with_suffix(".words.json")
        if best["words"]:
            words_json.write_text(json.dumps(best["words"], indent=1))
        else:
            words_json.unlink(missing_ok=True)
        print(f"made  {l['file'].relative_to(ROOT)}  <- take {best['take']} (best of {len(results)})")

    print("\nNext: npm run timings && npm run render:enamel-v2")
    print("To use a different take: copy voiceover/takes/<id>_takeN.mp3 over voiceover/<id>.mp3 and delete <id>.words.json, then npm run timings")


if __name__ == "__main__":
    main()

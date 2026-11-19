#!/usr/bin/env python3
"""Use a different take for a line, then re-sync.

    python3 scripts/pick_take.py public/assets/audio/gap/voiceover gums1 6
    node scripts/build-voice-timings.mjs src/audio/gapDialogue.ts src/audio/gapTimings.json

Copies <dir>/takes/<id>_take<N>.mp3 over <dir>/<id>.mp3 and writes fresh word timings
(needs faster-whisper; without it the timings are estimated from the audio).
"""
import json, pathlib, shutil, sys

folder, line_id, take = pathlib.Path(sys.argv[1]), sys.argv[2], sys.argv[3]
src = folder / "takes" / f"{line_id}_take{take}.mp3"
dst = folder / f"{line_id}.mp3"
shutil.copyfile(src, dst)
words_json = dst.with_suffix(".words.json")
try:
    from faster_whisper import WhisperModel
    segs, _ = WhisperModel("base.en", device="cpu", compute_type="int8").transcribe(str(dst), word_timestamps=True, language="en")
    words = [{"text": w.word.strip(), "startMs": w.start * 1000, "endMs": w.end * 1000} for s in segs for w in (s.words or [])]
    words_json.write_text(json.dumps(words, indent=1))
    print(f"{dst.name} <- take {take}: \"{' '.join(w['text'] for w in words)}\"")
except ImportError:
    words_json.unlink(missing_ok=True)
    print(f"{dst.name} <- take {take} (timings will be estimated)")

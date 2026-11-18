#!/usr/bin/env python3
"""Generate the real EnamelShortV2 voiceovers with edge-tts (free, no API key).

Run on your own machine (needs internet):
    pip install edge-tts
    python3 scripts/make_voices.py          # skips lines that already have a real take
    python3 scripts/make_voices.py --force  # regenerate all 7
    npm run timings                         # re-sync captions + mouths to the new audio

Writes public/assets/audio/voiceover/<id>.mp3 plus <id>.words.json (exact word timings).
Voices / rate / pitch come from src/audio/dialogueData.ts (VOICES).
"""
import asyncio, json, pathlib, re, sys

import edge_tts

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = (ROOT / "src/audio/dialogueData.ts").read_text()
LINES = [
    {"id": m[0], "character": m[1], "text": m[2] or m[3]}
    for m in re.findall(r"id: '(\w+)', character: '(\w+)', text: (?:\"([^\"]*)\"|'([^']*)')", SRC)
]
VOICES = {
    m[0]: {"voice": m[1], "rate": m[2], "pitch": m[3]}
    for m in re.findall(r"(\w+): \{edge: '([^']+)', rate: '([^']+)', pitch: '([^']+)'\}", SRC)
}
OUT = ROOT / "public/assets/audio/voiceover"
FORCE = "--force" in sys.argv


async def make(line):
    mp3 = OUT / f"{line['id']}.mp3"
    words_path = OUT / f"{line['id']}.words.json"
    if words_path.exists() and not FORCE:
        print("keep  ", mp3.name)
        return
    v = VOICES[line["character"]]
    com = edge_tts.Communicate(line["text"], v["voice"], rate=v["rate"], pitch=v["pitch"], boundary="WordBoundary")
    words = []
    with open(mp3, "wb") as f:
        async for chunk in com.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / 10_000  # 100ns ticks -> ms
                words.append({"text": chunk["text"], "startMs": start, "endMs": start + chunk["duration"] / 10_000})
    words_path.write_text(json.dumps(words, indent=1))
    print("made  ", mp3.name, f"({len(words)} words, {v['voice']})")


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for line in LINES:
        await make(line)


asyncio.run(main())

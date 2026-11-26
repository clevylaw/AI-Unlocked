#!/usr/bin/env python3
"""Record the read-aloud audio for every lesson with Speechify, then rebuild the pages.

Usage:  python3 make_audio.py            record anything new or changed, then rebuild
        python3 make_audio.py --dry-run  only list what would be recorded and how many characters
        python3 make_audio.py --only how-ai-learns   record one lesson

Each lesson is recorded one block (heading, paragraph, list...) at a time, so the page can
highlight what is being read and pause between paragraphs. File names include a hash of the
text, so only blocks whose words changed are recorded again, and old files are deleted.

The API key is read from the SPEECHIFY_API_KEY environment variable, or from the file
~/.config/ai-unlocked/speechify_api_key. It is never stored in this repository.
"""
import base64, json, os, re, sys, time, urllib.error, urllib.request
import build

API = "https://api.speechify.ai/v1/audio/speech"
AUDIO = os.path.join(build.ROOT, "audio")

def api_key():
    k = os.environ.get("SPEECHIFY_API_KEY")
    if not k:
        p = os.path.expanduser("~/.config/ai-unlocked/speechify_api_key")
        k = open(p).read().strip() if os.path.exists(p) else ""
    if not k:
        sys.exit("No Speechify API key. Set SPEECHIFY_API_KEY or create ~/.config/ai-unlocked/speechify_api_key")
    return k

def lesson_scripts():
    """Read the spoken text that build.py put into each lesson page."""
    out = {}
    for slug in sorted(os.listdir(os.path.join(build.ROOT, "lessons"))):
        page = os.path.join(build.ROOT, "lessons", slug, "index.html")
        if not os.path.exists(page):
            continue
        m = re.search(r'<script type="application/json" id="read-data">(.*?)</script>', open(page, encoding="utf-8").read(), re.S)
        out[slug] = [b["t"] for b in json.loads(m.group(1).replace("<\\/", "</"))["blocks"]]
    return out

def speak(key, text):
    body = json.dumps({
        "input": text, "voice_id": build.VOICE_ID, "model": build.TTS_MODEL, "language": "en-US",
        "output_format": "mp3_24000_64", "options": {"loudness_normalization": True, "text_normalization": True},
    }).encode()
    for attempt in range(6):
        req = urllib.request.Request(API, data=body, method="POST", headers={
            "Authorization": "Bearer " + key, "Content-Type": "application/json", "Accept": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                d = json.load(r)
            return base64.b64decode(d["audio_data"]), int(d.get("billable_characters_count") or 0)
        except urllib.error.HTTPError as e:
            detail = e.read()[:300].decode("utf-8", "replace")
            if e.code in (429, 500, 502, 503) and attempt < 5:
                wait = int(e.headers.get("Retry-After") or 0) or 2 ** attempt * 2
                print(f"  {e.code}, waiting {wait}s and trying again", flush=True)
                time.sleep(wait)
                continue
            sys.exit(f"Speechify returned {e.code}: {detail}")
        except urllib.error.URLError as e:
            if attempt < 5:
                time.sleep(2 ** attempt * 2)
                continue
            sys.exit(f"Could not reach Speechify: {e}")

def main():
    dry = "--dry-run" in sys.argv
    only = sys.argv[sys.argv.index("--only") + 1] if "--only" in sys.argv else None
    build.main()
    scripts = lesson_scripts()
    manifest = build.audio_manifest()
    files = manifest.setdefault("files", {})
    todo, keep = [], set()
    for slug, texts in scripts.items():
        for i, t in enumerate(texts):
            name = f"{slug}/{i}-{build.tts_hash(t)}.mp3"
            keep.add(name)
            if (only and slug != only) or (name in files and os.path.exists(os.path.join(AUDIO, name))):
                continue
            todo.append((name, t))
    chars = sum(len(t) for _, t in todo)
    print(f"{len(todo)} blocks to record, {chars:,} characters ({sum(len(t) for ts in scripts.values() for t in ts):,} in the whole course)")
    if dry:
        return
    key = api_key() if todo else None
    billed = 0
    for n, (name, text) in enumerate(todo, 1):
        audio, b = speak(key, text)
        billed += b
        path = os.path.join(AUDIO, name)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as f:
            f.write(audio)
        files[name] = {"chars": len(text)}
        print(f"[{n}/{len(todo)}] {name} ({len(audio) // 1024} KB)", flush=True)
        manifest.update(voice=build.VOICE_ID, model=build.TTS_MODEL)
        json.dump(manifest, open(os.path.join(AUDIO, "manifest.json"), "w"), indent=1, sort_keys=True)
        time.sleep(1.1)  # the free plan allows about one request a second
    if not only:
        # Remove recordings for text that no longer exists.
        for name in list(files):
            if name not in keep:
                files.pop(name)
                try:
                    os.remove(os.path.join(AUDIO, name))
                except FileNotFoundError:
                    pass
        for d in os.listdir(AUDIO) if os.path.isdir(AUDIO) else []:
            full = os.path.join(AUDIO, d)
            if os.path.isdir(full):
                for f in os.listdir(full):
                    if f"{d}/{f}" not in keep:
                        os.remove(os.path.join(full, f))
                if not os.listdir(full):
                    os.rmdir(full)
    if os.path.isdir(AUDIO):
        manifest.update(voice=build.VOICE_ID, model=build.TTS_MODEL)
        json.dump(manifest, open(os.path.join(AUDIO, "manifest.json"), "w"), indent=1, sort_keys=True)
    print(f"recorded {len(todo)} blocks, {billed:,} billable characters")
    build.main()

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Check catalog.json (the AI tools and AI models lists) before it is published.

Usage: python3 scripts/check_catalog.py
Exits with status 1 and lists every problem if anything is wrong. Run it after every edit.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOL_CATS = {"legal", "chat", "search", "learning", "writing", "image", "video", "audio", "code"}
PRICES = {"Free plan + paid", "Free plan", "Paid", "Paid add-on"}
KINDS = {"Flagship", "Reasoning", "Multimodal", "Open model", "Image", "Video", "Coding", "Science", "Milestone", "Breakthrough", "Foundational"}
BANNED = [r"—", r"–", r"\bunlock", r"\bdive into\b", r"\bdelve", r"\bjourney\b", r"\blandscape\b", r"\bleverag", r"\bharness", r"\bempower",
          r"\bseamless", r"\brobust\b", r"game.?changer", r"\bcrucial", r"\brealm\b", r"\bnavigat", r"\belevat", r"in today's world",
          r"it's worth noting", r"\btruly\b", r"\bincredibl", r"\bpowerful\b", r"\brevolution", r"\bcutting.edge", r"\bstate.of.the.art",
          r"\bjust\b", r"\breally\b", r"\bhere's\b", r"\bnot just\b", r"!"]
problems = []
def bad(msg): problems.append(msg)

try:
    cat = json.load(open(os.path.join(ROOT, "catalog.json"), encoding="utf-8"))
except Exception as e:
    sys.exit(f"catalog.json is not valid JSON: {e}")
if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(cat.get("meta", {}).get("lastChecked", ""))):
    bad("meta.lastChecked must be a YYYY-MM-DD date")

def text_ok(where, s):
    if not isinstance(s, str) or not s.strip():
        bad(f"{where}: missing text"); return
    for p in BANNED:
        if re.search(p, s, re.I if p not in ("—", "–", "!") else 0):
            bad(f"{where}: avoid {p!r} in {s!r}")

for key, required in (("tools", ["id", "name", "maker", "cat", "price", "url", "desc", "bestFor", "start"]), ("models", ["id", "name", "maker", "year", "kind", "current", "desc"])):
    items = cat.get(key)
    if not isinstance(items, list) or not items:
        bad(f"{key}: list is missing or empty"); continue
    ids = [x.get("id") for x in items]
    for dup in {i for i in ids if ids.count(i) > 1}:
        bad(f"{key}: duplicate id {dup}")
    for x in items:
        w = f"{key}/{x.get('id')}"
        for f in required:
            if f not in x or x[f] in ("", None):
                bad(f"{w}: missing {f}")
        if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", str(x.get("id", ""))):
            bad(f"{w}: id must be lowercase letters, digits and hyphens")
        text_ok(w + " desc", x.get("desc"))
        if key == "tools":
            if x.get("cat") not in TOOL_CATS: bad(f"{w}: cat must be one of {sorted(TOOL_CATS)}")
            if x.get("price") not in PRICES: bad(f"{w}: price must be one of {sorted(PRICES)}")
            if not str(x.get("url", "")).startswith("https://"): bad(f"{w}: url must start with https://")
            if "addedAt" in x and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(x["addedAt"])): bad(f"{w}: addedAt must be YYYY-MM-DD")
            text_ok(w + " bestFor", x.get("bestFor")); text_ok(w + " start", x.get("start"))
            if len(str(x.get("bestFor", "")).split()) > 6: bad(f"{w}: bestFor should be 2 to 5 words")
        else:
            if x.get("kind") not in KINDS: bad(f"{w}: kind must be one of {sorted(KINDS)}")
            if not isinstance(x.get("current"), bool): bad(f"{w}: current must be true or false")
            if not isinstance(x.get("year"), int): bad(f"{w}: year must be a number")
    if key == "models":
        n = sum(1 for x in items if x.get("current") is True)
        if not 2 <= n <= 6: bad(f"models: {n} entries are marked current; keep about 2 to 5")

if problems:
    print("catalog.json has problems:"); [print(" -", p) for p in problems]; sys.exit(1)
print(f"catalog.json is OK: {len(cat['tools'])} tools, {len(cat['models'])} models, last checked {cat['meta']['lastChecked']}")

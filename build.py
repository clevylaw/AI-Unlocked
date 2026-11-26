#!/usr/bin/env python3
"""Build the AI for Legal Work website from the files in src/.

Usage:  python3 build.py

Reads   src/course.json (modules, paths, questions, glossary) and src/lessons/*.html
        (one file per lesson: a JSON block in a comment, then the lesson body).
Writes  index.html, 404.html, path/, certificate/, lessons/, modules/, tools/, models/,
        glossary/, about/ and assets/course.js. Nothing in those folders should be edited
        by hand: edit src/ and run this script again.

Recorded read-aloud audio lives in audio/ and is made by make_audio.py, which runs this
script again when it finishes. Pages only link to recordings whose text still matches.
"""
import hashlib, html, json, os, re, shutil
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
SITE_NAME = "AI for Legal Work"
SITE_URL = "https://clevylaw.github.io/AI-Unlocked/"
BASE_PATH = "/AI-Unlocked/"          # used only by 404.html, which can be served at any depth
TAGLINE = "A free course on AI for legal work, in plain English"
VOICE_ID, VOICE_NAME, TTS_MODEL = "harper_32", "Harper", "simba-3.5"
REDIRECTS = {"ai-in-everyday-life": "ai-in-legal-work", "using-generative-ai-responsibly": "copyright-and-deepfakes", "ai-for-writing": "ai-for-legal-writing", "ai-for-learning": "ai-for-law-school", "ai-and-jobs": "ai-and-legal-jobs"}
REVIEWED = "November 2026"  # shown on the home page and footer; update after each content review
GENERATED = ["path", "certificate", "lessons", "modules", "tools", "models", "glossary", "about"]

esc = lambda s: html.escape(str(s), quote=True)

# ---------------------------------------------------------------- content
def load_course():
    course = json.load(open(os.path.join(SRC, "course.json"), encoding="utf-8"))
    for m in course["modules"]:
        m["lessons"] = []
    by_id = {m["id"]: m for m in course["modules"]}
    files = sorted(f for f in os.listdir(os.path.join(SRC, "lessons")) if re.fullmatch(r"\d+-\d+\.html", f))
    for f in sorted(files, key=lambda n: tuple(int(x) for x in n[:-5].split("-"))):
        raw = open(os.path.join(SRC, "lessons", f), encoding="utf-8").read()
        m = re.match(r"\s*<!--(.*?)-->(.*)", raw, re.S)
        if not m:
            raise SystemExit(f"{f}: missing the JSON comment at the top")
        meta = json.loads(m.group(1))
        mid, num = (int(x) for x in f[:-5].split("-"))
        mod = by_id[mid]
        if num != len(mod["lessons"]) + 1:
            raise SystemExit(f"{f}: lessons must be numbered 1, 2, 3... with no gaps")
        meta.update(ref=f"{mid}-{num}", module=mod, index=num - 1, body=m.group(2).strip())
        mod["lessons"].append(meta)
    slugs = [l["slug"] for mm in course["modules"] for l in mm["lessons"]]
    assert len(slugs) == len(set(slugs)), "lesson slugs must be unique"
    for mm in course["modules"]:
        for l in mm["lessons"]:
            words = lambda h: len([w for w in re.sub(r"<[^>]+>", " ", h or "").split() if re.search(r"[A-Za-z0-9]", w)])
            l["read"] = max(1, -(-(words(l["body"]) + words(l["intro"])) // 160))  # about 160 words a minute, rounded up
            l["practice"] = (1 if l.get("quiz") else 0) + (2 if l.get("tryIt") else 0)
            l["time"] = l["read"] + l["practice"]
    return course

# ---------------------------------------------------------------- tiny DOM for reading text aloud
VOID = {"br", "img", "hr", "input", "meta", "link", "source", "wbr"}

class Node:
    def __init__(self, tag, attrs, start=None):
        self.tag, self.attrs, self.children, self.start = tag, dict(attrs), [], start
    def cls(self):
        return (self.attrs.get("class") or "").split()

class TreeBuilder(HTMLParser):
    def __init__(self, src):
        super().__init__(convert_charrefs=True)
        self.root = Node("root", {})
        self.stack = [self.root]
        self.lines = [0]
        for line in src.splitlines(keepends=True):
            self.lines.append(self.lines[-1] + len(line))
    def abs_pos(self):
        ln, col = self.getpos()
        return self.lines[ln - 1] + col
    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.abs_pos())
        self.stack[-1].children.append(n)
        if tag not in VOID:
            self.stack.append(n)
    def handle_startendtag(self, tag, attrs):
        self.stack[-1].children.append(Node(tag, attrs, self.abs_pos()))
    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                break
    def handle_data(self, data):
        self.stack[-1].children.append(data)

def parse(src):
    t = TreeBuilder(src)
    t.feed(src)
    t.close()
    return t.root

def text_of(n):
    if isinstance(n, str):
        return n
    if n.tag in ("svg", "script", "style", "sup"):
        return ""
    return "".join(text_of(c) for c in n.children)

def clean(s):
    return re.sub(r"\s+", " ", s).strip()

def sentence(s):
    s = clean(s)
    if not s:
        return ""
    return s if re.search(r"[.!?:]['\"”’)]*$", s) else s + "."

KEEP_CAPS = {"AI", "I", "ChatGPT", "Claude", "Gemini", "Google", "Microsoft", "Copilot", "Perplexity", "Meta", "OpenAI", "Anthropic", "English"}
def lower_first(s):
    """Lowercase the first word so a phrase can sit mid-sentence, unless it is a name."""
    s = clean(s)
    first = re.split(r"[\s,]", s, 1)[0]
    if first in KEEP_CAPS or re.fullmatch(r"[A-Z0-9]{2,}s?", first):
        return s
    return s[:1].lower() + s[1:]

# Labels that only decorate a box; reading them aloud sounds robotic, so they are skipped.
QUIET_LABELS = {"key idea", "example", "real examples", "common examples", "good to know", "important"}

def spoken(n):
    """What the narrator says for one top-level block of a lesson."""
    if n.attrs.get("data-say"):
        return clean(n.attrs["data-say"])
    tag, cls = n.tag, n.cls()
    kids = [c for c in n.children if isinstance(c, Node)]
    if tag in ("ul", "ol"):
        return " ".join(sentence(text_of(li)) for li in kids if li.tag == "li")
    if tag == "figure":
        svg = next((c for c in kids if c.tag == "svg"), None)
        cap = next((c for c in kids if c.tag == "figcaption"), None)
        return " ".join(x for x in [sentence(svg.attrs.get("aria-label", "")) if svg else "", sentence(text_of(cap)) if cap else ""] if x)
    if tag == "dl":
        return " ".join(sentence(" ".join(sentence(text_of(x)) for x in d.children if isinstance(x, Node))) for d in kids)
    if "table-wrap" in cls:
        def find(x, tag):
            for c in x.children:
                if isinstance(c, Node):
                    if c.tag == tag:
                        return c
                    r = find(c, tag)
                    if r:
                        return r
        tbody = find(n, "tbody")
        rows = [[clean(text_of(td)) for td in tr.children if isinstance(td, Node) and td.tag == "td"]
                for tr in (tbody.children if tbody else []) if isinstance(tr, Node) and tr.tag == "tr"]
        return " ".join(f"If you want to {lower_first(a)}, try {lower_first(b)}." for a, b in (r for r in rows if len(r) == 2))
    if tag == "div" and ("callout" in cls or "example" in cls or "compare" in cls):
        parts = []
        def walk(x):
            for c in x.children:
                if not isinstance(c, Node):
                    continue
                if c.tag == "p" and c.attrs.get("data-say"):
                    parts.append(sentence(c.attrs["data-say"]))
                    continue
                if c.tag == "p":
                    t = clean(text_of(c))
                    if "label" in c.cls() and t.lower() in QUIET_LABELS:
                        continue
                    parts.append(sentence(t))
                else:
                    walk(c)
        walk(n)
        return " ".join(parts)
    return sentence(text_of(n))

def add_read_ids(body, start_at):
    """Give every top-level block a data-r number and return (html, [spoken text])."""
    root = parse(body)
    blocks = [c for c in root.children if isinstance(c, Node)]
    out, last, texts = [], 0, []
    for i, b in enumerate(blocks):
        pos = b.start + 1 + len(b.tag)
        out.append(body[last:pos])
        out.append(f' data-r="{start_at + i}"')
        last = pos
        texts.append(spoken(b))
    out.append(body[last:])
    return "".join(out), texts

# ---------------------------------------------------------------- typography
def smart_text(t):
    """Curly quotes and apostrophes for display text (spoken text keeps straight quotes)."""
    t = re.sub(r"(\w)'(\w)", "\\1\u2019\\2", t)
    t = re.sub(r"(^|[\s(\[\u2014-])\"", "\\1\u201c", t)
    t = t.replace('"', "\u201d")
    t = re.sub(r"(^|[\s(\[])'", "\\1\u2018", t)
    return t.replace("'", "\u2019")

def smart_html(h):
    out, skip = [], 0
    for part in re.split(r"(<[^>]+>)", h):
        if part.startswith("<"):
            m = re.match(r"</?(pre|code|script|style|textarea)\b", part, re.I)
            if m:
                skip += -1 if part.startswith("</") else 1
            out.append(part)
        elif skip or not part:
            out.append(part)
        else:
            raw = part.replace("&quot;", '"').replace("&#x27;", "'").replace("&#39;", "'")
            out.append(smart_text(raw))
    return "".join(out)

def cite_html(title):
    """Source titles use *asterisks* for italic case names."""
    return re.sub(r"\*(.+?)\*", r"<em>\1</em>", esc(title))

def footnote_refs(h):
    return re.sub(r"\[\[(\d+)\]\]", lambda m: f'<sup class="ref"><a href="#src-{m.group(1)}" aria-label="Source {m.group(1)}">{m.group(1)}</a></sup>', h)

LOGO_MARK = ('<svg class="logo-mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle cx="32" cy="32" r="31" fill="#2a1030"/>'
             '<circle cx="32" cy="32" r="26" fill="none" stroke="#ffb3cd" stroke-width="2"/>'
             '<text x="32" y="41.5" text-anchor="middle" font-family="EB Garamond, Georgia, serif" font-size="25" font-weight="600" fill="#ffb3cd">AI</text></svg>')
REPO_ISSUES = "https://github.com/clevylaw/AI-Unlocked/issues/new"

def correction_url(title, url):
    import urllib.parse
    body = f"Page: {url}\n\nWhat needs correcting:\n\n\nSource for the correction, if you have one:\n"
    return REPO_ISSUES + "?" + urllib.parse.urlencode({"title": f"Correction: {title}", "body": body})

# ---------------------------------------------------------------- page template
ICONS = {
    "bulb": '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    "sparkles": '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0l1.58 6.14a2 2 0 0 0 1.44 1.44l6.14 1.58a.5.5 0 0 1 0 .96l-6.14 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/>',
    "chat": '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    "wrench": '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/>',
    "shield": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    "compass": '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
    "code": '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    "clock": '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    "copy": '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    "check": '<path d="M20 6 9 17l-5-5"/>',
    "play": '<path d="m6 3 14 9-14 9z"/>',
    "speaker": '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
    "search": '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
}
def icon(name, cls="ico"):
    return f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[name]}</svg>'

NAV = [("path", "path/", "Your path"), ("lessons", "lessons/", "Lessons"), ("tools", "tools/", "AI tools"),
       ("models", "models/", "AI models"), ("glossary", "glossary/", "Glossary"), ("about", "about/", "About")]

def page(rel, *, key, title, desc, body, data=None, head_title=None, hero=None, crumbs=None, intro=None, eyebrow=None, root=None, wide=True, show_head=True):
    """rel: the page's folder relative to the site root ('' for home, 'lessons/x/' for a lesson)."""
    if root is None:
        root = "../" * rel.count("/")
    full_title = head_title or (f"{title} · {SITE_NAME}" if key != "home" else f"{SITE_NAME} · {TAGLINE}")
    cur = ' aria-current="page"'
    nav = "".join(f'<li><a href="{root}{href}"{cur if k == key else ""}>{label}</a></li>' for k, href, label in NAV)
    logo_cur = cur if key == "home" else ""
    crumb_html = ""
    if crumbs:
        items = "".join(f'<li><a href="{root}{h}">{esc(t)}</a></li>' if h is not None else f'<li><span aria-current="page">{esc(t)}</span></li>' for t, h in crumbs)
        crumb_html = f'<nav class="crumbs" aria-label="Breadcrumb"><ol>{items}</ol></nav>'
    head_html = ""
    if hero is None and show_head:
        eb = f'<p class="eyebrow">{eyebrow}</p>' if eyebrow else ""
        it = f'<p class="page-intro">{intro}</p>' if intro else ""
        head_html = f'<header class="page-head">{eb}<h1 id="page-title" tabindex="-1">{esc(title)}</h1>{it}</header>' 
    attrs = " ".join(f'data-{k}="{esc(v)}"' for k, v in (data or {}).items())
    main = (f'{hero or ""}<main id="main" class="wrap{"" if wide else " narrow"} page">{crumb_html}{head_html}{body}</main>')
    canonical = SITE_URL + rel
    main = smart_html(main)
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(full_title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{SITE_NAME}">
<meta property="og:title" content="{esc(full_title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{SITE_URL}assets/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="AI for Legal Work: a free course on AI for legal work, in plain English">
<meta name="twitter:card" content="summary_large_image">
<link rel="apple-touch-icon" href="{root}assets/apple-touch-icon.png">
<meta name="theme-color" content="#2a1030">
<link rel="icon" href="{root}favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;0,7..72,700;1,7..72,400&family=Courier+Prime&display=swap">
<link rel="stylesheet" href="{root}assets/site.css?v={ASSET_V}">
</head>
<body data-page="{key}" data-root="{root}" {attrs}>
<a class="skip" href="#main">Skip to main content</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="logo" href="{root}"{logo_cur}>{LOGO_MARK}<span class="logo-text">AI for <span>Legal Work</span></span></a>
    <button class="menu-btn" id="menu-btn" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav class="site-nav" id="site-nav" aria-label="Main"><ul>{nav}</ul></nav>
  </div>
</header>
{main}
<footer class="site-footer">
  <div class="wrap footer-inner">
    <div>
      <a class="logo" href="{root}">{LOGO_MARK}<span class="logo-text">AI for <span>Legal Work</span></span></a>
      <p>A free course on AI for legal work, in plain English. General education, not legal advice. Content last reviewed {REVIEWED}. Your progress is saved only in this browser.</p>
      <div class="reset">
        <button class="link-btn" type="button" data-reset>Start over</button>
        <div class="reset-confirm" id="reset-confirm" hidden>
          <p>This clears your lesson progress and your learning path in this browser. Your certificates are kept. You can't undo this.</p>
          <button class="btn-secondary" type="button" id="reset-yes">Clear my progress</button>
          <button class="link-btn" type="button" id="reset-no">Cancel</button>
        </div>
        <p class="reset-done" id="reset-done" role="status" hidden>Your progress has been cleared.</p>
      </div>
    </div>
    <ul class="footer-links" aria-label="More pages">
      <li><a href="{root}lessons/">All lessons</a></li><li><a href="{root}glossary/">Glossary</a></li><li><a href="{root}about/">About this site</a></li><li><a href="{esc(correction_url(title, canonical))}" target="_blank" rel="noopener">Report a correction<span class="sr-only"> (opens GitHub in a new tab)</span></a></li>
    </ul>
  </div>
</footer>
<script src="{root}assets/course.js?v={ASSET_V}"></script>
<script src="{root}assets/app.js?v={ASSET_V}"></script>
</body>
</html>
'''

# ---------------------------------------------------------------- helpers for links inside lesson text
def resolve_links(h, root, course):
    lessons = {l["slug"]: l for m in course["modules"] for l in m["lessons"]}
    mods = {m["slug"] for m in course["modules"]}
    def rep(m):
        kind, target = m.group(1), m.group(2)
        if kind == "lesson":
            assert target in lessons, f"unknown lesson link {target}"
            return f'href="{root}lessons/{target}/"'
        if kind == "module":
            assert target in mods, f"unknown module link {target}"
            return f'href="{root}modules/{target}/"'
        assert target in dict((k, 1) for k, _, _ in NAV), f"unknown page link {target}"
        return f'href="{root}{target}/"'
    return re.sub(r'href="(lesson|module|page):([a-z0-9-]+)"', rep, h)

def mins(n):
    return f"{n} minute{'s' if n != 1 else ''}"

def write(rel_file, text):
    path = os.path.join(ROOT, rel_file)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)

def audio_manifest():
    p = os.path.join(ROOT, "audio", "manifest.json")
    return json.load(open(p)) if os.path.exists(p) else {"files": {}}

def tts_hash(text):
    return hashlib.sha1(f"{VOICE_ID}|{TTS_MODEL}|{text}".encode()).hexdigest()[:10]

# ---------------------------------------------------------------- lesson pages
def lesson_page(course, l, flat, manifest):
    m = l["module"]
    k = flat.index(l)
    prev_l, next_l = (flat[k - 1] if k else None), (flat[k + 1] if k + 1 < len(flat) else None)
    rel = f"lessons/{l['slug']}/"
    root = "../../"
    body, texts = add_read_ids(footnote_refs(resolve_links(l["body"], root, course)), 2)
    blocks = [{"t": sentence(l["title"])}, {"t": sentence(l["intro"])}] + [{"t": t} for t in texts]
    tech_html = try_html = quiz_html = ""
    if l.get("tech"):
        n = len(blocks)
        blocks.append({"t": "A note for technical readers. " + clean(re.sub(r"<[^>]+>", "", html.unescape(l["tech"]))), "tech": 1})
        tech_html = (f'<details class="tech-note" data-r="{n}" id="tech-note"><summary>{icon("code", "ico-sm")} For technical readers '
                     f'<span>(optional)</span></summary><p>{resolve_links(l["tech"], root, course)}</p></details>')
    if l.get("tryIt"):
        n, t = len(blocks), l["tryIt"]
        blocks.append({"t": f"Try it yourself. Open {lower_first(t['tool'])}, and paste in this prompt. {t['prompt']}"})
        try_html = (f'<section class="try-it" data-r="{n}" aria-labelledby="try-h"><h2 id="try-h">{icon("play", "ico-sm")} Try it yourself</h2>'
                    f'<p class="try-tool">Open <strong>{esc(t["tool"])}</strong> and paste in this prompt.</p>'
                    f'<div class="try-prompt"><p id="try-text">{esc(t["prompt"])}</p>'
                    f'<button class="copy-btn" type="button" data-copy="#try-text">{icon("copy", "ico-sm")}<span>Copy the prompt</span></button></div>'
                    f'<p class="try-note">The <a href="{root}tools/">AI tools page</a> links to each app. Most have a free plan.</p></section>')
    if l.get("quiz"):
        n, q = len(blocks), l["quiz"]
        opts = q["opts"]
        said = " ".join(sentence(o) for o in opts[:-1]) + f" Or, {sentence(lower_first(opts[-1]))}"
        blocks.append({"t": f"Check what you learned. {sentence(q['q'])} The choices are: {said}"})
        quiz_html = (f'<section class="quiz-block" data-r="{n}" data-correct="{q["correct"]}" aria-labelledby="quiz-h">'
                     f'<p class="label">Check what you learned</p><h2 id="quiz-h">{esc(q["q"])}</h2><div class="quiz-options">'
                     + "".join(f'<button class="quiz-opt" type="button" data-opt="{i}"><span class="opt-letter" aria-hidden="true">{chr(65 + i)}</span><span>{esc(o)}</span></button>' for i, o in enumerate(opts))
                     + f'</div><p class="quiz-feedback" role="status" aria-live="polite" data-feedback="{esc(q["feedback"])}"></p>'
                     + f'<p class="print-only quiz-answer">Answer: {chr(65 + q["correct"])}. {esc(q["feedback"])}</p></section>')
    sources_html = ""
    if l.get("sources"):
        sources_html = ('<section class="sources" aria-labelledby="src-h"><h2 id="src-h">Sources</h2><ol>'
                        + "".join(f'<li id="src-{i}">{cite_html(x["title"])}. <a href="{esc(x["url"])}" target="_blank" rel="noopener">Open source<span class="sr-only"> {i} (opens in a new tab)</span></a></li>' for i, x in enumerate(l["sources"], 1))
                        + '</ol><p class="muted">Links go to other websites. Some may need a subscription. Check the original documents before relying on them.</p></section>')
    # Link recordings whose text still matches what the page says.
    have = manifest.get("files", {})
    for i, b in enumerate(blocks):
        name = f"{l['slug']}/{i}-{tts_hash(b['t'])}.mp3"
        if name in have and os.path.exists(os.path.join(ROOT, "audio", name)):
            b["a"] = f"{root}audio/{name}"
    read_json = json.dumps({"blocks": blocks, "voiceName": VOICE_NAME}, ensure_ascii=False).replace("</", "<\\/")
    nxt = next_l
    after = f"{root}lessons/{nxt['slug']}/" if nxt and nxt["module"] is m else f"{root}modules/{m['slug']}/review/"
    after_label = "Done, next lesson" if nxt and nxt["module"] is m else "Done, review this module"
    pager = ""
    if prev_l:
        pager += f'<a class="prev" href="{root}lessons/{prev_l["slug"]}/" data-pager="prev"><span class="pager-dir">← Previous lesson</span><strong>{esc(prev_l["title"])}</strong></a>'
    if next_l:
        pager += f'<a class="next" href="{root}lessons/{next_l["slug"]}/" data-pager="next"><span class="pager-dir">Next lesson →</span><strong>{esc(next_l["title"])}</strong></a>'
    content = f'''
<p class="print-only print-head">{SITE_NAME} · {SITE_URL}{rel} · Content last reviewed {REVIEWED}</p>
<header class="page-head lesson-head"><p class="eyebrow">Module {m["id"]} · Lesson {l["index"] + 1} of {len(m["lessons"])}</p><h1 id="page-title" tabindex="-1" data-r="0">{esc(l["title"])}</h1><p class="page-intro" data-r="1">{esc(l["intro"])}</p></header>
<div class="lesson-bar"><div class="listen" id="listen" hidden></div><span class="lesson-time-note">{icon("clock", "ico-sm")} {l["read"]} min read · {l["practice"]} min practice</span></div>
<p class="path-strip" id="path-strip"></p>
<script type="application/json" id="read-data">{read_json}</script>
<article class="lesson-body">{body}</article>
{tech_html}
{try_html}
{quiz_html}
{sources_html}
<p class="lesson-tools"><button class="link-btn" type="button" data-print>Print this lesson or save it as a PDF</button> · <a href="{esc(correction_url(l["title"], SITE_URL + rel))}" target="_blank" rel="noopener">Report a correction<span class="sr-only"> (opens GitHub in a new tab)</span></a></p>
<div class="lesson-end">
  <p class="done-note" id="done-note" hidden>{icon("check", "ico-sm")} You finished this lesson.</p>
  <a class="btn-main" id="done-btn" href="{after}">{after_label} →</a>
  <nav class="pager" aria-label="Lessons">{pager}</nav>
</div>'''
    desc = f"{l['intro']} A short, free lesson from {SITE_NAME}."
    return rel, page(rel, key="lessons", title=l["title"], desc=desc, body=content, wide=False, show_head=False,
                     data={"ref": l["ref"]},
                     crumbs=[("Home", ""), ("Lessons", "lessons/"), (f"Module {m['id']}: {m['title']}", f"modules/{m['slug']}/"), (l["title"], None)],
                     )

# ---------------------------------------------------------------- other pages
def lesson_list(m, root, compact=False):
    return f'<ol class="lesson-links{" compact" if compact else ""}">' + "".join(
        f'<li><a class="lesson-link" href="{root}lessons/{l["slug"]}/" data-lesson-ref="{l["ref"]}">'
        f'<span class="lesson-num">{l["index"] + 1}</span><span class="lesson-info"><strong>{esc(l["title"])}</strong><span>{esc(l["intro"])}</span></span>'
        f'<span class="lesson-time">{l["time"]} min</span></a></li>' for l in m["lessons"]) + "</ol>"

def module_card(m, root, heading="h2"):
    total = sum(l["time"] for l in m["lessons"])
    return (f'<article class="card module-card c-{m["color"]}" data-module="{m["id"]}">'
            f'<div class="module-top"><span class="module-numeral" aria-hidden="true">{m["id"]}</span><span class="module-num"><span class="sr-only">Module {m["id"]}, </span><span class="level">{esc(m["level"])}</span></span>'
            f'<span class="done-pill" hidden>{icon("check", "ico-sm")} Done</span></div>'
            f'<{heading}><a href="{root}modules/{m["slug"]}/">{esc(m["title"])}</a></{heading}><p>{esc(m["desc"])}</p>'
            f'<div class="bar" aria-hidden="true"><span></span></div>'
            f'<p class="meta">{icon("clock", "ico-sm")} {len(m["lessons"])} lessons, about {total} minutes <span class="module-progress"></span></p>'
            f'{lesson_list(m, root, compact=True)}</article>')

def build_pages(course):
    flat = [l for m in course["modules"] for l in m["lessons"]]
    manifest = audio_manifest()
    total_lessons = len(flat)
    avg = round(sum(l["time"] for l in flat) / total_lessons)
    out = {}

    # Home
    hero = f'''<section class="hero" aria-labelledby="page-title"><div class="wrap hero-inner">
<p class="eyebrow">Free course · No account needed</p>
<h1 id="page-title" tabindex="-1">Learn to use AI well in legal work</h1>
<p class="hero-lead">Short lessons in plain English for law students, lawyers, paralegals and anyone who works in law. You don't need any technical skills.</p>
<div id="home-action"><a class="btn-hero" href="path/">Start the course →</a></div>
<p class="hero-sub" id="home-sub">Or go straight to <a href="lessons/{flat[0]["slug"]}/">the first lesson</a>.</p>
</div></section>'''
    body = f'''<div class="home-grid">
<section class="card" aria-labelledby="who-h"><h2 id="who-h">Who it's for</h2>
<p>Law students, lawyers, paralegals, legal staff and legal technologists. Maybe you have never used a chatbot. Maybe you use one every day and want to use it safely with client work. The lessons start simple, use real legal examples and build up to your professional duties.</p></section>
<section class="card" aria-labelledby="how-h"><h2 id="how-h">How it works</h2><ol class="steps-list">
<li><strong>Answer 4 short questions</strong>We suggest the lessons that fit you, in order.</li>
<li><strong>Read or listen to each lesson</strong>Each one takes about {avg} minutes.</li>
<li><strong>Try it, then check yourself</strong>Try the idea in a real AI tool, then answer one question.</li>
</ol></section>
</div>
<section class="section" aria-labelledby="learn-h"><h2 id="learn-h">What you'll learn</h2>
<ol class="module-toc">{"".join(f'<li><a href="modules/{m["slug"]}/"><span class="toc-num">{m["id"]}</span><span class="toc-text"><strong>{esc(m["title"])}</strong><span>{esc(m["desc"])}</span></span></a></li>' for m in course["modules"])}</ol></section>
<section class="section sources-strip" aria-labelledby="src-h"><h2 id="src-h">Built on primary sources</h2>
<p class="section-intro">Lessons cite the documents lawyers rely on, and each lesson lists its sources. Examples include:</p>
<ul class="cite-list">
<li>ABA Comm. on Ethics &amp; Pro. Resp., Formal Op. 512, <em>Generative Artificial Intelligence Tools</em> (2024)</li>
<li><em>Mata v. Avianca, Inc.</em>, 678 F. Supp. 3d 443 (S.D.N.Y. 2023)</li>
<li><em>United States v. Heppner</em>, No. 25-cr-503 (S.D.N.Y. Feb. 17, 2026)</li>
<li>N.D. Tex. Local Civil Rule 7.2(f), disclosure of generative AI use</li>
<li>Regulation (EU) 2024/1689, the Artificial Intelligence Act</li>
</ul>
<p class="muted">Content last reviewed {REVIEWED}. General education, not legal advice.</p></section>'''
    out[""] = page("", key="home", title=SITE_NAME, hero=hero, body=body,
                   desc=f"{TAGLINE}. {total_lessons} short lessons with real legal examples, covering ethics duties, confidentiality, fake citations and legal AI tools. Free, with no account.")

    # Your path
    body = '''<div class="panel" id="path-box" aria-live="polite"><noscript><p>This page needs JavaScript to suggest a path. You can still read every lesson from the <a href="../lessons/">Lessons</a> page.</p></noscript></div>'''
    out["path/"] = page("path/", key="path", title="Your path", body=body,
                        intro="Answer 4 short questions. We'll choose the lessons that fit you and put them in order.",
                        desc="Answer 4 short questions and get a list of AI lessons that fits your experience and goals.")

    # Certificate
    body = '''<div id="cert-box"><noscript><p>This page needs JavaScript to show your certificate.</p></noscript></div>'''
    out["certificate/"] = page("certificate/", key="path", title="Your certificate", body=body, wide=False,
                               crumbs=[("Home", ""), ("Your path", "path/"), ("Certificate", None)],
                               intro="Type your name as you want it to appear, then save the certificate as a picture.",
                               desc=f"View and save your {SITE_NAME} certificate.")

    # Lessons map
    root = "../"
    body = (f'<div class="actions" id="lessons-action" style="margin-bottom:28px"></div>'
            f'<div class="modules-grid">{"".join(module_card(m, root) for m in course["modules"])}</div>')
    out["lessons/"] = page("lessons/", key="lessons", title="Lessons", body=body,
                           intro=f"{total_lessons} lessons in {len(course['modules'])} modules. Modules 1 to 6 build on each other. Module 7 is for technical readers. Modules 8 and 9 cover professional duties, legal tools and AI law.",
                           desc=f"All {total_lessons} lessons of {SITE_NAME}, a free course on AI for legal work, in plain English.")

    # Modules and reviews
    root = "../../"
    mods = course["modules"]
    for i, m in enumerate(mods):
        total = sum(l["time"] for l in m["lessons"])
        nav = ""
        if i:
            nav += f'<a class="prev" href="{root}modules/{mods[i-1]["slug"]}/"><span class="pager-dir">← Previous module</span><strong>{esc(mods[i-1]["title"])}</strong></a>'
        if i + 1 < len(mods):
            nav += f'<a class="next" href="{root}modules/{mods[i+1]["slug"]}/"><span class="pager-dir">Next module →</span><strong>{esc(mods[i+1]["title"])}</strong></a>'
        body = f'''<p class="meta c-{m["color"]}" style="margin-bottom:18px">{icon("clock", "ico-sm")} {len(m["lessons"])} lessons, about {total} minutes <span class="module-progress" data-module-progress="{m["id"]}"></span></p>
<div class="actions" style="margin-bottom:28px"><a class="btn-main" id="module-action" data-module="{m["id"]}" href="{root}lessons/{m["lessons"][0]["slug"]}/">Start this module →</a></div>
<section class="c-{m["color"]}" aria-labelledby="ml-h"><h2 id="ml-h" class="sr-only">Lessons in this module</h2>{lesson_list(m, root)}</section>
<p style="margin-top:22px"><a href="{root}modules/{m["slug"]}/review/">Recap and review quiz for this module</a></p>
<nav class="pager" aria-label="Modules" style="margin-top:36px">{nav}</nav>'''
        out[f"modules/{m['slug']}/"] = page(f"modules/{m['slug']}/", key="lessons", title=m["title"], body=body, wide=False,
                                            eyebrow=f"Module {m['id']} · {esc(m['level'])}", intro=esc(m["desc"]),
                                            crumbs=[("Home", ""), ("Lessons", "lessons/"), (f"Module {m['id']}", None)],
                                            desc=f"Module {m['id']} of {SITE_NAME}: {m['desc']}")
        root3 = "../../../"
        nxt = mods[i + 1] if i + 1 < len(mods) else None
        quizzes = "".join(
            f'<section class="quiz-block" data-correct="{l["quiz"]["correct"]}" data-shuffle aria-labelledby="rq{j}"><p class="label">Question {j + 1} of {len(m["lessons"])}</p><h3 id="rq{j}">{esc(l["quiz"]["q"])}</h3><div class="quiz-options">'
            + "".join(f'<button class="quiz-opt" type="button" data-opt="{k}"><span class="opt-letter" aria-hidden="true">{chr(65 + k)}</span><span>{esc(o)}</span></button>' for k, o in enumerate(l["quiz"]["opts"]))
            + f'</div><p class="quiz-feedback" role="status" aria-live="polite" data-feedback="{esc(l["quiz"]["feedback"])}"></p></section>'
            for j, l in enumerate(m["lessons"]))
        action = (f'<a class="btn-main" href="{root3}modules/{nxt["slug"]}/">{"Extra module" if nxt["level"] == "Technical" else "Next module"}: {esc(nxt["title"])} →</a>'
                  if nxt else f'<a class="btn-main" href="{root3}path/">Back to your path →</a>')
        body = f'''<section aria-labelledby="recap-h"><h2 id="recap-h" class="sr-only">What you learned</h2><ul class="recap">{"".join(f"<li>{esc(r)}</li>" for r in m["recap"])}</ul></section>
<section class="review" data-review aria-labelledby="quiz-h"><h2 id="quiz-h" style="font-size:1.5rem">Review quiz</h2>
<p class="muted" style="margin:6px 0 4px">These are the questions from each lesson, with the answers in a new order.</p>{quizzes}
<p class="review-score" role="status" aria-live="polite"></p></section>
<div class="lesson-end">{action}<nav class="pager" aria-label="Lessons"><a class="prev" href="{root3}lessons/{m["lessons"][-1]["slug"]}/"><span class="pager-dir">← Last lesson</span><strong>{esc(m["lessons"][-1]["title"])}</strong></a></nav></div>'''
        out[f"modules/{m['slug']}/review/"] = page(f"modules/{m['slug']}/review/", key="lessons", title=f"Review: {m['title']}", body=body, wide=False,
                                                   data={"module": m["id"]}, eyebrow=f"Module {m['id']} review",
                                                   intro="A short recap of the module, then one question from each lesson. Answering again later helps you remember.",
                                                   crumbs=[("Home", ""), ("Lessons", "lessons/"), (f"Module {m['id']}", f"modules/{m['slug']}/"), ("Review", None)],
                                                   desc=f"Recap and review quiz for module {m['id']} of {SITE_NAME}: {m['title']}.")

    # Lessons
    for l in flat:
        rel, text = lesson_page(course, l, flat, manifest)
        out[rel] = text

    # Tools
    body = '''<div class="filters" id="tools-filter" role="group" aria-label="Show tools of one kind"></div>
<div class="tools-list" id="tools-grid"><p class="empty">Loading the list of tools…</p></div>'''
    out["tools/"] = page("tools/", key="tools", title="AI tools", body=body,
                         intro='AI tools built for legal work, plus popular general tools. Each one shows what it is good for, what it costs and something to try first. A listing is not a recommendation. Use only tools your employer or school has approved for client or graded work. <span class="status-pill catalog-status"></span>',
                         desc="A plain-English guide to legal AI tools and popular general AI tools: what each is good for, what it costs and a first thing to try. Checked every week.")
    body = '''<div id="models-timeline"><p class="empty">Loading the list of models…</p></div>'''
    out["models/"] = page("models/", key="models", title="AI models", body=body,
                          intro=f'A model is the AI system inside an app. These are the models that shaped AI, from 2017 to today. The lesson <a href="../lessons/choosing-an-ai-model/">Choosing an AI model</a> explains how they differ. <span class="status-pill catalog-status"></span>',
                          desc="A timeline of the AI models that shaped AI, from 2017 to today, explained in plain English. Checked every week.")

    # Glossary
    terms = sorted(course["glossary"], key=lambda g: g["term"].lower())
    items = "".join(f'<div class="card glossary-item"><dt>{esc(g["term"])}</dt><dd>{esc(g["def"])}</dd></div>' for g in terms)
    body = f'''<div class="search">{icon("search", "ico-sm")}<label class="sr-only" for="glossary-search">Search the glossary</label><input type="search" id="glossary-search" placeholder="Search, for example: prompt" autocomplete="off"></div>
<p class="muted" id="glossary-count" role="status">{len(terms)} terms</p>
<dl class="glossary-grid" id="glossary-grid">{items}</dl>
<p class="empty" id="glossary-empty" hidden>No terms match. Try a shorter word.</p>'''
    out["glossary/"] = page("glossary/", key="glossary", title="Glossary", body=body,
                            intro="Every AI word used in this course, explained simply.",
                            desc=f"Plain-English meanings of {len(terms)} AI words, from AI agent to token.")

    # About
    body = f'''<div class="prose">
<h2>What this site is</h2>
<p>{SITE_NAME} is a free course about artificial intelligence for legal work. It is for law students, lawyers, paralegals, legal staff and legal technologists. It has {total_lessons} short lessons in {len(course["modules"])} modules, with real legal examples such as court sanctions for fake AI citations and the American Bar Association's ethics opinion on AI. Each lesson has a prompt to try in a real AI tool and one question to check what you learned. There is no account, no fee and no advertising.</p>
<p>You can follow one of 4 learning paths, or read the lessons in any order. A short placement check lets you skip lessons you already know. When you finish a path, or the whole course, you can save a certificate.</p>
<h2>How it stays up to date</h2>
<p>Every week, the lists on the <a href="../tools/">AI tools</a> and <a href="../models/">AI models</a> pages are checked for new releases and changes. Each change has to be confirmed by the company's own announcement or by two trusted news sites. The "last checked" date on those pages shows when the last check happened. <span class="status-pill catalog-status"></span></p>
<p>The weekly check also flags lessons that may be out of date, so they can be fixed.</p>
<h2>Your progress stays in your browser</h2>
<p>Your progress, your learning path, your certificates and your read-aloud settings are saved in this browser, on this device. They are not sent to anyone. If you clear your browser data, or use another device or browser, your progress will not be there.</p>
<p>To clear your progress yourself, use <strong>Start over</strong> at the bottom of any page.</p>
<p>The fonts on this site come from Google Fonts, so your browser asks Google's servers for them. Links to AI tools take you to other companies' websites, which have their own privacy rules.</p>
<h2>Listening to lessons</h2>
<p>Every lesson has a Listen button. The recorded voice ({VOICE_NAME}) was made with Speechify, a text-to-speech service. You can also choose one of the voices built into your device. Voices with names like Natural, Neural, Premium, Enhanced or Siri usually sound the most human.</p>
<h2>Not legal advice</h2>
<p>The lessons are general education. They are not legal advice, and they do not create a lawyer-client relationship. Most examples come from the United States. Ethics rules, court rules and AI laws differ by country, state and court, and they change often. Check the current rules that apply to you.</p>
<p>Completing the course does not earn continuing legal education (CLE) credit.</p>
<h2>Corrections</h2>
<p>If you spot a mistake or an out-of-date rule, use <strong>Report a correction</strong> at the end of any lesson or at the bottom of any page. It opens a short form on GitHub, which needs a free GitHub account. Please include a source if you have one.</p>
<h2>Sources</h2>
<p>Lessons that describe court cases, ethics opinions, laws or studies end with a list of sources. Some sources need a subscription. Check the original documents before relying on them.</p>
</div>'''
    out["about/"] = page("about/", key="about", title="About this site", body=body, wide=False,
                         intro=f"What {SITE_NAME} is, how it stays up to date, and what happens to your progress.",
                         desc=f"What {SITE_NAME} is, how its lists of AI tools and models are kept up to date, and how your progress stays in your browser.")

    # 404 (served for any missing address, so it uses absolute links)
    body = f'<p class="page-intro" style="margin-bottom:22px">The address may be mistyped, or the page may have moved.</p><div class="actions"><a class="btn-main" href="{BASE_PATH}lessons/">See all lessons →</a><a class="btn-secondary" href="{BASE_PATH}">Go to the home page</a></div>'
    out["404"] = page("404", key="none", title="Page not found", body=body, root=BASE_PATH, desc="This page could not be found.")
    return out

def _smart_data(x):
    if isinstance(x, str): return smart_text(x)
    if isinstance(x, list): return [_smart_data(v) for v in x]
    if isinstance(x, dict): return {k: (v if k in ("slug", "id", "color", "steps", "correct", "minutes") else _smart_data(v)) for k, v in x.items()}
    return x

def course_js(course):
    data = {
        "modules": [{"id": m["id"], "slug": m["slug"], "title": m["title"], "color": m["color"], "level": m["level"],
                     "lessons": [{"slug": l["slug"], "title": l["title"], "time": l["time"], "quiz": l["quiz"]} for l in m["lessons"]]}
                    for m in course["modules"]],
        "paths": course["paths"], "questions": course["questions"],
    }
    data = _smart_data(data)
    return "window.COURSE = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"

def asset_version():
    h = hashlib.sha1()
    for f in ("assets/site.css", "assets/app.js"):
        p = os.path.join(ROOT, f)
        if os.path.exists(p):
            h.update(open(p, "rb").read())
    h.update(open(os.path.join(SRC, "course.json"), "rb").read())
    return h.hexdigest()[:8]

def main():
    global ASSET_V
    course = load_course()
    for d in GENERATED:
        shutil.rmtree(os.path.join(ROOT, d), ignore_errors=True)
    write("assets/course.js", course_js(course))
    ASSET_V = asset_version()
    pages = build_pages(course)
    for rel, text in pages.items():
        write("404.html" if rel == "404" else rel + "index.html", text)
    # Lesson addresses that changed when the course was refocused on legal work. Old links keep working.
    for old, new in REDIRECTS.items():
        write(f"lessons/{old}/index.html", f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>This lesson has moved</title>
<meta name="robots" content="noindex"><link rel="canonical" href="{SITE_URL}lessons/{new}/">
<meta http-equiv="refresh" content="0; url=../{new}/"><script>location.replace("../{new}/" + location.hash)</script></head>
<body><p>This lesson has moved to <a href="../{new}/">a new address</a>.</p></body></html>
''')
    flat = [l for m in course["modules"] for l in m["lessons"]]
    print(f"built {len(pages)} pages: {len(flat)} lessons, {len(course['modules'])} modules")
    return course

ASSET_V = "0"
if __name__ == "__main__":
    main()

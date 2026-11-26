# AI for Legal Work

A free course on AI for legal work, in plain English. The site was called AI Unlocked until November 2026, and its address is unchanged: https://clevylaw.github.io/AI-Unlocked/

## How the site is made

Every page is generated. Edit the files in `src/`, then run the build.

| What | Where |
|---|---|
| Lesson text, Try-it prompt, quiz, technical note | `src/lessons/<module>-<lesson>.html` (JSON at the top, lesson body below) |
| Module names, recaps, paths, questions, glossary | `src/course.json` |
| Page template and all page text outside lessons | `build.py` |
| Look and layout | `assets/site.css` |
| Progress, paths, quizzes, read-aloud, certificates | `assets/app.js` |
| AI tools and AI models lists | `catalog.json` (updated every Monday by a scheduled task) |
| Recorded read-aloud audio | `audio/` (made by `make_audio.py`) |

```bash
python3 build.py
```

After changing lesson text, record the changed parts again. Only blocks whose words changed are recorded. The Speechify API key is read from `SPEECHIFY_API_KEY` or `~/.config/ai-unlocked/speechify_api_key`, never from this repository.

```bash
python3 make_audio.py
```

Saved progress uses the same browser storage keys as the first version of the site, so learners keep their progress.

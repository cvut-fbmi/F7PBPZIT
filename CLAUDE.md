# CLAUDE.md – F7PBPZIT (Základy informačních technologií)

Course website for **F7PBPZIT – Základy informačních technologií**, FBMI ČVUT (Kladno), bachelor programme **Bezpečnost a ochrana obyvatelstva (BOO)**, winter semester 2026/2027. Teacher: Ing. Marek Sokol. Students only ever see the published site, never the repo.

## Hard rules

1. **Everything student-facing is in Czech**, written like a human teacher talks: short sentences, tykání, concrete examples, a bit of humour. Use Czech quotes „“ and proper diacritics. Gender-inclusive verb forms where needed (`udělal/a`, `přihlášen/a`).
2. **No dashes as sentence separators** (no em dash, no spaced en dash in prose). Use a comma, colon, full stop or parentheses instead. The en dash stays only in numeric ranges (3–4, 21.–28.) and in fixed names (Mostkov–Podlesí). Avoid other AI-sounding tics: „Nejde o X. Jde o Y.“ constructions, triple punchlines in every paragraph, „právě proto“, „a to je záměr“, exhaustive bullet lists where two sentences would do.
3. **Keep pages light.** A lecture page tells a story and gives a step-by-step guide; it is not a textbook. Roughly 8 chapters, one idea per chapter, most text in steps and short paragraphs. The practical work happens in the downloaded package, not in on-page quizzes. Animations and GIFs are there to carry the story, not to test.
4. **Never commit private material.** `docs/`, `plans/`, `teacher/` are gitignored. Answer keys, rubrics, unreleased tests, teacher notes, the scenario bible, generator scripts → `teacher/`. Teacher lecture plans → `plans/lectures/`. Slide plans → `plans/slides/`. Before any commit run `git status` and confirm none of these appear.
5. **All exercise data is synthetic.** Fictional names, `+420 000 …` phone numbers, `.example` domains, an explicit disclaimer in every dataset. No real people, no real internal information, no credentials.
6. **Microsoft Copilot (school account) is the default AI tool**; Copilot Studio is shown conceptually and used later. Never state specific tenant capabilities as facts; write „závisí na aktuálním nastavení ČVUT“.
7. **No build step, no dependencies.** Plain HTML/CSS/JS, GitHub Pages from the root of `main` (`.nojekyll` present).

## Repository layout

```
index.html                      landing (next lecture, timeline, rules, FAQ)
lectures/index.html             list of lectures
lectures/<NN-slug>/index.html   one page per lecture
harmonogram.html · nastroje.html · pravidla-ai.html · hodnoceni.html · 404.html
materials/<NN>/                 student downloads (zip + individual files)
slides/<NN-slug>.html|.pdf      finished slide decks (teacher generates them with Claude Design from plans/slides/)
assets/css/main.css             design system (tokens on :root, dark mode via data-theme + prefers-color-scheme)
assets/js/course-data.js        THE single source of truth for schedule, groups, lecture list/status, teacher e-mail
assets/js/main.js               theme, nav, group picker, schedule rendering, lecture TOC + progress, scroll reveal, Czech nbsp, copy buttons, optional-link check
assets/js/zit.js                story components (custom elements, see below)
.claude/launch.json             local preview server (python -m http.server 8765)
--- private (gitignored) ---
docs/                           field info, harmonogram source
plans/lectures/                 teaching plans (EN original from the teacher + CZ final per lecture)
plans/slides/                   slide plans for Claude Design
teacher/<NN>/                   scenar-bible.md, klic-reseni.md, checklist.md, build-package.py, package-src/
```

Every page sets `<html lang="cs" data-root="...">` with the relative path to the site root. All links are relative, so the site works at `http://localhost:8765/` and at `https://cvut-fbmi.github.io/F7PBPZIT/`. Only `404.html` uses absolute paths. Header and footer are copied verbatim into every page; when changing nav, update all pages (`grep -l "site-nav"`).

## Schedule, groups, submission

Edit only `assets/js/course-data.js`. Each lecture: `n`, `slug`, `status` (`published` | `soon`), `title`, `subtitle`, `dates` per group (ISO), `tags`, optional `checkpoint` / `final`. Groups: par. 1 Monday 14:00 KL:B-435, par. 3 Monday 12:00 KL:B-520 and par. 2 Monday 14:00 KL:B-435 one week later. Each lecture = 2 teaching hours = **90 minutes**; plans must be timed to 90, not 110.

**Submission is by e-mail** to the teacher (address from `course-data.js`, rendered by `[data-zit=email]`): subject `ZIT C<N>: Příjmení Jméno (par. X)`, one ZIP named `RRRR-MM-DD_zit-c<N>_prijmeni-jmeno.zip`, exit-ticket answers in the e-mail body, deadline end of the lecture day. The `<zit-exit-ticket>` element builds the mailto link. Keep this consistent on `hodnoceni.html` and in every lecture's last chapter and in the package's `zadani.pdf` / `CTI_ME.txt`.

## Story components (`assets/js/zit.js`)

Config is a `<script type="application/json">` inside the element unless noted.

| Element | Purpose | Config |
|---|---|---|
| `<zit-done key="lN-bX" label="…">` | „Hotovo“ checkbox (localStorage), drives progress bar + TOC ticks. One per `.block`. | attrs |
| `<zit-reveal label="…">…</zit-reveal>` | hidden content on click | light DOM |
| `<zit-gif gif="<giphy id>" caption="…">` | lazy GIPHY iframe with caption and source link. Pick GIFs by opening `https://giphy.com/search/…` in the browser and verifying the media URL; max ~5 per lecture, always relevant to the point being made. | attrs |
| `<zit-folder-story>` | chaotic files jitter, button „Ukliď to“ animates them into folders (FLIP) | `{folders:[…], files:[{n, ext, f:<folder index>}], before, after}` |
| `<zit-typewriter>` | types a bad file name, then the good one, loops when visible | `{pairs:[[bad, good], …]}` |
| `<zit-sync-story>` | narrated autoplay: edit → sync → delete → sync deletes → restore from backup | none |
| `<zit-ai-reveal>` | AI answer types itself out, button stamps the unsupported parts and lists why | `{prompt, after, sentences:[{t, bad?, label?, why?}]}` |
| `<zit-prompt-builder key="…">` | 6 fields → prompt, copy, Copilot link | `{prefill?, fields:[{k, hint, ph}], example:[6 strings]}` |
| `<zit-exit-ticket key="lN">` | name + group + questions → mailto to the teacher, copy fallback | `{subject:"ZIT C1: {name} (par. {group})", footer, questions:[…]}` |

Lecture page anatomy: `.lecture-head` (badges, h1, `.sub`, `[data-zit=lecture-meta]`, `.lecture-actions` with ZIP / zadání / slides via `data-check="../../slides/<slug>.html" data-missing="Slidy doplníme"` / slides PDF via `data-check` + `hidden` / tahák) → `.lecture-layout` = `<aside class="lecture-toc">` + content of `<section class="block" id="bN">` (`.block-head` with `.bn`, h2, `.bt` minutes; content; `.block-foot` with `<zit-done>`). `.side-by-side` puts a component next to a GIF. `<body data-lecture="N">` enables meta chips and prev/next nav. Load `main.js` then `zit.js` at the end of body. `main.js` adds `html.js` and reveals `.block` / `.reveal` on scroll.

## Adding a lecture

1. Read the teacher's EN plan in `plans/lectures/` and `docs/`. Write `plans/lectures/<NN>-<slug>-plan-cz.md`: review table (what changed and why) + 90-minute timing table that references the page chapters.
2. Write `teacher/<NN>/scenar-bible.md` first (every fact, name, number). Generate downloads with a deterministic `teacher/<NN>/build-package.py` → `materials/<NN>/`. Python: system Python has python-docx, openpyxl, Pillow, pypdf; reportlab is in the venv `%TEMP%\claude\zitvenv` (or `uv venv` + `uv pip install reportlab python-docx openpyxl pillow pypdf`). Fonts with Czech glyphs: `C:/Windows/Fonts/calibri.ttf`, `arial.ttf`. Realistic in-scenario documents may use dashes like real Czech officials do; instructional texts follow rule 2.
3. Build `lectures/<NN-slug>/index.html` from lecture 1 as the template: scenario chapter with a `.story-line`, one animated „problem“ component, steps for each task, last chapter = submission + exit ticket + tahák + „Příště“.
4. Write `plans/slides/<NN-slug>-slides.md`. The teacher generates the deck and drops `slides/<NN-slug>.html` (and `.pdf`) in; the page links them automatically.
5. Write `teacher/<NN>/klic-reseni.md` and `checklist.md`.
6. Set `status: "published"`, preview (`site` launch config or `python -m http.server 8765`), check console, mobile width, then a Czech proofreading pass with rule 2 in mind.

## Style

- Tokens on `:root` in `main.css`; use `var(--…)`. Accent orange `#f28c1e`, brand navy `#16324f`. Fonts Inter / Space Grotesk / JetBrains Mono via Google Fonts with system fallbacks.
- Tone „operační středisko“: badges (Podloženo / Nepodloženo / Ověřit), numbered chapters, scenario framing.
- Callouts `.callout-info|warn|danger|ok|task`.
- Progress and inputs live only in localStorage; the site has no backend.

## Course pedagogy (keep consistent)

- Mental model: **přijmi → utřiď → posuď → zvol nástroj → použij AI → ověř → teprve pak použij/sdílej.** Three rules: **Utřiď. Posuď. Ověř.**
- Prompt framework: **KONTEXT → ÚKOL → VSTUP → OMEZENÍ → FORMÁT → KONTROLA.**
- Information categories: **VEŘEJNÉ / INTERNÍ / OSOBNÍ ÚDAJE / CITLIVÉ**; five questions before uploading.
- Audit classifications: Podloženo / Nepodloženo / Nesprávné / Nejednoznačné / Ověřit. Grade the verification process, never similarity to the teacher's AI output.
- Lecture 3 has a checkpoint; lecture 7 the final crisis micro-simulation. Assessment on `hodnoceni.html` is a draft until the teacher confirms it.

## Deployment

GitHub Pages: Settings → Pages → „Deploy from a branch“ → `main` / `/ (root)`, or:

```bash
gh api -X POST repos/cvut-fbmi/F7PBPZIT/pages -f "source[branch]=main" -f "source[path]=/"
```

Site: https://cvut-fbmi.github.io/F7PBPZIT/. Do not commit or push unless the teacher asks.

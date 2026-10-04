# CLAUDE.md – F7PBPZIT (Základy informačních technologií)

Course website for **F7PBPZIT – Základy informačních technologií**, ČVUT FBMI (Kladno), bachelor programme **Bezpečnost a ochrana obyvatelstva (BOO)**, winter semester 2026/2027. Teacher: Ing. Marek Sokol. Students only ever see the published site, never the repo. The teacher's master plan for all seven exercises is `plans/course_general_plan.md` (private); follow its per-exercise sections, but keep this site architecture (not its Codex repo layout).

## Hard rules

1. **Distraction-free, spacious, light by default.** No GIFs, memes, emoji or auto-playing animation; demos move only when a student clicks. Light theme is the default (dark only via the toggle). Exercise and info pages use the narrow reading column (`.wrap.narrow`, 880 px); the footer is pinned to the bottom.
2. **Students must always know what to do next.** In exercise 1 they were lost and overwhelmed. Therefore: the home page is only a hub of exercises; each exercise page is a step-by-step mission (one step on screen, „Hotovo, když…“ at the end of each step); downloads are few (a single ZIP with ~5–7 files); every step has at most ~5 numbered actions.
3. **Everything student-facing is in Czech**, written like a teacher talks: short sentences, tykání, concrete examples, some humour. Czech quotes „“, proper diacritics, gender-inclusive verb forms (`udělal/a`).
4. **No dashes as sentence separators** in prose (no em dash, no spaced en dash). En dash only in ranges (3–4, 14:00–16:00) and fixed names (Mostkov–Podlesí). Avoid AI tics: „Nejde o X. Jde o Y.“, „právě proto“, triple punchlines, exhaustive lists.
5. **Never commit private material.** `docs/`, `plans/`, `teacher/` are gitignored. Run `git status` before any commit. Do not commit or push unless the teacher asks.
6. **All exercise data is synthetic**: fictional names, `+420 000 …` phones, `.example` / `example.invalid` domains, a disclaimer in every dataset.
7. **Microsoft Copilot (school account)** is the default AI tool. Never state tenant capabilities as facts („závisí na aktuálním nastavení ČVUT“).
8. **No build step, no dependencies.** Plain HTML/CSS/JS on GitHub Pages from the root of `main` (`.nojekyll`).

## Design

ČVUT FBMI colours (from fbmi.cvut.cz): CTU blue `#0065BD` (header, primary buttons, step numbers), link blue `#0071B3`, heading navy `#00568E`, light grey canvas `#F2F4F7`, white cards, soft blue `#E8F2FB`. Fonts: Quicksand (headings, UI), Nunito Sans (body), JetBrains Mono (code). Tokens only on `:root` in `assets/css/main.css`; light by default, dark only via `data-theme="dark"` set by the toggle. No ČVUT logo; the header wordmark is the text „ČVUT FBMI“.

## Layout

```
index.html                    hub: next exercise + 7 cards + small links to info.html
info.html                     #harmonogram #odevzdavani #pravidla-ai #hodnoceni #nastroje
lectures/<NN-slug>/index.html one page per exercise (+ page.css, page.js for exercise-specific components)
materials/<NN>/               student downloads
slides/<NN-slug>.html|.pdf    decks from Claude Design (teacher drops them in)
assets/js/course-data.js      schedule, groups, lectures (n, slug, status, icon, title, sub, dates{1,2,3}, test?)
assets/js/main.js             theme, group picker, hub, schedule, exercise date chips, copy, optional links, nbsp
assets/js/zit.js              shared components (below), exposes window.ZIT_helpers for page.js
harmonogram.html nastroje.html pravidla-ai.html hodnoceni.html lectures/index.html   redirect stubs (keep)
--- private ---
plans/course_general_plan.md  teacher's master plan for the whole course
plans/lectures/<NN>-…-plan-cz.md, plans/slides/<NN>-…-slides.md
teacher/<NN>/                 scenar-bible.md, klic-reseni.md, checklist.md, build-package.py, package-src/, reseni/
```

Every page: `<html lang="cs" data-root="…">`, `<body data-page="hub|info|exercise" data-lecture="N">`, the same header (brand + „Cvičení“ + „Info o kurzu“ + theme toggle) and footer copied verbatim. All links relative; only `404.html` uses absolute `/F7PBPZIT/` paths.

Groups: par. 1 Monday 14:00 KL:B-435; par. 3 Monday 12:00 KL:B-520 and par. 2 Monday 14:00 KL:B-435 one week later. Each exercise is planned for **90 minutes** of core work plus an optional ~15-minute extension (the master plan says 105–110; the timetable slot is 2 teaching hours). Graded tests: **Test 1 in exercise 4** (35 min, 40 b), **Test 2 in exercise 7** (50–55 min, 50 b), pass threshold proposal 60 %.

## Exercise page anatomy

`.ex-head` (badges, h1, `.lead`, `[data-zit=past-note]`, `[data-zit=dates]`, buttons: ZIP / slides via `data-check="../../slides/<slug>.html" data-missing="Slidy doplníme"` / slides PDF via `data-check` + `hidden` / tahák) → `.mission-card` (Mise / Dostaneš / Odevzdáš) → `<zit-mission key="lN">` with `<section class="ms-step" data-short="…" data-min="…"><h2>…</h2> … <div class="done-when"><span class="t">…</span><zit-done key="lN-sX"></zit-done></div></section>` → `[data-zit=prev-next]`. Scripts at the end: `main.js`, `zit.js`, then `page.js`.

Building blocks inside a step: `.story` (with `.clock`), `.timeline`, `.todo-h` + `ol.todo` (each `li > div`, paths as `<div class="path"><span>Domů</span><span>Styly</span></div>`, keys as `<kbd>`), `.box .box-info|ok|warn|bad`, `pre` (auto copy button).

## Shared components (`assets/js/zit.js`)

| Element | Purpose | Config |
|---|---|---|
| `<zit-mission key>` | stepper: pills, progress, ←/→ keys, `#krok-N`, remembers step, „Zobrazit všechny kroky“ | children `section.ms-step` |
| `<zit-done key label>` | „Hotovo“ checkbox, drives pill ticks | attrs |
| `<zit-reveal label>` | hidden content | light DOM |
| `<zit-ribbon>` | Word/Excel ribbon mock with highlighted button and path | `{app?, tab, groups:[{name, styles?, items:[str or {t,i,hl}]}], path, keys?}` |
| `<zit-compare start left right>` | before/after slider, first child before, second after | children |
| `<zit-ai-reveal>` | AI answer types out, button stamps the problems | `{title, prompt, button, after, sentences:[{t, bad?, label?, why?}]}` |
| `<zit-prompt-builder key>` | 6-part prompt, copy, Copilot link | `{prefill?, fields, example}` |
| `<zit-exit-ticket key>` | surname, name, group, questions → mailto teacher; shows exact attachment names | `{title, subject, attach:["{date}_…_{prijmeni}_v01.docx"], questions, footer}` |
| `<zit-folder-story>`, `<zit-sync-story>` | exercise 1 story pieces (run on click) | see exercise 1 |

Exercise-specific components live in `lectures/<NN-slug>/page.js` (e.g. exercise 2: `c2-xray`, `c2-styles`, `c2-skeleton`, `c2-typo`, `c2-facts`).

## Submission

E-mail to the teacher by the end of the lecture day. Subject `ZIT C<N>: Příjmení Jméno (par. X)`. Attachments named by convention `RRRR-MM-DD_tema_prijmeni_vXX.ext` (exercise 1: one ZIP; exercise 2: DOCX + PDF). Exit-ticket answers in the body. Keep `info.html#odevzdavani`, the last step of each exercise and the package's own instructions consistent.

## Adding an exercise

1. Read the exercise section of `plans/course_general_plan.md` and `docs/`. Write `plans/lectures/<NN>-<slug>-plan-cz.md`: review table, minute plan (teacher / students / file / output), questions, ≥8 common mistakes, offline variant.
2. Write `teacher/<NN>/scenar-bible.md` first. Generate downloads with `teacher/<NN>/build-package.py` → `materials/<NN>/`. Python venv with reportlab, python-docx, openpyxl, Pillow, pypdf: `%TEMP%\claude\zitvenv` (recreate with `uv venv` + `uv pip install …`). Word 16 is available via COM for field updates and DOCX → PDF. Fonts: `C:/Windows/Fonts/calibri.ttf`, `arial.ttf`. Make worksheets fillable PDFs (AcroForm).
3. Build the page: short scenario first, 6–8 steps, one click-driven demo per key concept, nothing decorative.
4. Slides: either brief Claude Design via `plans/slides/<NN>-<slug>-slides.md`, or build the deck directly like `slides/02-profesionalni-dokumenty.html` (self-contained 1920×1080 HTML, one `section.slide` per slide, `aside.notes`, keys ←/→/Home/End, N notes, F fullscreen; print CSS gives one slide per page). The deck doubles as the opening tutorial: walk through every step with Word mock-ups. Export the PDF with headless Edge: `msedge --headless=new --no-pdf-header-footer --virtual-time-budget=8000 --print-to-pdf=<out.pdf> file:///<deck.html>`.
5. Write `teacher/<NN>/klic-reseni.md` and `checklist.md`.
6. Set `status: "published"`, preview (`python -m http.server 8765`), check console, phone width (375 px), dark mode, then a Czech proofreading pass with rules 2 and 3.

## Course pedagogy

- Mental model: přijmi → utřiď → posuď → zvol nástroj → použij AI → ověř → teprve pak použij/sdílej. Three rules: **Utřiď. Posuď. Ověř.**
- Prompt framework: KONTEXT → ÚKOL → VSTUP → OMEZENÍ → FORMÁT → KONTROLA.
- Information categories: VEŘEJNÉ / INTERNÍ / OSOBNÍ ÚDAJE / CITLIVÉ; five questions before uploading.
- AI declaration (4 lines): Použitý AI nástroj / Účel použití / Co bylo převzato / Jak byl výstup ověřen.
- Grade the verification process, never similarity to the teacher's AI output.
- Scenario world: modelový region Alfa (river Bystrá; Kamenice, Mostkov, Podlesí, Lužná). C1–C2 flood; C3 chemical leak; C5 windstorm; C6 flash floods; Test 2 power outage (per the master plan).

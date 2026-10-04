# F7PBPZIT – Fundamentals of Information Technology

Course website for **Základy informačních technologií** (Fundamentals of Information Technology), taught at the **Faculty of Biomedical Engineering, Czech Technical University in Prague (ČVUT FBMI)**, Kladno, for the bachelor programme **Civil Protection and Population Safety** (Bezpečnost a ochrana obyvatelstva), winter semester 2026/2027.

🌐 **Student site:** https://cvut-fbmi.github.io/F7PBPZIT/

Students never work with this repository directly. They only use the website published from it by GitHub Pages (branch `main`, repository root). All student-facing content is in Czech.

## What the site contains

- **Exercise hub** (`index.html`): the next exercise for the student's chosen group and one card per exercise. Nothing else.
- **Exercise pages** (`lectures/<NN-slug>/`): each of the seven exercises has its own page, built for that exercise. A page walks students through one step at a time (scenario, why, numbered clicks, "done when…") and adds interactive demos specific to the topic, for example a before/after document slider, a Word ribbon mock-up showing where to click, or an AI answer that reveals its own mistakes. Downloads and the e-mail submission are on the same page.
- **Course info** (`info.html`): schedule for groups 1–3, submission rules, AI rules, assessment and the two graded tests, accounts and tools.

The practical work happens in Word, Excel and Microsoft Copilot (school accounts), using synthetic crisis-management scenarios. All exercise data is fictional.

## Repository layout

```
index.html                      exercise hub
info.html                       course info (schedule, submission, AI rules, assessment, tools)
lectures/<NN-slug>/             one folder per exercise: index.html (+ page.css, page.js when the page needs its own pieces)
materials/<NN>/                 student downloads (ZIP package and individual files)
slides/<NN-slug>.html|.pdf      slide decks
assets/css/main.css             design system (ČVUT FBMI colours, light and dark mode)
assets/js/course-data.js        single source of truth: schedule, groups, exercise list and status
assets/js/main.js               shared behaviour: theme, group picker, hub, schedule, dates, copy buttons
assets/js/zit.js                shared interactive components (step-by-step mission, ribbon mock-up, before/after slider, e-mail submission, …)
harmonogram.html, nastroje.html, pravidla-ai.html, hodnoceni.html   redirects to info.html (old links)
```

Private teaching material lives in `docs/`, `plans/` and `teacher/`. These folders are listed in `.gitignore` and must never be committed: lesson plans, slide briefs, scenario fact sheets, answer keys, model solutions and the scripts that generate the student packages.

## Running locally

There is no build step and there are no dependencies: plain HTML, CSS and JavaScript.

```bash
python -m http.server 8765
```

Then open http://localhost:8765/.

## Adding or updating an exercise

1. Set the exercise's `status` to `"published"` in `assets/js/course-data.js` once its page exists. The hub, the schedule and the page header read their data from there.
2. Create `lectures/<NN-slug>/index.html` using an existing exercise as the template, plus `page.css` / `page.js` for anything specific to that exercise.
3. Put student downloads in `materials/<NN>/` and the slide deck in `slides/<NN-slug>.html`. The page links the slides automatically once the file exists.

Detailed conventions (writing style, components, submission format) are in `CLAUDE.md`.

## Deployment

GitHub Pages: Settings → Pages → Deploy from a branch → `main` / `(root)`. The `.nojekyll` file disables Jekyll processing.

## Contact

Ing. Marek Sokol, ČVUT FBMI · marek.sokol@cvut.cz

# Slides

Finished slide decks, one self-contained HTML file per exercise (optionally also a PDF), generated with Claude Design from the private slide briefs in `plans/slides/`.

## File names

The name must match the exercise `slug` in `assets/js/course-data.js`:

```
slides/01-digitalni-minimum.html
slides/02-profesionalni-dokumenty.html
slides/03-overovani-informaci.html
slides/04-test1-excel.html
slides/05-analyza-dat.html
slides/06-ai-krizovy-stab.html
slides/07-kyberbezpecnost-test2.html
```

The exercise page checks whether the file exists and only then shows the „Slidy“ button (and „Slidy (PDF)“ for a `.pdf` with the same name). Until then it shows „Slidy doplníme“.

## Requirements

- self-contained HTML (styles and scripts inline), works offline,
- 16:9, arrow-key navigation,
- Czech, typographic quotes „“, ČVUT FBMI colours (see the brief),
- nothing private (answer keys and teacher notes stay in `teacher/`).

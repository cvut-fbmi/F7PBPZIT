# Slidy ke cvičením

Sem patří **hotové prezentace** (jeden samostatný HTML soubor na cvičení), vygenerované z plánů v `plans/slides/` (neveřejné).

## Konvence názvů

```
slides/01-digitalni-minimum.html
slides/02-profesionalni-dokumenty.html
slides/03-vyhledavani-a-overovani.html
slides/04-excel-pro-krizove-rizeni.html
slides/05-analyza-krizovych-dat.html
slides/06-ai-asistent-krizoveho-stabu.html
slides/07-kyberbezpecnost-a-kontinuita.html
```

Název musí odpovídat `slug` cvičení v `assets/js/course-data.js`. Stránka cvičení kontroluje, zda soubor existuje, a teprve pak zobrazí tlačítko **Slidy z cvičení**. Do té doby ukazuje „Slidy doplníme“.

## Požadavky na soubor

- samostatný HTML (styly a skripty uvnitř), funkční offline,
- 16:9, ovládání šipkami,
- česky, české uvozovky „“,
- žádné neveřejné informace (klíče řešení, poznámky s odpověďmi patří do `teacher/`).

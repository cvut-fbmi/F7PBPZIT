# F7PBPZIT – Základy informačních technologií

Web kurzu **Základy informačních technologií** pro studenty bakalářského programu **Bezpečnost a ochrana obyvatelstva** na Fakultě biomedicínského inženýrství ČVUT v Praze (Kladno), zimní semestr 2026/2027.

🌐 **Web pro studenty:** https://cvut-fbmi.github.io/F7PBPZIT/

Studenti s tímto repozitářem nepracují přímo; používají jen web, který se z něj publikuje (GitHub Pages, větev `main`, kořen repozitáře).

## Co web obsahuje

- **Úvod** – nejbližší cvičení podle zvolené paralelky, přehled semestru, tři pravidla kurzu.
- **Cvičení** – sedm praktických cvičení, každé na vlastní stránce: příběh scénáře s animacemi, postup krok za krokem, tvůrce promptu, exit ticket s odevzdáním e-mailem a materiály ke stažení.
- **Harmonogram** – termíny pro paralelky 1–3.
- **Nástroje** – školní účet ČVUT, Microsoft Copilot, Copilot Studio, OneDrive, nastavení počítače.
- **Pravidla AI** – semafor dovoleného použití, čtyři kategorie informací, pět otázek před nahráním.
- **Hodnocení** – podmínky zápočtu, checkpoint, závěrečná krizová mikrosimulace, odevzdávání e-mailem.

## Struktura repozitáře

```
index.html, harmonogram.html, nastroje.html, pravidla-ai.html, hodnoceni.html, 404.html
lectures/            stránky cvičení (lectures/<NN-slug>/index.html)
materials/<NN>/      balíčky a soubory ke stažení pro studenty
slides/              hotové prezentace (HTML a PDF na cvičení)
assets/css, assets/js, assets/img   design systém, data kurzu, interaktivní prvky
docs/, plans/, teacher/             NEVEŘEJNÉ (v .gitignore): podklady, plány, klíče řešení
```

Web nemá build ani závislosti: čisté HTML, CSS a JavaScript. Lokální náhled:

```bash
python -m http.server 8765
```

a otevřít http://localhost:8765/.

## Technologie a účty

Kurz používá **Microsoft Copilot** a **Copilot Studio** přes školní účty ČVUT. Všechna cvičná data na webu a v balíčcích jsou smyšlená.

## Vyučující

Ing. Marek Sokol, FBMI ČVUT · marek.sokol@cvut.cz

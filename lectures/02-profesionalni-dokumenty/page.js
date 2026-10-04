/* =====================================================================
   Cvičení 2: vlastní interaktivní prvky stránky.
   <c2-xray>      „rentgen“ konceptu: přepínač značek ¶ · →
   <c2-styles>    ruční formátování vs. styl: jedna změna, všechny nadpisy
   <c2-skeleton>  kostra SITREP: 10 částí, odkud se bere obsah
   <c2-typo>      pět typografických pravidel: karta špatně → správně
   <c2-facts>     kontrolní seznam faktů po úpravě AI (ukládá se v prohlížeči)
   ===================================================================== */
(function () {
  "use strict";
  const H = window.ZIT_helpers;
  const { esc, LS, onVisible, sleep, reduced } = H;

  /* ---------- rentgen konceptu ---------- */
  const DRAFT = [
    "             SITREP č. 4 – povodeň Bystrá",
    "",
    "Obsah",
    "1) Současná situace ....................... 1",
    "Prioritní problémy ........................ 3",
    "",
    "1) Současná situace",
    "V návaznosti na vývoj hydrometeorologické situace v průběhu dne lze konstatovat…",
    "",
    "2) CO VÍME JISTĚ",
    "     - Silnice II/305 v úseku Mostkov–Podlesí i most 305-004 byli nadále uzavřeny.",
    "     - Prý jsou kontaminované studny v Podlesí, píšou to lidi na sítích…",
    "",
    "kapacity EC (stav 15:30)",
    "ID	centrum			kapacita	obsazeno",
    "EC-01	ZŠ Mostkov		120		71",
    "EC-02	Sokolovna Podlesí	60	19"
  ];
  class C2Xray extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      H.shell(this, {
        ico: "🩻", title: "Rentgen konceptu", kind: "jako tlačítko ¶ ve Wordu",
        body: `<div class="paper xray-paper" aria-live="polite"></div><div class="xray-found" hidden></div>`,
        foot: `<button type="button" class="btn btn-primary btn-sm" data-x>¶ Zobrazit značky</button><span class="small muted">Ve Wordu: <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>8</kbd></span>`
      });
      this.on = false;
      this.querySelector("[data-x]").addEventListener("click", () => { this.on = !this.on; this.render(); });
      this.render();
    }
    render() {
      const on = this.on;
      const html = DRAFT.map(line => {
        let out = "";
        if (on) {
          for (let i = 0; i < line.length;) {
            let j = i;
            if (line[i] === " ") {
              while (j < line.length && line[j] === " ") j++;
              out += j - i > 1 ? `<mark class="x-bad">${"·".repeat(j - i)}</mark>` : '<span class="x-dot">·</span>';
            } else if (line[i] === "\t") { j = i + 1; out += '<mark class="x-bad x-tab">→\t</mark>'; }
            else { while (j < line.length && line[j] !== " " && line[j] !== "\t") j++; out += esc(line.slice(i, j)); }
            i = j;
          }
          out += `<span class="x-pil${line === "" ? " x-empty" : ""}">¶</span>`;
        } else out = esc(line) || "&nbsp;";
        return `<div class="x-line">${out}</div>`;
      }).join("");
      this.querySelector(".xray-paper").innerHTML = html;
      const f = this.querySelector(".xray-found");
      f.hidden = !on;
      f.innerHTML = on ? `<span class="badge badge-bad">13 mezer</span> místo zarovnání na střed <span class="badge badge-bad">4 prázdné řádky</span> místo mezer <span class="badge badge-bad">ručně psaný obsah</span> s tečkami <span class="badge badge-bad">tabulátory</span> místo tabulky <span class="badge badge-bad">ruční odrážky</span> z mezer a pomlček` : "";
      this.querySelector("[data-x]").textContent = on ? "Skrýt značky" : "¶ Zobrazit značky";
    }
  }

  /* ---------- styly vs. ruční formátování ---------- */
  const LOOKS = [
    { font: "Calibri, Carlito, sans-serif", color: "#1f3864", size: "17px", name: "Calibri, tmavě modrá" },
    { font: "Georgia, 'Times New Roman', serif", color: "#7b2d26", size: "18px", name: "Georgia, vínová" },
    { font: "'Segoe UI', Arial, sans-serif", color: "#0065bd", size: "16px", name: "Segoe UI, modrá ČVUT" }
  ];
  const HEADS = ["Současná situace", "Potvrzené skutečnosti", "Neověřené informace", "Kapacity"];
  class C2Styles extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      H.shell(this, {
        ico: "🎨", title: "Změň vzhled všech nadpisů", kind: "vyzkoušej",
        body: `<div class="seg" role="group" aria-label="Způsob formátování">
            <button type="button" data-m="manual" aria-pressed="true">Ručně (tučně + větší)</button>
            <button type="button" data-m="styles" aria-pressed="false">Stylem Nadpis 1</button>
          </div>
          <div class="styles-demo">
            <div class="nav-pane"><div class="np-h">Navigační podokno</div><div class="np-list"></div></div>
            <div class="paper sd-paper"></div>
          </div>
          <p class="sd-msg small"></p>`,
        foot: `<button type="button" class="btn btn-primary btn-sm" data-change>🎨 Změnit vzhled nadpisu</button><button type="button" class="btn btn-sm" data-reset>Znovu</button>`
      });
      this.mode = "manual"; this.reset();
      this.querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => { this.mode = b.dataset.m; this.querySelectorAll("[data-m]").forEach(x => x.setAttribute("aria-pressed", x === b)); this.reset(); }));
      this.querySelector("[data-change]").addEventListener("click", () => this.change());
      this.querySelector("[data-reset]").addEventListener("click", () => this.reset());
    }
    reset() { this.looks = HEADS.map(() => 0); this.clicks = 0; this.target = null; this.render(); }
    change() {
      this.clicks++;
      if (this.mode === "styles") { const n = (this.looks[0] + 1) % LOOKS.length; this.looks = this.looks.map(() => n); }
      else {
        if (this.target === null || this.looks.every(l => l === this.target)) this.target = (this.looks[0] + 1) % LOOKS.length;
        this.looks[this.looks.findIndex(l => l !== this.target)] = this.target;
      }
      this.render(true);
    }
    render(flash) {
      const p = this.querySelector(".sd-paper");
      p.innerHTML = HEADS.map((h, i) => {
        const L = LOOKS[this.looks[i]];
        return `<div class="sd-h ${flash ? "flash" : ""}" style="font-family:${L.font};color:${L.color};font-size:${L.size}">${esc(h)}</div><div class="sd-p"></div><div class="sd-p short"></div>`;
      }).join("");
      const list = this.querySelector(".np-list");
      list.innerHTML = this.mode === "styles" ? HEADS.map(h => `<div class="np-item">▸ ${esc(h)}</div>`).join("") : `<div class="np-empty">Word tu nevidí žádné nadpisy. Pro něj je to jen tučný text.</div>`;
      const msg = this.querySelector(".sd-msg");
      const left = this.target === null ? 0 : this.looks.filter(l => l !== this.target).length;
      if (!this.clicks) msg.textContent = this.mode === "manual" ? "Klikni na tlačítko a změň vzhled nadpisu. Pak to zkus se styly." : "Teď klikni na tlačítko znovu.";
      else if (this.mode === "styles") msg.innerHTML = `<b>Jedno kliknutí, všechny nadpisy najednou.</b> V SITREPu s 10 nadpisy pořád jedno kliknutí. A navigační podokno i automatický obsah je vidí.`;
      else msg.innerHTML = left ? `Zatím jsi změnil/a ${HEADS.length - left} ze ${HEADS.length} nadpisů. Klikej dál, nebo přepni na styly.` : `Hotovo, ale stálo tě to <b>${this.clicks} kliknutí</b>. V SITREPu je nadpisů 10 a při další změně začínáš znovu.`;
    }
  }

  /* ---------- kostra SITREP ---------- */
  const PARTS = [
    ["Identifikace události", "Co, kde, kdo zprávu zpracoval, číslo zprávy, klasifikace INTERNÍ.", "doplň"],
    ["Datum a čas aktualizace", "Údaje k 15:30, vydáno 16:00, příští SITREP 15. 9. v 8:00.", "doplň"],
    ["Současná situace", "Přehled ve 3 až 5 větách. V konceptu je místo toho dlouhý úřední odstavec.", "koncept"],
    ["Potvrzené skutečnosti", "Jen ověřená fakta, každé s časem.", "koncept + poznámky"],
    ["Neověřené informace", "Co se říká, ale není potvrzené. Kdo to ověřuje a kdy.", "koncept + poznámky"],
    ["Postižené oblasti", "Obce a ulice a čeho se to týká.", "odvodíš"],
    ["Kapacity", "Skutečná tabulka evakuačních center se součtem.", "kapacity.csv"],
    ["Prioritní problémy", "Co teď nejvíc hoří, seřazené podle důležitosti.", "koncept"],
    ["Provedená opatření", "Co už se udělalo, s časy.", "koncept + poznámky"],
    ["Doporučené další kroky", "Co má štáb rozhodnout nebo zařídit.", "poznámky"]
  ];
  class C2Skeleton extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      const src = s => s === "doplň" ? "badge-warn" : s === "odvodíš" ? "badge-warn" : s === "koncept" ? "badge" : "badge-blue";
      this.innerHTML = `<ol class="skel">${PARTS.map((p, i) => `
        <li style="--d:${i * 60}ms"><span class="sk-n">${i + 1}</span><div><b>${esc(p[0])}</b><span class="small muted">${esc(p[1])}</span></div><span class="badge ${src(p[2])}">${esc(p[2])}</span></li>`).join("")}</ol>`;
      onVisible(this, () => this.classList.add("in"), .15);
    }
  }

  /* ---------- typografie ---------- */
  const TYPO = [
    ["Uvozovky", "\"Sokolovna Podlesí\"", "„Sokolovna Podlesí“", "České uvozovky dole a nahoře. Word je napíše sám, když je píšeš znovu."],
    ["Datum", "14.9.2026", "14. 9. 2026", "Za tečkou v datu je mezera."],
    ["Rozsah", "14:00 - 16:00", "14:00–16:00", "Mezi čísly pomlčka bez mezer, ne spojovník s mezerami."],
    ["Číslo a jednotka", "90\nosob", "90 osob", "Pevná mezera nedovolí, aby se číslo a jednotka rozdělily na dva řádky."],
    ["Předložka", "evakuovaní jsou v\nZŠ Mostkov", "evakuovaní jsou\nv ZŠ Mostkov", "Jednopísmenná předložka nezůstane na konci řádku. Pevná mezera: Ctrl+Shift+Mezerník."]
  ];
  class C2Typo extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      this.innerHTML = `<div class="typo-grid">${TYPO.map((t, i) => `
        <button type="button" class="typo-card" data-i="${i}" aria-pressed="false">
          <span class="ty-h">${esc(t[0])}</span>
          <span class="ty-bad">${esc(t[1]).replace("\n", "<br>")}</span>
          <span class="ty-ok">${esc(t[2]).replace("\n", "<br>")}</span>
          <span class="ty-why">${esc(t[3])}</span>
        </button>`).join("")}</div><p class="small muted" style="margin-top:.5rem">Klikni na kartu a uvidíš opravu.</p>`;
      this.querySelectorAll(".typo-card").forEach(b => b.addEventListener("click", () => { b.classList.toggle("fixed"); b.setAttribute("aria-pressed", b.classList.contains("fixed")); }));
      if (!reduced()) onVisible(this, async () => {
        const cards = [...this.querySelectorAll(".typo-card")];
        await sleep(600);
        for (const c of cards) { c.classList.add("fixed", "auto"); await sleep(380); }
        await sleep(1600);
        for (const c of cards) { if (c.classList.contains("auto")) c.classList.remove("fixed", "auto"); }
      });
    }
  }

  /* ---------- kontrola faktů ---------- */
  class C2Facts extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      const key = this.getAttribute("key") || "c2facts";
      const items = [...this.querySelectorAll("li")].map(li => li.innerHTML);
      const saved = LS.get("zit.facts." + key, []);
      this.innerHTML = `<ul class="facts">${items.map((t, i) => `<li><label><input type="checkbox" data-i="${i}" ${saved[i] ? "checked" : ""}> <span>${t}</span></label></li>`).join("")}</ul>`;
      this.addEventListener("change", () => LS.set("zit.facts." + key, [...this.querySelectorAll("input")].map(x => x.checked)));
    }
  }

  customElements.define("c2-xray", C2Xray);
  customElements.define("c2-styles", C2Styles);
  customElements.define("c2-skeleton", C2Skeleton);
  customElements.define("c2-typo", C2Typo);
  customElements.define("c2-facts", C2Facts);
})();

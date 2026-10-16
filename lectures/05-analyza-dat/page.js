/* =====================================================================
   Cvičení 5: vlastní interaktivní prvky stránky.
   <c5-dirty>  najdi chyby ve vzorku dat
   <c5-pivot>  kontingenční tabulka jako otázka: řádky × hodnoty, špinavá vs. čistá data
   <c5-chart>  jaký graf na jakou otázku
   <c5-audit>  audit závěrů od AI (správné / chybné / nepodložené / zavádějící)
   Čísla odpovídají teacher/05/reseni/ground_truth.json (SEED 20261116).
   ===================================================================== */
(function () {
  "use strict";
  const H = window.ZIT_helpers;
  const { esc, LS } = H;

  /* ---------- špinavá data ---------- */
  const DCOLS = ["id_udalosti", "datum", "cas", "oblast", "obec", "typ_udalosti", "cas_reakce_min"];
  const DROWS = [
    [["U-0012"], ["14. 11. 2026"], ["19:41"], ["Střed"], ["Bystřice"], ["lokální zaplavení"], ["14"]],
    [["U-0012", "Duplicita", "Stejné hlášení je v tabulce dvakrát. Evakuovaní z něj by se sečetli dvakrát."], ["14. 11. 2026"], ["19:41"], ["Střed"], ["Bystřice"], ["lokální zaplavení"], ["14"]],
    [["U-0016"], ["14. 11. 2026"], ["19:37"], ["Sever"], ["Javorník"], ["výpadek elektřiny␣", "Mezera navíc", "Na konci je neviditelná mezera. Pro Excel je to jiný typ než „výpadek elektřiny“."], ["28"]],
    [["U-0020"], ["14. 11. 2026"], ["20:41"], ["Jih"], ["␣␣Zálesí", "Mezery na začátku", "„  Zálesí“ a „Zálesí“ jsou pro Excel dvě různé obce."], ["výpadek elektřiny"], ["26"]],
    [["U-0035"], ["14. 11. 2026"], ["21:04"], ["Západ"], ["Březina"], ["Spadlý strom", "Jiný zápis kategorie", "Velké S. Kontingenční tabulka by udělala zvláštní řádek."], ["990", "Nesmyslná hodnota", "990 minut je přes 16 hodin. Jedno takové číslo zvedne průměr celé oblasti Západ."]],
    [["U-0076"], ["14. 11. 2026"], ["23:56"], ["Sever"], ["Horní Lhota"], ["poškozená budova"], ["44 min", "Text místo čísla", "Průměr ho přeskočí, jako by tam nebyl."]],
    [["U-0197"], ["15.11.2026", "Datum jako text", "Bez mezer a zarovnané vlevo. Excel ho nepozná jako datum a špatně ho seřadí."], ["04:37"], ["Sever"], ["Javorník"], ["výpadek elektřiny"], ["28"]]
  ];
  const NBAD = DROWS.flat().filter(c => c.length > 1).length;
  class C5Dirty extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      H.shell(this, {
        title: "Vzorek z listu DATA", kind: "klikni na podezřelé buňky",
        body: `<div class="dt-wrap"><table class="dt"><thead><tr>${DCOLS.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>${DROWS.map(r =>
          `<tr>${r.map((c, ci) => `<td><button type="button" class="dc ${ci === 6 && !isNaN(Number(c[0])) ? "num" : ""}" ${c.length > 1 ? `data-bad="1"` : ""}>${esc(c[0])}</button></td>`).join("")}</tr>`).join("")}</tbody></table></div>
          <ol class="dirty-found"></ol>`,
        foot: `<span class="zit-result mid" style="margin-left:0">Nalezeno 0 z ${NBAD}</span><button type="button" class="btn btn-sm" data-all style="margin-left:auto">Ukázat všechny</button>`
      });
      this.found = 0;
      const info = [];
      DROWS.forEach(r => r.forEach(c => { if (c.length > 1) info.push(c); }));
      this.querySelectorAll(".dc").forEach(b => b.addEventListener("click", () => this.mark(b)));
      this.querySelector("[data-all]").addEventListener("click", () => this.querySelectorAll(".dc[data-bad]").forEach(b => this.mark(b)));
      this.info = new Map([...this.querySelectorAll(".dc[data-bad]")].map((b, i) => [b, info[i]]));
    }
    mark(b) {
      if (!b.dataset.bad) { b.classList.add("ok"); setTimeout(() => b.classList.remove("ok"), 600); return; }
      if (b.classList.contains("on")) return;
      b.classList.add("on");
      const c = this.info.get(b);
      this.found++;
      this.querySelector(".dirty-found").insertAdjacentHTML("beforeend", `<li><b>${esc(c[1])}:</b> ${esc(c[2])}</li>`);
      const r = this.querySelector(".zit-result");
      r.textContent = this.found === NBAD ? `Všech ${NBAD}. V celé tabulce je takových chyb sedmnáct.` : `Nalezeno ${this.found} z ${NBAD}`;
      r.className = "zit-result " + (this.found === NBAD ? "ok" : "mid");
      if (this.found === NBAD) this.querySelector("[data-all]").hidden = true;
    }
  }

  /* ---------- kontingenční tabulka ---------- */
  const PIV = {
    clean: {
      oblast: { count: { "Sever": 68, "Střed": 63, "Jih": 59, "Západ": 46 }, react: { "Sever": 34.6, "Západ": 28.7, "Jih": 25.2, "Střed": 19.9 } },
      typ: { count: { "spadlý strom": 80, "výpadek elektřiny": 47, "neprůjezdná komunikace": 37, "poškozená budova": 29, "technická pomoc": 24, "lokální zaplavení": 10, "zdravotnická událost": 9 } }
    },
    dirty: {
      oblast: { count: { "Sever": 68, "Střed": 66, "Jih": 60, "Západ": 46 }, react: { "Západ": 49.6, "Sever": 34.6, "Jih": 25.3, "Střed": 19.8 } },
      typ: { count: { "spadlý strom": 77, "výpadek elektřiny": 45, "neprůjezdná komunikace": 38, "poškozená budova": 30, "technická pomoc": 25, "lokální zaplavení": 11, "zdravotnická událost": 9, "výpadek elektřiny␣": 2, "Spadlý strom": 1, "spadly strom": 1, "spadlý␣␣strom": 1 } }
    }
  };
  const fmt = v => Number.isInteger(v) ? String(v) : v.toFixed(1).replace(".", ",");
  class C5Pivot extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      this.s = { data: "clean", rows: "oblast", val: "count" };
      const seg = (k, opts) => `<div class="seg" role="group" data-k="${k}">${opts.map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${this.s[k] === v}">${l}</button>`).join("")}</div>`;
      H.shell(this, {
        title: "Kontingenční tabulka", kind: "zkus různé otázky",
        body: `<div class="piv-ctl"><div><span class="piv-l">Řádky</span>${seg("rows", [["oblast", "oblast"], ["typ", "typ_udalosti"]])}</div>
            <div><span class="piv-l">Hodnoty</span>${seg("val", [["count", "Počet událostí"], ["react", "Průměr času reakce"]])}</div>
            <div><span class="piv-l">Data</span>${seg("data", [["clean", "vyčištěná"], ["dirty", "před čištěním"]])}</div></div>
          <div class="piv-out"></div><p class="piv-msg small mb-0"></p>`
      });
      this.querySelectorAll(".seg").forEach(sg => sg.addEventListener("click", e => {
        const b = e.target.closest("[data-v]"); if (!b) return;
        this.s[sg.dataset.k] = b.dataset.v; sg.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); this.render();
      }));
      this.render();
    }
    render() {
      const { data, rows, val } = this.s;
      const out = this.querySelector(".piv-out"), msg = this.querySelector(".piv-msg");
      const set = PIV[data][rows][val];
      if (!set) { out.innerHTML = `<p class="muted small mb-0">Průměr času reakce podle typu tu neukazujeme. Zkus oblast.</p>`; msg.textContent = ""; return; }
      const entries = Object.entries(set).sort((a, b) => b[1] - a[1]);
      const max = entries[0][1];
      out.innerHTML = `<table class="piv mb-0"><thead><tr><th>${rows === "oblast" ? "Popisky řádků: oblast" : "Popisky řádků: typ_udalosti"}</th><th class="num">${val === "count" ? "Počet z id_udalosti" : "Průměr z cas_reakce_min"}</th><th></th></tr></thead><tbody>${entries.map(([k, v], i) =>
        `<tr class="${i === 0 ? "top" : ""} ${/␣|Spadlý|spadly/.test(k) ? "junk" : ""}"><td>${esc(k)}</td><td class="num">${fmt(v)}</td><td class="bar"><i style="width:${Math.round(v / max * 100)}%"></i></td></tr>`).join("")}</tbody></table>`;
      const notes = {
        "clean-oblast-count": "Nejvíc událostí měl Sever. To je odpověď 1.",
        "clean-typ-count": "Spadlé stromy jasně vedou. To je odpověď 2.",
        "clean-oblast-react": "Nejdéle se čekalo na severu, 34,6 minuty. To je odpověď 5.",
        "dirty-oblast-react": "Před čištěním vychází nejpomalejší Západ. Jediná hodnota 990 minut zvedla jeho průměr z 28,7 na 49,6. Takhle se spletla i AI.",
        "dirty-typ-count": "Před čištěním je typů jedenáct místo sedmi. Spadlé stromy jsou rozdělené do čtyř řádků.",
        "dirty-oblast-count": "Před čištěním mají Střed a Jih o pár událostí víc. To jsou duplicity."
      };
      msg.textContent = notes[`${data}-${rows}-${val}`] || "";
    }
  }

  /* ---------- jaký graf ---------- */
  const CQ = [
    { q: "Kdy během noci přišlo nejvíc hlášení?", a: "col", why: { col: "Ano. Hodiny jdou po sobě, sloupce nebo spojnice ukážou průběh noci a vrchol je vidět hned.", line: "Taky dobře. Spojnice je pro vývoj v čase přirozená, sloupce se u hodin čtou o něco snáz.", pie: "Ne. Čtyřiadvacet výsečí nikdo nepřečte a ztratí se pořadí hodin." }, ok: ["col", "line"] },
    { q: "Která oblast měla nejvíc událostí?", a: "col", why: { col: "Ano. Porovnání pár kategorií, nejlíp seřazené od největší.", line: "Ne. Spojnice naznačuje vývoj, ale oblasti po sobě nejdou.", pie: "Šlo by to, ale rozdíl 68 a 63 na výseči nepoznáš. Sloupce jsou přesnější." }, ok: ["col"] },
    { q: "Jaký podíl ze všech hlášení tvořily spadlé stromy?", a: "pie", why: { col: "Dobře, sloupce fungují vždycky.", line: "Ne. Tady žádný vývoj v čase není.", pie: "Ano, když slepíš ostatní typy do jedné výseče „ostatní“. Víc než pět výsečí už je nečitelné." }, ok: ["pie", "col"] }
  ];
  const ICONS = { col: ["Sloupcový", "▥"], line: ["Spojnicový", "⟋"], pie: ["Výsečový", "◔"] };
  class C5Chart extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      H.shell(this, {
        title: "Jaký graf na jakou otázku?", kind: "vyber",
        body: `<ol class="cq">${CQ.map((c, i) => `<li data-i="${i}"><p class="mb-0"><b>${esc(c.q)}</b></p><div class="cq-opts">${Object.entries(ICONS).map(([k, [l, ic]]) =>
          `<button type="button" class="btn btn-sm" data-k="${k}"><span aria-hidden="true">${ic}</span> ${l}</button>`).join("")}</div><p class="cq-fb small mb-0" hidden></p></li>`).join("")}</ol>
          <div class="hours" aria-label="Hlášení podle hodiny"><div class="hours-h">Takhle vypadá odpověď na první otázku (vyčištěná data)</div><div class="hbars"></div></div>`
      });
      this.addEventListener("click", e => {
        const b = e.target.closest("[data-k]"); if (!b) return;
        const li = b.closest("li"), c = CQ[Number(li.dataset.i)], k = b.dataset.k;
        li.querySelectorAll("[data-k]").forEach(x => x.classList.toggle("pick", x === b));
        b.classList.toggle("good", c.ok.includes(k)); b.classList.toggle("bad", !c.ok.includes(k));
        const fb = li.querySelector(".cq-fb"); fb.hidden = false; fb.textContent = c.why[k];
      });
      const HRS = [["18", 10], ["19", 8], ["20", 12], ["21", 14], ["22", 26], ["23", 40], ["00", 32], ["01", 15], ["02", 20], ["03", 14], ["04", 6], ["05", 2], ["06", 2], ["07", 4], ["08", 3], ["09", 1], ["10", 4], ["11", 8], ["12", 2], ["13", 2], ["14", 2], ["15", 5], ["16", 2], ["17", 2]];
      this.querySelector(".hbars").innerHTML = HRS.map(([h, v]) => `<div class="hb ${v === 40 ? "peak" : ""}" title="${h}:00 · ${v} hlášení"><i style="height:${v / 40 * 100}%"></i><span>${h}</span></div>`).join("");
    }
  }

  /* ---------- audit AI ---------- */
  const CLAIMS = [
    ["Nejvíce událostí bylo v oblasti Sever.", "správné", "Kontingenční tabulka: Sever 68 událostí, nejvíc ze všech."],
    ["Převažovaly spadlé stromy, tvořily zhruba 34 % všech hlášení.", "správné", "80 z 236 po sjednocení kategorií, tedy 34 %."],
    ["Bouře zasáhla všechny čtyři oblasti regionu.", "správné", "Sever, Střed, Jih i Západ mají události."],
    ["Nejvíce hlášení přišlo mezi 15:00 a 16:00.", "chybné", "Vrchol je ve 23:00 (40 hlášení). V 15:00 jich bylo pět."],
    ["Celkem bylo evakuováno 208 osob.", "chybné", "AI počítala i duplicity. Po vyčištění 191."],
    ["Nejdelší průměrnou dobu reakce měla oblast Západ.", "chybné", "Zkreslené hodnotou 990 minut. Po vyčištění je nejpomalejší Sever (34,6 min)."],
    ["Pomalejší reakce na severu byla způsobena nedostatkem hasičů.", "nepodložené", "Data o počtu hasičů ani o příčinách nic neobsahují. A navíc AI o pár řádků výš tvrdila, že nejpomalejší je Západ."],
    ["Neuzavřených zůstalo 5 událostí, bouře je tedy pod kontrolou.", "zavádějící", "Počet sedí, ale „pod kontrolou“ z něj neplyne. O dalším vývoji počasí v datech nic není."],
    ["Škody byly nejvyšší v historii regionu.", "nepodložené", "Data obsahují jen tuto bouři. Srovnání s historií z nich udělat nejde."]
  ];
  const V = [["správné", "ok"], ["chybné", "bad"], ["nepodložené", "mid"], ["zavádějící", "mis"]];
  class C5Audit extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      this.ans = LS.get("zit.c5.audit", {});
      H.shell(this, {
        title: "Shrnutí od AI (ai_analyza_k_auditu.txt)", kind: "ohodnoť",
        body: `<ol class="audit">${CLAIMS.map((c, i) => `<li data-i="${i}"><p class="mb-0">${esc(c[0])}</p><div class="a-opts">${V.map(([v, cls]) =>
          `<button type="button" class="a-b ${cls}" data-v="${v}" aria-pressed="${this.ans[i] === v}">${v}</button>`).join("")}</div><p class="a-why small mb-0" hidden></p></li>`).join("")}</ol>`,
        foot: `<button type="button" class="btn btn-primary btn-sm" data-eval>Vyhodnotit</button><span class="zit-result"></span>`
      });
      this.addEventListener("click", e => {
        const b = e.target.closest(".a-b"); if (!b) return;
        const li = b.closest("li"); this.ans[li.dataset.i] = b.dataset.v; LS.set("zit.c5.audit", this.ans);
        li.querySelectorAll(".a-b").forEach(x => x.setAttribute("aria-pressed", x === b));
      });
      this.querySelector("[data-eval]").addEventListener("click", () => this.evaluate());
    }
    evaluate() {
      let ok = 0;
      this.querySelectorAll(".audit li").forEach(li => {
        const c = CLAIMS[Number(li.dataset.i)], a = this.ans[li.dataset.i], w = li.querySelector(".a-why");
        const good = a === c[1]; if (good) ok++;
        li.className = a ? (good ? "good" : "wrong") : "";
        w.hidden = false; w.innerHTML = `<b>${esc(c[1])}.</b> ${esc(c[2])}`;
      });
      const r = this.querySelector(".zit-result");
      r.textContent = `${ok} z ${CLAIMS.length}`; r.className = "zit-result " + (ok >= 7 ? "ok" : "mid");
    }
  }

  customElements.define("c5-dirty", C5Dirty);
  customElements.define("c5-pivot", C5Pivot);
  customElements.define("c5-chart", C5Chart);
  customElements.define("c5-audit", C5Audit);
})();

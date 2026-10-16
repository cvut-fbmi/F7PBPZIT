/* =====================================================================
   Cvičení 4: vlastní interaktivní prvky stránky.
   <c4-grid>    buňky, adresy a datové typy (klikni na buňku)
   <c4-fill>    kopírování vzorce dolů: relativní odkaz se posouvá
   <c4-anchor>  B4 vs. $B$4: co se stane s odkazem na parametr při kopírování
   ===================================================================== */
(function () {
  "use strict";
  const H = window.ZIT_helpers;
  const { esc } = H;

  /* data: řádek, ID, obec, název, kapacita, obsazeno, aktualizace */
  const ROWS = [
    [5, "EC-01", "Mostkov", "ZŠ Mostkov", 120, 71, "2. 11. 2026 7:40"],
    [6, "EC-02", "Podlesí", "Sokolovna Podlesí", 60, 55, "2. 11. 2026 7:45"],
    [7, "EC-03", "Lužná", "Kulturní dům Lužná", 80, 12, "2. 11. 2026 7:30"],
    [8, "EC-04", "Kamenice", "Tělocvična Kamenice", 40, 38, "2. 11. 2026 7:50"],
    [20, "EC-16", "Podlesí", "Hasičská zbrojnice Podlesí", "25", 10, "2. 11. 2026 7:30"]
  ];
  const COLS = ["A", "B", "C", "D", "E", "I"];
  const NAMES = ["ID", "Obec", "Název", "Kapacita", "Obsazeno", "Aktualizace"];
  const typeOf = (ci, v) => ci === 5 ? ["datum a čas", "Excel si ho pamatuje jako číslo, proto s ním umí počítat (třeba kolik hodin uplynulo)."]
    : typeof v === "number" ? ["číslo", "Zarovnané vpravo. Dá se s ním počítat."]
    : ci === 3 ? ["text, který vypadá jako číslo", "Pozor! Zarovnané vlevo, se zeleným trojúhelníkem. SUMA ho tiše přeskočí a součet bude špatně."]
    : ["text", "Zarovnaný vlevo. Počítat se s ním nedá, ale dá se podle něj filtrovat a třídit."];
  class C4Grid extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      const head = `<tr><th class="rn"></th>${COLS.map(c => `<th>${c}</th>`).join("")}</tr><tr class="hdr"><td class="rn">4</td>${NAMES.map(n => `<td>${n}</td>`).join("")}</tr>`;
      const body = ROWS.map((r, k) => `${k === 4 ? `<tr class="gap"><td class="rn">…</td><td colspan="6"></td></tr>` : ""}<tr><td class="rn">${r[0]}</td>${r.slice(1).map((v, ci) =>
        `<td><button type="button" class="cell ${typeof v === "number" ? "num" : ""} ${ci === 3 && typeof v === "string" ? "txtnum" : ""}" data-r="${r[0]}" data-c="${ci}">${esc(v)}</button></td>`).join("")}</tr>`).join("");
      H.shell(this, {
        title: "List CENTRA (výřez)", kind: "klikni na buňku",
        body: `<div class="xl-wrap"><table class="xl">${head}${body}</table></div><div class="xl-info" aria-live="polite"><span class="muted">Klikni na libovolnou buňku s daty.</span></div>`
      });
      this.addEventListener("click", e => {
        const b = e.target.closest(".cell"); if (!b) return;
        this.querySelectorAll(".cell.on").forEach(x => x.classList.remove("on")); b.classList.add("on");
        const ci = Number(b.dataset.c), row = ROWS.find(r => r[0] === Number(b.dataset.r)), v = row[ci + 1];
        const [t, why] = typeOf(ci, v);
        this.querySelector(".xl-info").innerHTML = `<span class="addr">${COLS[ci]}${row[0]}</span> <b>${esc(t)}</b> · ${esc(why)}`;
      });
    }
  }

  /* ---------- kopírování dolů ---------- */
  class C4Fill extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      const rows = ROWS.slice(0, 4).concat([[9, "EC-05", "", "", 150, 96]]);
      this.rows = rows;
      H.shell(this, {
        title: "Sloupec K: Volno", kind: "relativní odkaz",
        body: `<div class="xl-wrap"><table class="xl fill"><tr><th class="rn"></th><th>D</th><th>E</th><th>K</th></tr>
            <tr class="hdr"><td class="rn">4</td><td>Kapacita</td><td>Obsazeno</td><td>Volno</td></tr>
            ${rows.map((r, i) => `<tr><td class="rn">${r[0]}</td><td class="n">${r[4]}</td><td class="n">${r[5]}</td><td class="k" data-i="${i}">${i === 0 ? "" : ""}</td></tr>`).join("")}</table></div>
          <p class="fill-msg small mb-0">V K5 je vzorec <code>=D5-E5</code>. Klikni na tlačítko, jako bys dvojklikl/a na úchyt buňky.</p>`,
        foot: `<button type="button" class="btn btn-primary btn-sm" data-go>Zkopírovat dolů</button><label class="small"><input type="checkbox" data-f checked> ukazovat vzorce</label>`
      });
      this.filled = 1; this.done = false; this.render();
      this.querySelector("[data-go]").addEventListener("click", () => this.done ? this.reset() : this.run());
      this.querySelector("[data-f]").addEventListener("change", () => this.render());
    }
    reset() {
      this.filled = 1; this.done = false; this.render();
      this.querySelector("[data-go]").textContent = "Zkopírovat dolů";
      this.querySelector(".fill-msg").innerHTML = `V K5 je vzorec <code>=D5-E5</code>. Klikni na tlačítko, jako bys dvojklikl/a na úchyt buňky.`;
    }
    async run() {
      const b = this.querySelector("[data-go]"); b.disabled = true;
      for (let k = 1; k <= this.rows.length; k++) { this.filled = k; this.render(k - 1); await H.sleep(H.reduced() ? 0 : 280); }
      this.querySelector(".fill-msg").innerHTML = `Jeden vzorec, pět řádků. V každém řádku se odkazy posunuly o řádek dolů: <code>=D6-E6</code>, <code>=D7-E7</code>… Excel si nepamatuje „buňku D5“, ale „buňku o sedm sloupců vlevo ve stejném řádku“.`;
      this.done = true; b.textContent = "Znovu"; b.disabled = false;
    }
    render(flash) {
      const showF = this.querySelector("[data-f]").checked;
      this.querySelectorAll(".k").forEach((td, i) => {
        const r = this.rows[i];
        td.className = "k" + (i < this.filled ? " on" : "") + (i === flash ? " flash" : "");
        td.innerHTML = i < this.filled ? (showF ? `<code>=D${r[0]}-E${r[0]}</code>` : `${Number(r[4]) - r[5]}`) : "";
      });
    }
  }

  /* ---------- B4 vs. $B$4 ---------- */
  const PARAM = { 4: 0.85, 5: 3, 6: 2, 7: null, 8: null };
  const OCC = [[5, 0.592], [6, 0.917], [7, 0.15], [8, 0.95], [9, 0.64]];
  const pct = v => (v * 100).toFixed(1).replace(".", ",") + " %";
  class C4Anchor extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      H.shell(this, {
        title: "Co se stane po zkopírování dolů?", kind: "relativní vs. absolutní",
        body: `<div class="seg" role="group" aria-label="Typ odkazu">
            <button type="button" data-m="rel" aria-pressed="true">PARAMETRY!B4</button>
            <button type="button" data-m="abs" aria-pressed="false">PARAMETRY!$B$4</button></div>
          <div class="anchor-grid">
            <div class="xl-wrap"><table class="xl"><tr><th class="rn"></th><th>A</th><th>B</th></tr>
              <tr><td class="rn">4</td><td>Kritická obsazenost</td><td class="n p" data-p="4">85 %</td></tr>
              <tr><td class="rn">5</td><td>Spotřeba vody (l)</td><td class="n p" data-p="5">3</td></tr>
              <tr><td class="rn">6</td><td>Min. zásoba (dny)</td><td class="n p" data-p="6">2</td></tr>
              <tr><td class="rn">7</td><td></td><td class="n p" data-p="7"></td></tr>
              <tr><td class="rn">8</td><td></td><td class="n p" data-p="8"></td></tr></table><p class="small muted mb-0">list PARAMETRY</p></div>
            <div class="xl-wrap"><table class="xl res"><tr><th class="rn"></th><th>L</th><th>M</th></tr><tbody></tbody></table><p class="small muted mb-0">list CENTRA</p></div>
          </div><p class="anchor-msg mb-0"></p>`
      });
      this.mode = "rel";
      this.querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => {
        this.mode = b.dataset.m; this.querySelectorAll("[data-m]").forEach(x => x.setAttribute("aria-pressed", x === b)); this.render();
      }));
      this.addEventListener("mouseover", e => { const tr = e.target.closest("tr[data-ref]"); this.hl(tr ? Number(tr.dataset.ref) : null); });
      this.addEventListener("focusin", e => { const tr = e.target.closest("tr[data-ref]"); this.hl(tr ? Number(tr.dataset.ref) : null); });
      this.render();
    }
    hl(ref) { this.querySelectorAll(".p").forEach(td => td.classList.toggle("hit", Number(td.dataset.p) === ref)); }
    render() {
      const abs = this.mode === "abs";
      let wrong = 0;
      this.querySelector(".res tbody").innerHTML = OCC.map(([r, v], i) => {
        const ref = abs ? 4 : 4 + i, p = PARAM[ref] ?? 0;
        const got = v >= p ? "KRITICKÉ" : "OK", right = v >= 0.85 ? "KRITICKÉ" : "OK";
        if (got !== right) wrong++;
        return `<tr data-ref="${ref}" tabindex="0"><td class="rn">${r}</td><td class="n">${pct(v)}</td><td class="${got === right ? "good" : "bad"}"><code>=KDYŽ(L${r}>=PARAMETRY!${abs ? "$B$4" : "B" + ref};…)</code><b>${got}</b></td></tr>`;
      }).join("");
      this.querySelector(".anchor-msg").innerHTML = abs
        ? `<b>Správně.</b> Dolary odkaz „přišpendlí“. Všechny řádky se dívají do B4, ať jsou kdekoli.`
        : `<b>${wrong} z 5 výsledků je špatně, a zbytek sedí jen náhodou.</b> Bez dolarů se při kopírování posunul i odkaz na parametr: řádek 6 porovnává s B5 (spotřeba vody), řádek 9 s prázdnou buňkou. Najeď myší na řádek a uvidíš, kam se dívá.`;
      this.hl(null);
    }
  }

  customElements.define("c4-grid", C4Grid);
  customElements.define("c4-fill", C4Fill);
  customElements.define("c4-anchor", C4Anchor);
})();

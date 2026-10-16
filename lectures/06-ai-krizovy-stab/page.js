/* =====================================================================
   Cvičení 6: vlastní interaktivní prvky stránky.
   <c6-anon>  příloha s osobními údaji: označ, co se musí odstranit, a uvidíš anonymní větu
   <c6-sms>   SMS pro obyvatele: počítadlo znaků a kontrola podstatného
   ===================================================================== */
(function () {
  "use strict";
  const H = window.ZIT_helpers;
  const { esc, LS } = H;

  /* ---------- anonymizace ---------- */
  // [text, kategorie] ; kategorie null = ponechat (potřeba)
  const ROWS = [
    [["Jiřina Mlynářová", "jméno"], ["nar. 1938", "věk"], ["K Mlýnu 7, Habrová", "adresa"], ["diabetes", "diagnóza"], ["inzulin do 12:00", null], ["+420 000 400 311", "telefon"]],
    [["Václav Potočný", "jméno"], ["nar. 1952", "věk"], ["K Mlýnu 15, Habrová", "adresa"], ["diabetes", "diagnóza"], ["inzulin do 12:00", null], ["+420 000 400 312", "telefon"]],
    [["Anežka Brodská", "jméno"], ["8 let", "věk"], ["K Mlýnu 21, Habrová", "adresa"], ["astma", "diagnóza"], ["inhalátor", null], ["+420 000 400 313", "telefon"]],
    [["Karel Habr", "jméno"], ["nar. 1946", "věk"], ["Školní 4, Habrová", "adresa"], ["chodí s chodítkem", "diagnóza"], ["lůžko v přízemí", null], ["+420 000 400 314", "telefon"]]
  ];
  const NEED = ROWS.flat().filter(c => c[1]).length;
  class C6Anon extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      H.shell(this, {
        title: "Příloha od správce EC ZŠ Habrová", kind: "klikni na osobní údaje",
        body: `<div class="an-wrap"><table class="an mb-0"><thead><tr><th>Jméno</th><th>Věk</th><th>Adresa</th><th>Diagnóza</th><th>Potřeba</th><th>Telefon</th></tr></thead><tbody>${ROWS.map(r =>
          `<tr>${r.map(c => `<td><button type="button" class="ac" data-cat="${c[1] || ""}">${esc(c[0])}</button></td>`).join("")}</tr>`).join("")}</tbody></table></div>
          <p class="an-msg small mb-0" aria-live="polite"></p>
          <div class="an-out" hidden><span class="an-lbl">Do AI a do SITREP jde jen tohle:</span>V EC ZŠ Habrová jsou 4 osoby se zvláštními potřebami: 2 potřebují inzulin do 12:00, 1 dítě potřebuje inhalátor, 1 osoba s omezenou pohyblivostí potřebuje lůžko v přízemí.</div>`,
        foot: `<span class="zit-result mid" style="margin-left:0">Odstraněno 0 z ${NEED}</span><button type="button" class="btn btn-sm" data-all style="margin-left:auto">Anonymizovat vše</button>`
      });
      this.n = 0;
      this.addEventListener("click", e => {
        const b = e.target.closest(".ac"); if (b) this.mark(b);
        if (e.target.closest("[data-all]")) this.querySelectorAll(".ac").forEach(x => { if (x.dataset.cat) this.mark(x); });
      });
    }
    mark(b) {
      const msg = this.querySelector(".an-msg");
      if (!b.dataset.cat) { b.classList.add("keep"); msg.innerHTML = `<b>Tohle nech.</b> Potřeba („${esc(b.textContent)}“) je přesně to, co štáb potřebuje vědět. Bez jména nikoho neprozradí.`; return; }
      if (b.classList.contains("gone")) return;
      b.classList.add("gone"); b.setAttribute("aria-label", "odstraněno: " + b.dataset.cat); b.dataset.orig = b.textContent; b.textContent = b.dataset.cat;
      this.n++;
      const r = this.querySelector(".zit-result");
      r.textContent = `Odstraněno ${this.n} z ${NEED}`;
      if (b.dataset.cat === "diagnóza") msg.innerHTML = "<b>Diagnóza je zdravotní údaj.</b> Štáb nepotřebuje vědět, že má někdo cukrovku. Potřebuje vědět, že potřebuje inzulin.";
      else if (b.dataset.cat === "věk") msg.innerHTML = "<b>Věk</b> spolu s ulicí v malé obci prozradí konkrétního člověka.";
      else msg.textContent = "";
      if (this.n === NEED) { r.textContent = "Anonymizováno"; r.className = "zit-result ok"; this.querySelector(".an-out").hidden = false; this.querySelector("[data-all]").hidden = true; msg.textContent = ""; }
    }
  }

  /* ---------- SMS ---------- */
  const CHECKS = [
    ["Nejvýš 160 znaků", t => t.length > 0 && t.length <= 160],
    ["Kde: zmiňuje Habrovou nebo ulici", t => /habrov|k mlýnu|školní/i.test(t)],
    ["Co dělat: konkrétní pokyn (nechoďte, zůstaňte, vyhněte se…)", t => /nechoď|zůsta|vyhn|nevstupuj|opusť|přijďte|nejezd/i.test(t)],
    ["Kde víc informací (rozhlas, web, linka)", t => /rozhlas|web|linka|info|www/i.test(t)],
    ["Bez paniky: žádné „!!!“ ani VELKÁ PÍSMENA", t => !/!!|[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]{5,}/.test(t)],
    ["Bez jmen a neověřených čísel (22/31, hráz)", t => !/mlynář|potočn|brodsk|habr\b|31|22|hráz/i.test(t)]
  ];
  class C6Sms extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      const saved = LS.get("zit.c6.sms", "");
      H.shell(this, {
        title: "SMS pro obyvatele Habrové", kind: "vyzkoušej",
        body: `<div class="phone"><label for="c6sms" class="visually-hidden">Text SMS</label><textarea id="c6sms" rows="4" placeholder="Napiš nebo vlož SMS…">${esc(saved)}</textarea><div class="ph-count"><span class="n">0</span> / 160</div></div>
          <ul class="sms-checks">${CHECKS.map((c, i) => `<li data-i="${i}">${esc(c[0])}</li>`).join("")}</ul>`,
        foot: `<button type="button" class="btn btn-sm" data-ex>Ukázat vzor</button><span class="zit-result"></span>`
      });
      const ta = this.querySelector("textarea");
      ta.addEventListener("input", () => this.render());
      this.querySelector("[data-ex]").addEventListener("click", () => { ta.value = "Habrová: potok stoupá, kulminace 10-11 h. Nechoďte do ul. K Mlýnu a na most Školní. EC ZŠ Habrová otevřeno. Info: rozhlas, web obce."; this.render(); });
      this.render();
    }
    render() {
      const t = this.querySelector("textarea").value.trim();
      LS.set("zit.c6.sms", t);
      const n = this.querySelector(".ph-count");
      n.querySelector(".n").textContent = t.length; n.classList.toggle("over", t.length > 160);
      let ok = 0;
      this.querySelectorAll(".sms-checks li").forEach(li => { const pass = !!t && CHECKS[Number(li.dataset.i)][1](t); li.classList.toggle("pass", pass); if (pass) ok++; });
      const r = this.querySelector(".zit-result");
      r.textContent = t ? `${ok} z ${CHECKS.length}` : ""; r.className = "zit-result " + (ok === CHECKS.length ? "ok" : "mid");
    }
  }

  customElements.define("c6-anon", C6Anon);
  customElements.define("c6-sms", C6Sms);
})();

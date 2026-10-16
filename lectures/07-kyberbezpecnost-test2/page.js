/* =====================================================================
   Cvičení 7: vlastní interaktivní prvky stránky. Data: data.js (window.C7_DATA,
   generuje teacher/07/build-package.py, stejný zdroj jako PDF v balíčku).
   <c7-inbox>   osm zpráv: v pořádku, nebo podvod? + signály
   <c7-cases>   pět situací: účet, MFA, falešný hlas, Wi-Fi, aktualizace
   <c7-layers>  deset kartiček: ve které vrstvě je problém
   ===================================================================== */
(function () {
  "use strict";
  const H = window.ZIT_helpers;
  const { esc, LS } = H;
  const D = window.C7_DATA || { messages: [], cases: [], cards: [], layers: [], signals: {} };

  /* ---------- schránka ---------- */
  class C7Inbox extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      this.ans = LS.get("zit.c7.inbox", {});
      this.cur = 0;
      H.shell(this, {
        title: "Doručená pošta · pondělí 14. 12. ráno", kind: "rozhodni",
        body: `<div class="inbox"><ul class="ib-list" role="listbox" aria-label="Zprávy">${D.messages.map((m, i) =>
          `<li><button type="button" class="ib-item" data-i="${i}"><span class="ib-from">${esc(m.from.replace(/\s*<.*$/, ""))}</span><span class="ib-subj">${esc(m.subj)}</span><span class="ib-meta">${esc(m.ch)} · ${esc(m.time)}</span><span class="ib-mark"></span></button></li>`).join("")}</ul>
          <div class="ib-view" aria-live="polite"></div></div>`,
        foot: `<span class="zit-result" style="margin-left:0"></span>`
      });
      this.addEventListener("click", e => {
        const it = e.target.closest(".ib-item"); if (it) { this.cur = Number(it.dataset.i); this.render(); }
        const v = e.target.closest("[data-v]"); if (v) { this.ans[this.cur] = v.dataset.v === "ok"; LS.set("zit.c7.inbox", this.ans); this.render(); }
        const nx = e.target.closest("[data-next]"); if (nx) { this.cur = Math.min(D.messages.length - 1, this.cur + 1); this.render(); }
      });
      this.render();
    }
    render() {
      this.querySelectorAll(".ib-item").forEach((b, i) => {
        b.classList.toggle("on", i === this.cur);
        const a = this.ans[i], m = D.messages[i], mk = b.querySelector(".ib-mark");
        b.classList.remove("good", "bad");
        if (a === undefined) { mk.textContent = ""; return; }
        b.classList.add(a === m.ok ? "good" : "bad"); mk.textContent = a === m.ok ? "✓" : "✗";
      });
      const m = D.messages[this.cur], a = this.ans[this.cur];
      const decided = a !== undefined;
      this.querySelector(".ib-view").innerHTML = `
        <div class="msg"><div class="msg-h"><div><b>Od:</b> ${esc(m.from)}</div><div><b>Předmět:</b> ${esc(m.subj)}</div><div class="faint">${esc(m.ch)} · ${esc(m.time)}</div></div>
          <div class="msg-b">${m.body.map(p => `<p>${esc(p)}</p>`).join("")}${m.extra ? `<p class="msg-x">${esc(m.extra)}</p>` : ""}</div></div>
        <div class="msg-act"><button type="button" class="btn btn-sm ${decided && a ? "pick" : ""}" data-v="ok">V pořádku</button><button type="button" class="btn btn-sm ${decided && !a ? "pick" : ""}" data-v="bad">Podvod</button>
          ${this.cur < D.messages.length - 1 ? `<button type="button" class="btn btn-sm" data-next style="margin-left:auto">Další zpráva →</button>` : ""}</div>
        ${decided ? `<div class="msg-fb ${a === m.ok ? "good" : "bad"}"><b>${a === m.ok ? "Správně." : "Ne."} ${m.ok ? "Zpráva je v pořádku." : "Je to podvod."}</b> ${esc(m.why)}
          ${m.sig.length ? `<div class="sigs">${m.sig.map(s => `<span>${esc(D.signals[s])}</span>`).join("")}</div>` : ""}</div>` : ""}`;
      const n = Object.keys(this.ans).length, ok = Object.entries(this.ans).filter(([i, v]) => D.messages[i].ok === v).length;
      const r = this.querySelector(".zit-result");
      r.textContent = n ? `Rozhodnuto ${n} z ${D.messages.length}, správně ${ok}` : "Klikni na zprávu a rozhodni.";
      r.className = "zit-result " + (n === D.messages.length ? (ok === n ? "ok" : "mid") : "");
    }
  }

  /* ---------- situace ---------- */
  class C7Cases extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      this.innerHTML = `<ol class="cases">${D.cases.map((c, i) => `<li data-i="${i}"><p class="q">${esc(c.q)}</p><div class="opts">${c.opts.map((o, k) =>
        `<button type="button" class="btn btn-sm" data-k="${k}">${esc(o[0])}</button>`).join("")}</div><p class="fb small" hidden></p></li>`).join("")}</ol>`;
      this.addEventListener("click", e => {
        const b = e.target.closest("[data-k]"); if (!b) return;
        const li = b.closest("li"), c = D.cases[Number(li.dataset.i)], ok = c.opts[Number(b.dataset.k)][1];
        li.querySelectorAll("[data-k]").forEach(x => x.classList.remove("right", "miss"));
        b.classList.add(ok ? "right" : "miss");
        const fb = li.querySelector(".fb"); fb.hidden = false; fb.innerHTML = `<b>${ok ? "Ano." : "Raději ne."}</b> ${esc(c.why)}`;
      });
    }
  }

  /* ---------- vrstvy ---------- */
  class C7Layers extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      this.k = 0; this.done = LS.get("zit.c7.layers", {});
      H.shell(this, {
        title: "Kde je problém?", kind: "kartička 1 z " + D.cards.length,
        body: `<div class="layers-wrap"><ol class="layers" reversed>${D.layers.map((l, i) => `<li><button type="button" class="lay" data-l="${i}"><span class="ln">${i + 1}</span>${esc(l)}</button></li>`).reverse().join("")}</ol>
          <div class="card-q"><div class="cq-n"></div><p class="cq-t"></p><div class="cq-fb" aria-live="polite"></div></div></div>`,
        foot: `<button type="button" class="btn btn-sm" data-prev>← Předchozí</button><button type="button" class="btn btn-primary btn-sm" data-next>Další kartička →</button><span class="zit-result"></span>`
      });
      this.querySelectorAll(".lay").forEach(b => b.addEventListener("click", () => this.pick(Number(b.dataset.l))));
      this.querySelector("[data-next]").addEventListener("click", () => { this.k = (this.k + 1) % D.cards.length; this.render(); });
      this.querySelector("[data-prev]").addEventListener("click", () => { this.k = (this.k - 1 + D.cards.length) % D.cards.length; this.render(); });
      this.render();
    }
    pick(l) {
      const c = D.cards[this.k], ok = l === c.layer;
      this.querySelectorAll(".lay").forEach(b => { const i = Number(b.dataset.l); b.classList.toggle("right", i === c.layer && ok); b.classList.toggle("miss", i === l && !ok); });
      const fb = this.querySelector(".cq-fb");
      fb.innerHTML = ok ? `<p class="mb-0"><b>Ano: ${esc(D.layers[c.layer])}.</b></p><dl><dt>Nejdřív</dt><dd>${esc(c.first)}</dd><dt>Nedělej</dt><dd>${esc(c.dont)}</dd><dt>IT kdy</dt><dd>${esc(c.it)}</dd></dl>`
        : `<p class="mb-0"><b>Spíš ne.</b> Zkus jinou vrstvu. Co by muselo fungovat, aby problém nastal právě takhle?</p>`;
      if (ok) { this.done[this.k] = true; LS.set("zit.c7.layers", this.done); }
      this.score();
    }
    render() {
      const c = D.cards[this.k];
      this.querySelector(".zit-head .kind").textContent = `kartička ${this.k + 1} z ${D.cards.length}`;
      this.querySelector(".cq-n").textContent = `Kartička ${this.k + 1}`;
      this.querySelector(".cq-t").textContent = c.q;
      this.querySelector(".cq-fb").innerHTML = "";
      this.querySelectorAll(".lay").forEach(b => b.classList.remove("right", "miss"));
      this.score();
    }
    score() {
      const n = Object.keys(this.done).length, r = this.querySelector(".zit-result");
      r.textContent = `Vyřešeno ${n} z ${D.cards.length}`; r.className = "zit-result " + (n === D.cards.length ? "ok" : "mid");
    }
  }

  customElements.define("c7-inbox", C7Inbox);
  customElements.define("c7-cases", C7Cases);
  customElements.define("c7-layers", C7Layers);
})();

/* =====================================================================
   zit.js: sdílené interaktivní prvky stránek cvičení. Bez závislostí.
   Konfigurace je <script type="application/json"> uvnitř prvku.

   <zit-mission key="l2">            krokovač: jeden krok na obrazovce, šipky, #krok-N
     <section class="ms-step" id="krok-1" data-short="…" data-min="10"><h2>…</h2>…</section>
   <zit-done key="…" label="…">      zaškrtávátko „Hotovo“ (localStorage)
   <zit-reveal label="…">…           skrytý obsah na kliknutí
   <zit-ribbon> + JSON               maketa pásu karet Wordu se zvýrazněným tlačítkem
   <zit-compare start="40">          posuvník před/po: první dítě = před, druhé = po
   <zit-folder-story> + JSON         chaos ve složce → „Ukliď to“
   <zit-sync-story>                  příběh: synchronizace není záloha
   <zit-ai-reveal> + JSON            odpověď AI se vypíše, pak se odhalí chyby
   <zit-prompt-builder key="…"> + JSON
   <zit-exit-ticket key="…"> + JSON  e-mail vyučujícímu (mailto) s odpověďmi a názvy příloh
   ===================================================================== */
(function () {
  "use strict";
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const readJSON = el => { const s = el.querySelector(":scope > script[type='application/json']"); if (!s) return {}; try { return JSON.parse(s.textContent); } catch (e) { console.error("zit: neplatný JSON v", el, e); return {}; } };
  const shell = (el, { ico, title, kind, body, foot }) => {
    el.classList.add("zit");
    el.innerHTML = `<div class="zit-head"><span>${esc(title)}</span>${kind ? `<span class="kind">${esc(kind)}</span>` : ""}</div><div class="zit-body">${body}</div>${foot ? `<div class="zit-foot">${foot}</div>` : ""}`;
  };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const onVisible = (el, cb, threshold = .35) => {
    if (!("IntersectionObserver" in window)) { cb(); return; }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); cb(); } }, { threshold });
    io.observe(el);
  };
  const fileIcon = ext => `<span class="fi fi-${esc(ext)}">${esc(ext)}</span>`;
  const slug = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

  /* ---------- zit-done ---------- */
  class ZitDone extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      const key = this.getAttribute("key") || ("auto-" + location.pathname + "#" + [...document.querySelectorAll("zit-done")].indexOf(this));
      const id = "done-" + key.replace(/[^a-z0-9]/gi, "-");
      this.innerHTML = `<label for="${id}"><input type="checkbox" id="${id}"> <span>${esc(this.getAttribute("label") || "Hotovo")}</span></label>`;
      const cb = this.querySelector("input");
      cb.checked = !!LS.get("zit.done." + key, false);
      cb.addEventListener("change", () => { LS.set("zit.done." + key, cb.checked); this.dispatchEvent(new CustomEvent("zit-done", { bubbles: true })); });
    }
    get checked() { const i = this.querySelector("input"); return !!(i && i.checked); }
  }

  /* ---------- zit-mission (krokovač) ---------- */
  class ZitMission extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      this.key = this.getAttribute("key") || "mission";
      this.steps = [...this.querySelectorAll(":scope > .ms-step")];
      const N = this.steps.length;
      this.steps.forEach((s, i) => {
        s.id = s.id || `krok-${i + 1}`;
        const h2 = s.querySelector(":scope > h2");
        const head = document.createElement("div");
        head.className = "step-head";
        head.innerHTML = `<span class="num">${i + 1}</span><div><div class="of">Krok ${i + 1} z ${N}</div></div>${s.dataset.min ? `<span class="badge min">≈ ${esc(s.dataset.min)} min</span>` : ""}`;
        if (h2) head.querySelector("div").appendChild(h2);
        s.prepend(head);
      });
      const nav = document.createElement("div");
      nav.className = "ms-nav";
      nav.innerHTML = `<div class="ms-pills" role="tablist" aria-label="Kroky cvičení">${this.steps.map((s, i) =>
        `<button type="button" class="ms-pill" data-i="${i}" role="tab"><span class="n"><span>${i + 1}</span></span>${esc(s.dataset.short || (s.querySelector("h2") || {}).textContent || `Krok ${i + 1}`)}</button>`).join("")}</div>
        <div class="ms-bar" aria-hidden="true"><span></span></div>`;
      this.prepend(nav);
      const foot = document.createElement("div");
      foot.className = "ms-foot";
      foot.innerHTML = `<button type="button" class="btn" data-go="-1">← Zpět</button><span class="where"></span><button type="button" class="btn btn-primary" data-go="1">Další krok →</button>`;
      this.appendChild(foot);
      const toggle = document.createElement("button");
      toggle.type = "button"; toggle.className = "ms-toggle"; toggle.textContent = "Zobrazit všechny kroky pod sebou";
      this.appendChild(toggle);

      nav.addEventListener("click", e => { const b = e.target.closest(".ms-pill"); if (b) this.go(Number(b.dataset.i), true); });
      foot.addEventListener("click", e => { const b = e.target.closest("[data-go]"); if (b) this.go(this.i + Number(b.dataset.go), true); });
      toggle.addEventListener("click", () => {
        this.classList.toggle("show-all");
        toggle.textContent = this.classList.contains("show-all") ? "Zpět na jeden krok" : "Zobrazit všechny kroky pod sebou";
        if (!this.classList.contains("show-all")) this.go(this.i, true);
      });
      document.addEventListener("keydown", e => {
        if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || this.classList.contains("show-all")) return;
        const t = e.target;
        if (t && t.closest && t.closest("input, textarea, select, button, [contenteditable]")) return;
        if (e.key === "ArrowRight") { this.go(this.i + 1, true); }
        if (e.key === "ArrowLeft") { this.go(this.i - 1, true); }
      });
      window.addEventListener("hashchange", () => this.fromHash(true));
      this.addEventListener("zit-done", () => this.update());

      if (!this.fromHash(false)) this.go(Math.min(LS.get("zit.ms." + this.key, 0), N - 1), false);
      setTimeout(() => this.update(), 0);
    }
    fromHash(scroll) {
      const m = /^#krok-(\d+)$/.exec(location.hash);
      if (!m) {
        const t = location.hash && this.querySelector(location.hash);
        const s = t && t.closest(".ms-step");
        if (s) { this.go(this.steps.indexOf(s), false); if (scroll) t.scrollIntoView(); return true; }
        return false;
      }
      this.go(Number(m[1]) - 1, scroll); return true;
    }
    go(i, scroll) {
      const N = this.steps.length;
      i = Math.max(0, Math.min(N - 1, i));
      this.i = i;
      this.steps.forEach((s, k) => s.classList.toggle("is-on", k === i));
      this.querySelectorAll(".ms-pill").forEach((p, k) => p.toggleAttribute("aria-current", false) || (k === i && p.setAttribute("aria-current", "step")));
      const cur = this.querySelector(`.ms-pill[data-i="${i}"]`);
      if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: "nearest", inline: "center" });
      const foot = this.querySelector(".ms-foot");
      foot.querySelector(".where").textContent = `Krok ${i + 1} z ${N}`;
      const prev = foot.querySelector('[data-go="-1"]'), next = foot.querySelector('[data-go="1"]');
      prev.style.visibility = i === 0 ? "hidden" : "visible";
      next.hidden = i === N - 1;
      if (i < N - 1) next.textContent = `Další: ${this.steps[i + 1].dataset.short || "krok " + (i + 2)} →`;
      LS.set("zit.ms." + this.key, i);
      if (history.replaceState) history.replaceState(null, "", "#krok-" + (i + 1));
      if (scroll) {
        const top = this.getBoundingClientRect().top + window.scrollY - 70;
        if (window.scrollY > top || this.getBoundingClientRect().top > window.innerHeight * .6) window.scrollTo({ top, behavior: reduced() ? "auto" : "smooth" });
      }
      this.dispatchEvent(new CustomEvent("zit-step", { detail: { i }, bubbles: true }));
    }
    update() {
      let done = 0;
      this.steps.forEach((s, k) => {
        const d = [...s.querySelectorAll("zit-done")];
        const ok = d.length && d.every(x => x.checked);
        if (ok) done++;
        const p = this.querySelector(`.ms-pill[data-i="${k}"]`);
        if (p) p.classList.toggle("done", !!ok);
      });
      this.querySelector(".ms-bar > span").style.width = Math.round(done / this.steps.length * 100) + "%";
    }
  }

  /* ---------- zit-reveal ---------- */
  class ZitReveal extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      const label = this.getAttribute("label") || "Zobrazit";
      const content = this.innerHTML;
      this.innerHTML = `<button type="button" class="btn btn-sm rv-btn" aria-expanded="false">${esc(label)}</button><div class="rv-body" hidden>${content}</div>`;
      const b = this.querySelector(".rv-btn"), body = this.querySelector(".rv-body");
      b.addEventListener("click", () => { body.hidden = !body.hidden; b.setAttribute("aria-expanded", !body.hidden); b.textContent = body.hidden ? label : (this.getAttribute("label-open") || "Skrýt"); });
    }
  }

  /* ---------- zit-ribbon (maketa Wordu) ---------- */
  const TABS = { word: ["Soubor", "Domů", "Vložení", "Návrh", "Rozložení", "Reference", "Korespondence", "Revize", "Zobrazení"], excel: ["Soubor", "Domů", "Vložení", "Rozložení stránky", "Vzorce", "Data", "Revize", "Zobrazení"] };
  class ZitRibbon extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      const c = readJSON(this);
      const app = c.app || "word";
      const tabs = TABS[app] || TABS.word;
      const item = (it, isStyle) => {
        const o = typeof it === "string" ? { t: it } : it;
        return `<div class="rb-item ${isStyle ? "style" : ""} ${o.hl ? "hl" : ""}">${o.i ? `<span class="i" aria-hidden="true">${esc(o.i)}</span>` : ""}<span>${esc(o.t)}</span></div>`;
      };
      const groups = (c.groups || []).map(g => `<div class="rb-group ${g.hl ? "hl" : ""}"><div class="rb-items">${(g.items || []).map(it => item(it, !!g.styles)).join("")}</div><div class="rb-gname">${esc(g.name)}</div></div>`).join("");
      this.innerHTML = `<div class="ribbon" role="img" aria-label="${esc((c.path || []).join(", "))}">
        <div class="rb-title"><span>${esc(c.file || "sitrep.docx")} · ${app === "excel" ? "Excel" : "Word"}</span><span aria-hidden="true">— ☐ ✕</span></div>
        <div class="rb-tabs">${tabs.map(t => `<span class="rb-tab ${t === c.tab ? "on" : ""} ${t === c.tab && c.hlTab ? "hl" : ""}">${esc(t)}</span>`).join("")}</div>
        <div class="rb-panel">${groups}</div>
        ${c.path ? `<div class="rb-path"><span class="path">${c.path.map(p => `<span>${esc(p)}</span>`).join("")}</span>${c.keys ? `<span class="faint">nebo</span> ${c.keys.map(k => `<kbd>${esc(k)}</kbd>`).join("+")}` : ""}${c.note ? `<span class="faint">${esc(c.note)}</span>` : ""}</div>` : ""}
      </div>`;
    }
  }

  /* ---------- zit-compare (před / po) ---------- */
  class ZitCompare extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      const kids = [...this.children].filter(k => k.tagName !== "SCRIPT");
      if (kids.length < 2) return;
      const start = Number(this.getAttribute("start") || 50);
      const wrap = document.createElement("div");
      wrap.className = "compare";
      const a = document.createElement("div"); a.className = "layer before-layer"; a.appendChild(kids[0]);
      const b = document.createElement("div"); b.className = "layer after-layer"; b.appendChild(kids[1]); b.setAttribute("aria-hidden", "true");
      wrap.append(a, b);
      wrap.insertAdjacentHTML("beforeend", `<span class="tag l">${esc(this.getAttribute("left") || "Před")}</span><span class="tag r">${esc(this.getAttribute("right") || "Po")}</span><div class="handle"></div><input type="range" min="0" max="100" value="${start}" aria-label="Posuvník: vlevo ${esc(this.getAttribute("left") || "před")}, vpravo ${esc(this.getAttribute("right") || "po")}">`);
      this.innerHTML = ""; this.appendChild(wrap);
      const range = wrap.querySelector("input");
      const set = v => { wrap.style.setProperty("--p", v / 100); b.style.setProperty("--pos", v + "%"); };
      range.addEventListener("input", () => set(range.value));
      set(start);
    }
  }

  /* ---------- zit-folder-story ---------- */
  class ZitFolderStory extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      const cfg = this.cfg = readJSON(this);
      this.files = cfg.files || []; this.folders = cfg.folders || [];
      const body = `
        <div class="fs-stage">
          <div class="fs-chaos">${this.files.map((f, i) => `<div class="file fs-file" data-i="${i}" style="--r:${((i * 37) % 11) - 5}deg;--d:${(i * 131) % 900}ms">${fileIcon(f.ext)}${esc(f.n)}</div>`).join("")}</div>
          <div class="fs-folders" hidden>${this.folders.map((n, i) => `<div class="fs-folder" data-f="${i}"><div class="fs-folder-name">📁 ${esc(n)}</div><div class="fs-folder-items"></div></div>`).join("")}</div>
        </div><p class="fs-caption">${cfg.before || ""}</p>`;
      shell(this, { ico: "🌪", title: cfg.title || "Složka od kolegy", body, foot: `<button type="button" class="btn btn-primary btn-sm" data-act="tidy">Ukliď to</button><button type="button" class="btn btn-sm" data-act="reset" hidden>Znovu rozházet</button>` });
      this.querySelector("[data-act=tidy]").addEventListener("click", () => this.tidy());
      this.querySelector("[data-act=reset]").addEventListener("click", () => this.reset());
    }
    async tidy() {
      const stage = this.querySelector(".fs-stage"), chaos = this.querySelector(".fs-chaos"), folders = this.querySelector(".fs-folders");
      const els = [...this.querySelectorAll(".fs-file")];
      const first = els.map(e => e.getBoundingClientRect());
      this.querySelector("[data-act=tidy]").hidden = true;
      folders.hidden = false; chaos.classList.add("fs-gone");
      els.forEach((e, i) => { e.style.setProperty("--r", "0deg"); folders.querySelector(`[data-f="${this.files[i].f}"] .fs-folder-items`).appendChild(e); });
      const last = els.map(e => e.getBoundingClientRect());
      if (!reduced()) {
        els.forEach((e, i) => { e.style.transition = "none"; e.style.transform = `translate(${first[i].left - last[i].left}px,${first[i].top - last[i].top}px)`; });
        stage.getBoundingClientRect();
        for (const e of els) { e.style.transition = "transform .6s cubic-bezier(.2,.8,.2,1)"; e.style.transform = "none"; await sleep(45); }
      }
      this.querySelector(".fs-caption").innerHTML = this.cfg.after || "";
      this.querySelector("[data-act=reset]").hidden = false;
    }
    reset() {
      const chaos = this.querySelector(".fs-chaos");
      [...this.querySelectorAll(".fs-file")].sort((a, b) => a.dataset.i - b.dataset.i).forEach(e => { e.style.transition = ""; e.style.transform = ""; e.style.setProperty("--r", `${((e.dataset.i * 37) % 11) - 5}deg`); chaos.appendChild(e); });
      chaos.classList.remove("fs-gone"); this.querySelector(".fs-folders").hidden = true;
      this.querySelector(".fs-caption").innerHTML = this.cfg.before || "";
      this.querySelector("[data-act=tidy]").hidden = false; this.querySelector("[data-act=reset]").hidden = true;
    }
  }

  /* ---------- zit-sync-story ---------- */
  class ZitSyncStory extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      const body = `<div class="sync-sim"><div class="devices">
          <div class="dev" data-d="pc"><h5>💻 Notebook</h5><span class="doc">zprava_v01.docx</span></div>
          <div class="dev" data-d="cloud"><h5>☁️ OneDrive</h5><span class="doc">zprava_v01.docx</span></div>
          <div class="dev" data-d="bak"><h5>💾 Záloha</h5><span class="doc">zprava_v01.docx</span></div>
        </div><div class="log">Stiskni Přehrát a sleduj, co se stane se souborem na každém místě.</div></div>`;
      shell(this, { ico: "🎬", title: "Synchronizace není záloha", body, foot: `<button type="button" class="btn btn-primary btn-sm" data-act="play">▶ Přehrát</button><span class="zit-result sync-step"></span>` });
      this.querySelector("[data-act=play]").addEventListener("click", () => this.play());
    }
    set(d, cls, txt) { const el = this.querySelector(`[data-d=${d}] .doc`); el.className = "doc " + cls; el.textContent = txt; }
    async play() {
      const btn = this.querySelector("[data-act=play]"), log = this.querySelector(".log"), step = this.querySelector(".sync-step");
      btn.disabled = true;
      const scenes = [
        ["ráno", () => { ["pc", "cloud", "bak"].forEach(d => this.set(d, "", "zprava_v01.docx")); }, "Ráno: stejná verze na notebooku, v OneDrive i v záloze z večera."],
        ["úprava", () => this.set("pc", "v2", "zprava_v02.docx"), "Upravíš zprávu na notebooku a uložíš ji jako v02."],
        ["synchronizace", () => { this.set("cloud", "v2", "zprava_v02.docx"); this.set("bak", "old", "zprava_v01.docx"); }, "OneDrive ji během vteřin zkopíruje. Záloha o ničem neví, má pořád v01."],
        ["smazání", () => this.set("pc", "gone", "zprava_v02.docx"), "Omylem soubor na notebooku smažeš. Stane se to každému."],
        ["synchronizace", () => this.set("cloud", "gone", "zprava_v02.docx"), "Synchronizace poslušně smaže i kopii v OneDrive."],
        ["obnova", () => { ["pc", "cloud", "bak"].forEach(d => this.set(d, "", "zprava_v01.docx")); }, "Ze zálohy dostaneš zpět v01. Ranní úpravy jsou pryč. Proto se zálohuje pravidelně a mimo synchronizaci."]
      ];
      for (const [name, act, text] of scenes) { step.textContent = name; act(); log.textContent = text; await sleep(reduced() ? 300 : 2600); }
      btn.disabled = false; btn.textContent = "▶ Přehrát znovu";
    }
  }

  /* ---------- zit-ai-reveal ---------- */
  class ZitAiReveal extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      const cfg = this.cfg = readJSON(this);
      this.s = cfg.sentences || [];
      const nBad = this.s.filter(x => x.bad).length;
      const body = `<div class="chat">
          <div class="chat-row me"><span class="chat-who">Ty</span><div class="chat-bubble">${cfg.prompt || ""}</div></div>
          <div class="chat-row ai"><span class="chat-who">AI</span><div class="chat-bubble ai-text"></div></div>
        </div><div class="reasons" hidden></div>`;
      shell(this, { ico: "🤖", title: cfg.title || "Odpověď AI", body, foot: `<button type="button" class="btn btn-primary btn-sm" data-act="reveal">${esc(cfg.button || `Ukázat ${nBad} problémy`)}</button><span class="zit-result"></span>` });
      this.querySelector(".ai-text").innerHTML = this.s.map((x, i) => `<span class="ai-s" data-i="${i}">${esc(x.t)}</span> `).join("");
      this.querySelector("[data-act=reveal]").addEventListener("click", () => this.reveal());
    }
    reveal() {
      const reasons = this.querySelector(".reasons"); reasons.innerHTML = ""; reasons.hidden = false;
      let k = 0;
      this.querySelectorAll(".ai-s").forEach(el => {
        const x = this.s[Number(el.dataset.i)];
        if (x.bad) { k++; el.classList.add("reveal-bad"); el.insertAdjacentHTML("beforeend", `<span class="stamp">${k}</span>`); const d = document.createElement("div"); d.innerHTML = `<b>${k}. ${esc(x.label || "Problém")}:</b> ${x.why || ""}`; reasons.appendChild(d); }
        else el.classList.add("reveal-ok");
      });
      this.querySelector("[data-act=reveal]").hidden = true;
      const r = this.querySelector(".zit-result"); r.innerHTML = this.cfg.after || ""; r.style.fontWeight = "600"; r.style.marginLeft = "0";
    }
  }

  /* ---------- zit-prompt-builder ---------- */
  class ZitPromptBuilder extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      const cfg = readJSON(this);
      const fields = cfg.fields || [];
      const key = this.getAttribute("key");
      const saved = key ? LS.get("zit.pb." + key, null) : null;
      const val = i => saved ? (saved[i] ?? "") : (cfg.prefill && cfg.example ? cfg.example[i] || "" : "");
      const body = `<div class="pb-grid">${fields.map((f, i) => `
          <div class="pb-field"><label for="pb-${key}-${i}">${esc(f.k)}<small>${esc(f.hint || "")}</small></label><textarea id="pb-${key}-${i}" data-k="${esc(f.k)}" placeholder="${esc(f.ph || "")}">${esc(val(i))}</textarea></div>`).join("")}</div>
        <div class="pb-out"><div class="row between" style="margin-bottom:.4rem"><strong>Výsledný prompt</strong><span class="small muted">zkopíruj a vlož do Copilotu</span></div><pre data-nocopy><code></code></pre></div>`;
      shell(this, {
        ico: "🧩", title: cfg.title || "Tvůrce promptu", kind: "6 kroků", body,
        foot: `<button type="button" class="btn btn-primary btn-sm" data-act="copy">Zkopírovat prompt</button>${cfg.example ? `<button type="button" class="btn btn-sm" data-act="example">Vložit vzor</button>` : ""}<button type="button" class="btn btn-sm" data-act="clear">Vymazat</button><a class="btn btn-sm" href="${esc((window.ZIT_COURSE || {}).copilotUrl || "https://m365.cloud.microsoft/chat")}" target="_blank" rel="noopener">Otevřít Copilot ↗</a>`
      });
      const tas = [...this.querySelectorAll("textarea")];
      const render = () => {
        const txt = tas.map(t => t.value.trim() ? `${t.dataset.k}:\n${t.value.trim()}` : "").filter(Boolean).join("\n\n");
        this.querySelector("code").textContent = txt || "(vyplň alespoň jedno pole)";
        if (key) LS.set("zit.pb." + key, tas.map(t => t.value));
      };
      tas.forEach(t => t.addEventListener("input", render));
      this.querySelector("[data-act=copy]").addEventListener("click", e => window.ZIT_copy(this.querySelector("code").textContent, e.currentTarget));
      this.querySelector("[data-act=clear]").addEventListener("click", () => { tas.forEach(t => t.value = ""); render(); });
      const ex = this.querySelector("[data-act=example]");
      if (ex) ex.addEventListener("click", () => { tas.forEach((t, i) => t.value = cfg.example[i] || ""); render(); });
      render();
    }
  }

  /* ---------- zit-exit-ticket (odevzdání e-mailem) ---------- */
  class ZitExitTicket extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      const cfg = readJSON(this);
      const key = this.getAttribute("key") || "exit";
      const to = (window.ZIT_COURSE || {}).teacher?.email || "";
      const qs = cfg.questions || [];
      const sv = LS.get("zit.exit." + key, {});
      const groupNow = sv.group || String((window.ZIT && window.ZIT.group.get()) || "");
      const body = `<div class="exit">
        <div class="grid cols-3" style="margin-bottom:.9rem">
          <div class="field mb-0"><label for="ex-${key}-sur">Příjmení</label><input id="ex-${key}-sur" data-f="sur" value="${esc(sv.sur || "")}" autocomplete="family-name"></div>
          <div class="field mb-0"><label for="ex-${key}-name">Jméno</label><input id="ex-${key}-name" data-f="name" value="${esc(sv.name || "")}" autocomplete="given-name"></div>
          <div class="field mb-0"><label for="ex-${key}-g">Paralelka</label><select id="ex-${key}-g" data-f="group"><option value="">vyber</option>${["1", "2", "3"].map(g => `<option ${groupNow === g ? "selected" : ""}>${g}</option>`).join("")}</select></div>
        </div>
        ${cfg.attach ? `<p class="small" style="margin-bottom:.4rem"><b>Přílohy pojmenuj přesně takhle:</b></p><ul class="attach"></ul>` : ""}
        ${qs.map((q, i) => `<div class="field"><label for="ex-${key}-${i}">${i + 1}. ${q}</label><textarea id="ex-${key}-${i}" data-i="${i}">${esc((sv.a || [])[i] || "")}</textarea></div>`).join("")}
        <p class="small muted mb-0">Tlačítko otevře e-mail s vyplněným adresátem, předmětem a odpověďmi. Přílohy do něj přetáhneš ručně. Když se e-mail neotevře, zkopíruj text a pošli ho z Outlooku.</p></div>`;
      shell(this, {
        ico: "✉️", title: cfg.title || "Odevzdání", kind: "e-mail", body,
        foot: `<a class="btn btn-primary btn-sm" data-act="mail" href="#">Otevřít e-mail</a><button type="button" class="btn btn-sm" data-act="copy">Zkopírovat text</button><span class="zit-result"></span>`
      });
      const $ = s => this.querySelector(s);
      const tas = [...this.querySelectorAll("textarea")];
      const fill = t => t.replaceAll("{date}", todayISO()).replaceAll("{prijmeni}", slug($("[data-f=sur]").value) || "prijmeni")
        .replaceAll("{Prijmeni}", $("[data-f=sur]").value.trim() || "Příjmení").replaceAll("{Jmeno}", $("[data-f=name]").value.trim() || "Jméno")
        .replaceAll("{group}", $("[data-f=group]").value || "X");
      const subject = () => fill(cfg.subject || "ZIT: {Prijmeni} {Jmeno} (par. {group})");
      const text = () => {
        const lines = [];
        if (cfg.attach) { lines.push("Přílohy:"); cfg.attach.forEach(a => lines.push("  " + fill(a))); lines.push(""); }
        qs.forEach((q, i) => lines.push(`${i + 1}. ${q.replace(/<[^>]+>/g, "")}`, tas[i].value.trim() || "(nevyplněno)", ""));
        if (cfg.footer) lines.push(fill(cfg.footer));
        return lines.join("\n");
      };
      const update = () => {
        LS.set("zit.exit." + key, { sur: $("[data-f=sur]").value, name: $("[data-f=name]").value, group: $("[data-f=group]").value, a: tas.map(t => t.value) });
        const ul = $(".attach"); if (ul) ul.innerHTML = cfg.attach.map(a => `<li>📎 ${esc(fill(a))}</li>`).join("");
        const ready = tas.every(t => t.value.trim()) && $("[data-f=sur]").value.trim() && $("[data-f=group]").value;
        const r = $(".zit-result"); r.textContent = ready ? "Připraveno k odeslání" : "Doplň jméno, paralelku a odpovědi"; r.className = "zit-result " + (ready ? "ok" : "mid");
        $("[data-act=mail]").href = `mailto:${to}?subject=${encodeURIComponent(subject())}&body=${encodeURIComponent(text())}`;
      };
      this.querySelectorAll("input, select, textarea").forEach(t => { t.addEventListener("input", update); t.addEventListener("change", update); });
      $("[data-act=copy]").addEventListener("click", e => window.ZIT_copy(`Komu: ${to}\nPředmět: ${subject()}\n\n${text()}`, e.currentTarget));
      update();
    }
  }

  const defs = { "zit-done": ZitDone, "zit-reveal": ZitReveal, "zit-ribbon": ZitRibbon, "zit-compare": ZitCompare,
    "zit-folder-story": ZitFolderStory, "zit-sync-story": ZitSyncStory, "zit-ai-reveal": ZitAiReveal,
    "zit-prompt-builder": ZitPromptBuilder, "zit-exit-ticket": ZitExitTicket, "zit-mission": ZitMission };
  Object.entries(defs).forEach(([n, c]) => { if (!customElements.get(n)) customElements.define(n, c); });
  window.ZIT_helpers = { LS, esc, readJSON, shell, sleep, reduced, onVisible, slug };
})();

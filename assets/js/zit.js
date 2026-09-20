/* =====================================================================
   zit.js – prvky, které na stránce cvičení vyprávějí příběh.
   Bez závislostí. Konfigurace je <script type="application/json"> uvnitř prvku.

   <zit-done key="lN-bX" label="…">        zaškrtávátko „Hotovo“ (uloží se v prohlížeči)
   <zit-reveal label="…">…</zit-reveal>    skrytý obsah na kliknutí
   <zit-gif id="…" caption="…">            GIF z GIPHY (lazy iframe) s popiskem
   <zit-folder-story> + JSON               chaotická složka, tlačítko „Ukliď to“, soubory odletí do složek
   <zit-typewriter> + JSON                 psací stroj: špatný název → dobrý název, dokola
   <zit-sync-story>                        přehrávaný příběh: úprava, smazání, záloha
   <zit-ai-reveal> + JSON                  odpověď AI se „vypíše“, pak se odhalí problémová místa
   <zit-prompt-builder key="…"> + JSON     skládání promptu v 6 krocích, kopírování
   <zit-exit-ticket key="…" to="…"> + JSON tři otázky, odpovědi se pošlou e-mailem (mailto) nebo zkopírují
   ===================================================================== */
(function () {
  "use strict";
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const readJSON = (el) => { const s = el.querySelector(":scope > script[type='application/json']"); if (!s) return {}; try { return JSON.parse(s.textContent); } catch (e) { console.error("zit: neplatný JSON v", el, e); return {}; } };
  const shell = (el, { ico, title, kind, body, foot }) => {
    el.classList.add("zit");
    el.innerHTML = `<div class="zit-head"><span class="ico">${ico}</span><span>${esc(title)}</span>${kind ? `<span class="kind">${kind}</span>` : ""}</div><div class="zit-body">${body}</div>${foot ? `<div class="zit-foot">${foot}</div>` : ""}`;
  };
  const fire = () => document.dispatchEvent(new CustomEvent("zit-progress", { bubbles: true }));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fileIcon = ext => `<span class="fi fi-${esc(ext)}">${esc(ext)}</span>`;
  const onVisible = (el, cb) => {
    if (!("IntersectionObserver" in window)) { cb(); return; }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); cb(); } }, { threshold: .35 });
    io.observe(el);
  };

  /* ---------- zit-done ---------- */
  class ZitDone extends HTMLElement {
    connectedCallback() {
      const key = this.getAttribute("key") || ("auto-" + location.pathname + "#" + [...document.querySelectorAll("zit-done")].indexOf(this));
      const label = this.getAttribute("label") || "Hotovo";
      const id = "done-" + key.replace(/[^a-z0-9]/gi, "-");
      this.innerHTML = `<label for="${id}"><input type="checkbox" id="${id}"> <span>${esc(label)}</span></label>`;
      const cb = this.querySelector("input");
      cb.checked = !!LS.get("zit.done." + key, false);
      cb.addEventListener("change", () => { LS.set("zit.done." + key, cb.checked); fire(); });
      fire();
    }
  }

  /* ---------- zit-reveal ---------- */
  class ZitReveal extends HTMLElement {
    connectedCallback() {
      const label = this.getAttribute("label") || "Zobrazit";
      const content = this.innerHTML;
      this.innerHTML = `<button type="button" class="btn btn-sm rv-btn">${esc(label)}</button><div class="rv-body" hidden>${content}</div>`;
      const b = this.querySelector(".rv-btn"), body = this.querySelector(".rv-body");
      b.addEventListener("click", () => { body.hidden = !body.hidden; b.textContent = body.hidden ? label : (this.getAttribute("label-open") || "Skrýt"); });
    }
  }

  /* ---------- zit-gif ---------- */
  class ZitGif extends HTMLElement {
    connectedCallback() {
      const id = this.getAttribute("id-gif") || this.getAttribute("gif");
      if (!id) return;
      const cap = this.getAttribute("caption") || "";
      this.innerHTML = `<figure class="gif"><div class="gif-frame"><iframe src="https://giphy.com/embed/${esc(id)}" title="${esc(cap || "GIF")}" loading="lazy" allowfullscreen referrerpolicy="no-referrer"></iframe></div>${cap ? `<figcaption>${cap} <a href="https://giphy.com/gifs/${esc(id)}" target="_blank" rel="noopener" class="gif-src">GIPHY</a></figcaption>` : ""}</figure>`;
    }
  }

  /* ---------- zit-folder-story ---------- */
  class ZitFolderStory extends HTMLElement {
    connectedCallback() {
      const cfg = readJSON(this);
      this.files = cfg.files || []; this.folders = cfg.folders || [];
      const body = `
        <div class="fs-stage">
          <div class="fs-chaos">${this.files.map((f, i) => `<div class="file fs-file" data-i="${i}" style="--r:${((i * 37) % 11) - 5}deg;--d:${(i * 131) % 900}ms">${fileIcon(f.ext)}${esc(f.n)}</div>`).join("")}</div>
          <div class="fs-folders" hidden>${this.folders.map((n, i) => `<div class="fs-folder" data-f="${i}"><div class="fs-folder-name">📁 ${esc(n)}</div><div class="fs-folder-items"></div></div>`).join("")}</div>
        </div>
        <p class="fs-caption">${cfg.before || ""}</p>`;
      shell(this, { ico: "🌪", title: cfg.title || "Složka, kterou ti nechal kolega", body, foot: `<button type="button" class="btn btn-primary btn-sm" data-act="tidy">Ukliď to</button><button type="button" class="btn btn-sm" data-act="reset" hidden>Znovu rozházet</button>` });
      this.cfg = cfg;
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
        els.forEach((e, i) => { const dx = first[i].left - last[i].left, dy = first[i].top - last[i].top; e.style.transition = "none"; e.style.transform = `translate(${dx}px,${dy}px) rotate(${((i * 37) % 11) - 5}deg)`; });
        stage.getBoundingClientRect();
        for (let i = 0; i < els.length; i++) { const e = els[i]; e.style.transition = "transform .6s cubic-bezier(.2,.8,.2,1)"; e.style.transform = "translate(0,0) rotate(0)"; await sleep(45); }
      }
      this.querySelector(".fs-caption").innerHTML = this.cfg.after || "";
      this.querySelector("[data-act=reset]").hidden = false;
    }
    reset() {
      const chaos = this.querySelector(".fs-chaos"), folders = this.querySelector(".fs-folders");
      [...this.querySelectorAll(".fs-file")].sort((a, b) => a.dataset.i - b.dataset.i).forEach(e => { e.style.transition = ""; e.style.transform = ""; e.style.setProperty("--r", `${((e.dataset.i * 37) % 11) - 5}deg`); chaos.appendChild(e); });
      chaos.classList.remove("fs-gone"); folders.hidden = true;
      this.querySelector(".fs-caption").innerHTML = this.cfg.before || "";
      this.querySelector("[data-act=tidy]").hidden = false; this.querySelector("[data-act=reset]").hidden = true;
    }
  }

  /* ---------- zit-typewriter ---------- */
  class ZitTypewriter extends HTMLElement {
    connectedCallback() {
      const cfg = readJSON(this);
      this.pairs = cfg.pairs || [];
      this.innerHTML = `<div class="tw"><div class="tw-row"><span class="tw-tag bad">${esc(cfg.badLabel || "takhle ne")}</span><code class="tw-text tw-bad"></code></div><div class="tw-row"><span class="tw-tag ok">${esc(cfg.goodLabel || "takhle ano")}</span><code class="tw-text tw-good"></code></div></div>`;
      if (this.pairs.length) this.loop();
    }
    async type(el, text) {
      el.textContent = ""; el.classList.add("typing");
      if (reduced()) { el.textContent = text; el.classList.remove("typing"); return; }
      for (const ch of text) { el.textContent += ch; await sleep(28 + Math.random() * 30); }
      el.classList.remove("typing");
    }
    async loop() {
      const bad = this.querySelector(".tw-bad"), good = this.querySelector(".tw-good");
      let i = 0;
      for (;;) {
        const [b, g] = this.pairs[i % this.pairs.length];
        good.textContent = "";
        await this.type(bad, b); await sleep(700);
        await this.type(good, g); await sleep(2600);
        i++;
        if (!this.isConnected) return;
      }
    }
  }

  /* ---------- zit-sync-story ---------- */
  class ZitSyncStory extends HTMLElement {
    connectedCallback() {
      const body = `
        <div class="sync-sim">
          <div class="devices">
            <div class="dev" data-d="pc"><h5>💻 Notebook</h5><span class="doc">zprava_v01.docx</span></div>
            <div class="dev" data-d="cloud"><h5>☁️ Cloud (OneDrive)</h5><span class="doc">zprava_v01.docx</span></div>
            <div class="dev" data-d="bak"><h5>💾 Záloha (externí disk)</h5><span class="doc">zprava_v01.docx</span></div>
          </div>
          <div class="log">Stiskni Přehrát a sleduj, co se stane se souborem na každém místě.</div>
        </div>`;
      shell(this, { ico: "🎬", title: "Synchronizace není záloha", body, foot: `<button type="button" class="btn btn-primary btn-sm" data-act="play">▶ Přehrát</button><span class="zit-result sync-step"></span>` });
      this.querySelector("[data-act=play]").addEventListener("click", () => this.play());
    }
    set(d, cls, txt) { const el = this.querySelector(`[data-d=${d}] .doc`); el.className = "doc " + cls; el.textContent = txt; }
    async play() {
      const btn = this.querySelector("[data-act=play]"), log = this.querySelector(".log"), step = this.querySelector(".sync-step");
      btn.disabled = true;
      const scenes = [
        ["v01 všude", () => { this.set("pc", "", "zprava_v01.docx"); this.set("cloud", "", "zprava_v01.docx"); this.set("bak", "", "zprava_v01.docx"); }, "Ráno: stejná verze na notebooku, v cloudu i v záloze z večera."],
        ["úprava", () => { this.set("pc", "v2", "zprava_v02.docx"); }, "Upravíš zprávu na notebooku a uložíš ji jako v02."],
        ["synchronizace", () => { this.set("cloud", "v2", "zprava_v02.docx"); this.set("bak", "old", "zprava_v01.docx"); }, "Cloud ji během vteřin zkopíruje. Záloha o ničem neví, má pořád v01."],
        ["smazání", () => { this.set("pc", "gone", "zprava_v02.docx"); }, "Omylem soubor na notebooku smažeš. Stane se to každému."],
        ["synchronizace", () => { this.set("cloud", "gone", "zprava_v02.docx"); }, "Synchronizace poslušně smaže i kopii v cloudu. Koš služby pomůže jen někdy a jen chvíli."],
        ["obnova", () => { this.set("pc", "", "zprava_v01.docx"); this.set("cloud", "", "zprava_v01.docx"); this.set("bak", "", "zprava_v01.docx"); }, "Ze zálohy dostaneš zpět v01. Ranní úpravy jsou pryč. Proto se zálohuje pravidelně a mimo synchronizaci."]
      ];
      for (const [name, act, text] of scenes) {
        step.textContent = name; act(); log.innerHTML = text;
        await sleep(reduced() ? 300 : 2600);
      }
      btn.disabled = false; btn.textContent = "▶ Přehrát znovu";
    }
  }

  /* ---------- zit-ai-reveal ---------- */
  class ZitAiReveal extends HTMLElement {
    connectedCallback() {
      const cfg = readJSON(this);
      this.s = cfg.sentences || [];
      const nBad = this.s.filter(x => x.bad).length;
      const body = `
        <div class="chat">
          <div class="chat-user"><span class="chat-who">Ty</span><div class="chat-bubble">${cfg.prompt || "Shrň mi tuhle zprávu."}</div></div>
          <div class="chat-ai"><span class="chat-who">AI</span><div class="chat-bubble ai-text"><span class="cursor"></span></div></div>
        </div>
        <div class="audit-reasons" hidden></div>`;
      shell(this, { ico: "🤖", title: cfg.title || "Odpověď AI, která zní dobře", body, foot: `<button type="button" class="btn btn-primary btn-sm" data-act="reveal">Odhalit ${nBad} problémy</button><span class="zit-result"></span>` });
      this.cfg = cfg; this.typed = false; this.skip = false;
      onVisible(this, () => this.typeOut());
      this.querySelector("[data-act=reveal]").addEventListener("click", () => { if (this.typed) this.reveal(); else { this.skip = true; if (!this.typing) this.typeOut(); } });
    }
    async typeOut() {
      if (this.typing) return; this.typing = true;
      const box = this.querySelector(".ai-text"); box.innerHTML = "";
      for (let i = 0; i < this.s.length; i++) {
        const span = document.createElement("span"); span.className = "ai-s"; span.dataset.i = i; box.appendChild(span);
        const t = this.s[i].t + " ";
        if (reduced() || this.skip) span.textContent = t;
        else { for (let k = 0; k < t.length; k += 2) { span.textContent += t.slice(k, k + 2); if (!this.isConnected) return; if (this.skip) { span.textContent = t; break; } await sleep(8); } }
      }
      this.typed = true; this.typing = false;
      if (this.skip) this.reveal();
    }
    reveal() {
      const reasons = this.querySelector(".audit-reasons"); reasons.innerHTML = ""; reasons.hidden = false;
      let k = 0;
      this.querySelectorAll(".ai-s").forEach(el => {
        const x = this.s[Number(el.dataset.i)];
        if (x.bad) { k++; el.classList.add("reveal-bad"); el.insertAdjacentHTML("beforeend", `<span class="stamp">${k}</span>`); const d = document.createElement("div"); d.innerHTML = `<b>${k}. ${esc(x.label || "Problém")}:</b> ${x.why || ""}`; reasons.appendChild(d); }
        else el.classList.add("reveal-ok");
      });
      this.querySelector("[data-act=reveal]").hidden = true;
      this.querySelector(".zit-result").innerHTML = this.cfg.after || "";
    }
  }

  /* ---------- zit-prompt-builder ---------- */
  class ZitPromptBuilder extends HTMLElement {
    connectedCallback() {
      const cfg = readJSON(this);
      const fields = cfg.fields || [];
      const key = this.getAttribute("key");
      const saved = key ? LS.get("zit.pb." + key, null) : null;
      const body = `
        <div class="pb-grid">${fields.map((f, i) => `
          <div class="pb-field"><label for="pb-${i}">${esc(f.k)}<small>${esc(f.hint || "")}</small></label><textarea id="pb-${i}" data-k="${esc(f.k)}" placeholder="${esc(f.ph || "")}">${esc(saved ? saved[i] ?? "" : f.v || "")}</textarea></div>`).join("")}
        </div>
        <div class="pb-out"><div class="flex between" style="margin-bottom:.4rem"><strong>Výsledný prompt</strong><span class="small muted">Zkopíruj a vlož do Copilotu</span></div><pre data-nocopy><code></code></pre></div>`;
      shell(this, {
        ico: "🧩", title: cfg.title || "Tvůrce promptu", kind: "6 kroků", body,
        foot: `<button type="button" class="btn btn-primary btn-sm" data-act="copy">Zkopírovat prompt</button>${cfg.example ? `<button type="button" class="btn btn-sm" data-act="example">Vložit vzor</button>` : ""}<button type="button" class="btn btn-sm" data-act="clear">Vymazat</button>${cfg.copilot !== false ? `<a class="btn btn-sm" href="${esc(cfg.copilotUrl || (window.ZIT_COURSE || {}).copilotUrl || "https://m365.cloud.microsoft/chat")}" target="_blank" rel="noopener">Otevřít Copilot ↗</a>` : ""}<span class="zit-result"></span>`
      });
      const tas = [...this.querySelectorAll("textarea")];
      const render = () => {
        const txt = tas.map(t => t.value.trim() ? `${t.dataset.k}:\n${t.value.trim()}` : "").filter(Boolean).join("\n\n");
        this.querySelector("code").textContent = txt || "(vyplň alespoň jedno pole)";
        if (key) LS.set("zit.pb." + key, tas.map(t => t.value));
        const filled = tas.filter(t => t.value.trim()).length;
        const r = this.querySelector(".zit-result"); r.textContent = `${filled} / ${tas.length} částí`; r.className = "zit-result " + (filled === tas.length ? "ok" : "mid");
      };
      tas.forEach(t => t.addEventListener("input", render));
      this.querySelector("[data-act=copy]").addEventListener("click", e => window.ZIT_copy(this.querySelector("code").textContent, e.currentTarget));
      this.querySelector("[data-act=clear]").addEventListener("click", () => { tas.forEach(t => t.value = ""); render(); });
      const ex = this.querySelector("[data-act=example]");
      if (ex) ex.addEventListener("click", () => { tas.forEach((t, i) => t.value = cfg.example[i] || ""); render(); });
      if (!saved && cfg.example && cfg.prefill) tas.forEach((t, i) => t.value = cfg.example[i] || "");
      render();
    }
  }

  /* ---------- zit-exit-ticket ---------- */
  class ZitExitTicket extends HTMLElement {
    connectedCallback() {
      const cfg = readJSON(this);
      const key = this.getAttribute("key") || "exit";
      const to = this.getAttribute("to") || (window.ZIT_COURSE || {}).teacher?.email || "";
      const qs = cfg.questions || [];
      const saved = LS.get("zit.exit." + key, {});
      const body = `<div class="exit">
        <div class="grid grid-2" style="margin-bottom:.9rem">
          <div class="field" style="margin:0"><label for="ex-${key}-name">Jméno a příjmení</label><input id="ex-${key}-name" type="text" data-f="name" value="${esc(saved.name || "")}" autocomplete="name"></div>
          <div class="field" style="margin:0"><label for="ex-${key}-group">Paralelka</label><select id="ex-${key}-group" data-f="group"><option value="">vyber</option><option ${saved.group === "1" ? "selected" : ""}>1</option><option ${saved.group === "2" ? "selected" : ""}>2</option><option ${saved.group === "3" ? "selected" : ""}>3</option></select></div>
        </div>
        ${qs.map((q, i) => `<div class="field"><label for="ex-${key}-${i}">${i + 1}. ${q}</label><textarea id="ex-${key}-${i}" data-i="${i}">${esc((saved.a || [])[i] || "")}</textarea></div>`).join("")}
        <p class="small muted" style="margin:0">Tlačítko otevře nový e-mail s vyplněným předmětem a odpověďmi. Ty už jen přiložíš ZIP a odešleš. Když se ti e-mail neotevře, zkopíruj text a pošli ho ručně.</p></div>`;
      shell(this, {
        ico: "✉️", title: cfg.title || "Exit ticket a odevzdání", kind: "e-mail", body,
        foot: `<a class="btn btn-primary btn-sm" data-act="mail" href="#">Otevřít e-mail s odpověďmi</a><button type="button" class="btn btn-sm" data-act="copy">Zkopírovat text</button><button type="button" class="btn btn-sm btn-ghost" data-act="clear">Vymazat</button><span class="zit-result"></span>`
      });
      const tas = [...this.querySelectorAll("textarea")], name = this.querySelector("[data-f=name]"), group = this.querySelector("[data-f=group]");
      const subject = () => (cfg.subject || "ZIT: cvičení").replace("{name}", name.value.trim() || "Jméno Příjmení").replace("{group}", group.value || "?");
      const bodyText = () => {
        const lines = [`${subject()}`, ""];
        qs.forEach((q, i) => { lines.push(`${i + 1}. ${q}`, tas[i].value.trim() || "(nevyplněno)", ""); });
        lines.push(cfg.footer || "");
        return lines.join("\n");
      };
      const update = () => {
        LS.set("zit.exit." + key, { name: name.value, group: group.value, a: tas.map(t => t.value) });
        const n = tas.filter(t => t.value.trim()).length;
        const r = this.querySelector(".zit-result"); r.textContent = `${n} / ${tas.length} odpovědí`; r.className = "zit-result " + (n === tas.length && name.value.trim() && group.value ? "ok" : "mid");
        this.querySelector("[data-act=mail]").href = `mailto:${to}?subject=${encodeURIComponent(subject())}&body=${encodeURIComponent(bodyText())}`;
      };
      [...tas, name, group].forEach(t => { t.addEventListener("input", update); t.addEventListener("change", update); });
      this.querySelector("[data-act=copy]").addEventListener("click", e => window.ZIT_copy(`Komu: ${to}\nPředmět: ${subject()}\n\n${bodyText()}`, e.currentTarget));
      this.querySelector("[data-act=clear]").addEventListener("click", () => { tas.forEach(t => t.value = ""); update(); });
      update();
    }
  }

  customElements.define("zit-done", ZitDone);
  customElements.define("zit-reveal", ZitReveal);
  customElements.define("zit-gif", ZitGif);
  customElements.define("zit-folder-story", ZitFolderStory);
  customElements.define("zit-typewriter", ZitTypewriter);
  customElements.define("zit-sync-story", ZitSyncStory);
  customElements.define("zit-ai-reveal", ZitAiReveal);
  customElements.define("zit-prompt-builder", ZitPromptBuilder);
  customElements.define("zit-exit-ticket", ZitExitTicket);
})();

/* =====================================================================
   main.js: společná logika webu.
   Téma, paralelka, rozcestník (index.html), harmonogram (info.html),
   termíny na stránce cvičení, kopírování, česká typografie.
   Každá stránka má na <html> atribut data-root s cestou ke kořeni webu.
   ===================================================================== */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  const C = window.ZIT_COURSE || { lectures: [], groups: {} };
  const ROOT = document.documentElement.getAttribute("data-root") || "./";
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* soukromý režim */ } }
  };
  const DAYS = ["ne", "po", "út", "st", "čt", "pá", "so"];
  const MONTHS = ["ledna", "února", "března", "dubna", "května", "června", "července", "srpna", "září", "října", "listopadu", "prosince"];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- data a čas ---------- */
  const parse = iso => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };
  const today = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };
  const daysUntil = iso => Math.round((parse(iso) - today()) / 86400000);
  const fmt = iso => { const d = parse(iso); return `${DAYS[d.getDay()]} ${d.getDate()}. ${d.getMonth() + 1}.`; };
  const fmtLong = iso => { const d = parse(iso); return `${DAYS[d.getDay()]} ${d.getDate()}. ${MONTHS[d.getMonth()]}`; };
  const rel = iso => {
    const n = daysUntil(iso);
    if (n < 0) return "proběhlo";
    if (n === 0) return "dnes";
    if (n === 1) return "zítra";
    if (n < 5) return `za ${n} dny`;
    if (n < 7) return `za ${n} dní`;
    const w = Math.round(n / 7);
    return w === 1 ? "za týden" : (w < 5 ? `za ${w} týdny` : `za ${w} týdnů`);
  };

  /* ---------- téma ---------- */
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute("data-theme", t); else document.documentElement.removeAttribute("data-theme");
    const dark = t === "dark" || (!t && matchMedia("(prefers-color-scheme: dark)").matches);
    document.querySelectorAll("[data-theme-toggle]").forEach(b => {
      b.textContent = dark ? "☀" : "☾";
      b.setAttribute("aria-label", dark ? "Přepnout na světlý režim" : "Přepnout na tmavý režim");
      b.title = b.getAttribute("aria-label");
    });
  }
  applyTheme(LS.get("zit.theme", null));
  document.addEventListener("click", e => {
    if (!e.target.closest("[data-theme-toggle]")) return;
    const cur = document.documentElement.getAttribute("data-theme");
    const dark = cur === "dark" || (!cur && matchMedia("(prefers-color-scheme: dark)").matches);
    LS.set("zit.theme", dark ? "light" : "dark"); applyTheme(dark ? "light" : "dark");
  });

  /* ---------- aktivní položka menu ---------- */
  function markNav() {
    const page = document.body.dataset.page;
    document.querySelectorAll(".site-nav a[data-nav]").forEach(a => { if (a.dataset.nav === page) a.setAttribute("aria-current", "page"); });
  }

  /* ---------- paralelka ---------- */
  const group = {
    get() { const g = LS.get("zit.group", null); return C.groups[g] ? g : null; },
    set(g) { LS.set("zit.group", g); }
  };
  function renderPickers() {
    document.querySelectorAll("[data-zit='group-picker']").forEach(el => {
      const cur = group.get();
      el.className = "group-picker";
      el.setAttribute("role", "group");
      el.setAttribute("aria-label", "Moje paralelka");
      el.innerHTML = [1, 2, 3].map(g => `<button type="button" data-g="${g}" aria-pressed="${cur === g}">${C.groups[g].short}</button>`).join("");
    });
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-zit='group-picker'] button");
    if (!b) return;
    const g = Number(b.dataset.g);
    group.set(group.get() === g ? null : g);
    renderAll();
  });

  /* ---------- cvičení: stav a termíny ---------- */
  const href = l => l.status === "published" ? `${ROOT}lectures/${l.slug}/` : null;
  const datesFor = (l, g) => g ? [l.dates[g]] : [...new Set(Object.values(l.dates))].sort();
  const isPast = (l, g) => datesFor(l, g).every(d => daysUntil(d) < 0);
  function nextLecture(g) {
    const up = C.lectures.map(l => ({ l, n: Math.min(...datesFor(l, g).map(daysUntil).filter(n => n >= 0)) }))
      .filter(x => isFinite(x.n)).sort((a, b) => a.n - b.n);
    return up.length ? up[0].l : null;
  }
  function whenText(l, g) {
    if (g) { const gr = C.groups[g]; return `${fmt(l.dates[g])} · ${gr.time} · ${gr.room}`; }
    const p1 = l.dates[1], p23 = l.dates[2] === l.dates[3] ? l.dates[2] : null;
    return p23 ? `par. 1: ${fmt(p1)} · par. 2 a 3: ${fmt(p23)}` : [1, 2, 3].map(x => `par. ${x}: ${fmt(l.dates[x])}`).join(" · ");
  }

  /* ---------- rozcestník ---------- */
  function renderHub() {
    const g = group.get();
    const nxt = nextLecture(g);
    document.querySelectorAll("[data-zit='next']").forEach(el => {
      if (!nxt) { el.innerHTML = ""; return; }
      const d = datesFor(nxt, g).find(x => daysUntil(x) >= 0);
      const h = href(nxt);
      const inner = `
        <div class="big-n">${nxt.n}</div>
        <div>
          <span class="badge badge-blue badge-live">Další cvičení · ${rel(d)}</span>
          <h2>${esc(nxt.title)}</h2>
          <div class="meta">${esc(nxt.sub)}<br><b>${fmtLong(d)}</b>${g ? ` · ${C.groups[g].time} · ${C.groups[g].room}` : " · vyber paralelku pro přesný čas"}</div>
        </div>
        ${h ? `<span class="btn btn-primary btn-lg">Otevřít cvičení →</span>` : `<span class="btn is-disabled">Připravujeme</span>`}`;
      el.innerHTML = h ? `<a class="next-card" href="${h}">${inner}</a>` : `<div class="next-card">${inner}</div>`;
    });
    document.querySelectorAll("[data-zit='exercises']").forEach(el => {
      el.className = "ex-grid";
      el.innerHTML = C.lectures.map(l => {
        const h = href(l), past = isPast(l, g), isNext = nxt === l;
        const status = isNext ? `<span class="badge badge-solid">Další</span>`
          : past ? `<span class="badge">Proběhlo</span>`
          : h ? `<span class="badge badge-ok">Otevřeno</span>` : `<span class="badge">Připravujeme</span>`;
        const cls = ["ex-card", isNext ? "is-next" : "", past ? "is-past" : "", !h ? "is-locked" : ""].join(" ");
        const when = g ? `<span>${whenText(l, g)}</span>`
          : (l.dates[2] === l.dates[3] ? `<span>Par. 1 · ${fmt(l.dates[1])}</span><span>Par. 2 a 3 · ${fmt(l.dates[2])}</span>` : [1, 2, 3].map(x => `<span>Par. ${x} · ${fmt(l.dates[x])}</span>`).join(""));
        const body = `
          <div class="top"><span class="n"><span class="ico" aria-hidden="true">${l.icon || ""}</span> Cvičení ${l.n}</span>${status}</div>
          <h3>${esc(l.title)}</h3>
          <p class="sub">${esc(l.sub)}</p>
          ${l.test ? `<span class="badge badge-warn" style="align-self:flex-start">${esc(l.test)}</span>` : ""}
          <div class="when">${when}</div>`;
        return `<li>${h ? `<a class="${cls}" href="${h}">${body}</a>` : `<div class="${cls}">${body}</div>`}</li>`;
      }).join("");
    });
  }

  /* ---------- harmonogram (info.html) ---------- */
  function renderSchedule() {
    document.querySelectorAll("[data-zit='schedule']").forEach(el => {
      const g = group.get();
      const rows = [];
      C.lectures.forEach(l => Object.entries(l.dates).forEach(([gg, d]) => rows.push({ l, g: Number(gg), d })));
      rows.sort((a, b) => a.d.localeCompare(b.d) || C.groups[a.g].time.localeCompare(C.groups[b.g].time));
      el.innerHTML = `<div class="card" style="padding:.4rem .6rem;overflow:auto"><table class="mb-0">
        <thead><tr><th>Datum</th><th>Čas</th><th>Paralelka</th><th>Místnost</th><th>Cvičení</th></tr></thead>
        <tbody>${rows.filter(r => !g || r.g === g).map(r => {
          const gr = C.groups[r.g], h = href(r.l), past = daysUntil(r.d) < 0;
          return `<tr style="${past ? "opacity:.55" : ""}"><td style="white-space:nowrap">${fmt(r.d)} ${parse(r.d).getFullYear()}</td><td>${gr.time}</td><td>${gr.short}</td><td>${gr.room}</td>
            <td>${r.l.n}. ${h ? `<a href="${h}">${esc(r.l.title)}</a>` : esc(r.l.title)}${r.l.test ? ` <span class="badge badge-warn">${esc(r.l.test)}</span>` : ""}</td></tr>`;
        }).join("")}</tbody></table></div>
        <p class="small muted" style="margin-top:.6rem">${g ? `Zobrazena jen ${C.groups[g].label.toLowerCase()}. Klikni na ni znovu a uvidíš všechny.` : "Vyber paralelku a uvidíš jen svoje termíny."}</p>`;
    });
  }

  /* ---------- termíny na stránce cvičení ---------- */
  function renderExerciseMeta() {
    const n = Number(document.body.dataset.lecture);
    const l = C.lectures.find(x => x.n === n);
    if (!l) return;
    const g = group.get();
    document.querySelectorAll("[data-zit='dates']").forEach(el => {
      el.className = "dates";
      el.innerHTML = [1, 3, 2].map(gg => {
        const gr = C.groups[gg], d = l.dates[gg];
        return `<span class="chip ${g === gg ? "mine" : ""} ${daysUntil(d) < 0 ? "past" : ""}"><b>${gr.short}</b> ${fmt(d)} · ${gr.time} · ${gr.room}</span>`;
      }).join("");
    });
    document.querySelectorAll("[data-zit='past-note']").forEach(el => { el.hidden = !isPast(l, g); });
    document.querySelectorAll("[data-zit='prev-next']").forEach(el => {
      const p = C.lectures.find(x => x.n === n - 1), nx = C.lectures.find(x => x.n === n + 1);
      const a = (x, lbl) => !x ? "<span></span>" : href(x) ? `<a class="btn" href="${href(x)}">${lbl}</a>` : `<span class="btn is-disabled">${lbl} (připravujeme)</span>`;
      el.className = "row between";
      el.innerHTML = a(p, p ? `← ${p.n}. ${p.title}` : "") + a(nx, nx ? `${nx.n}. ${nx.title} →` : "");
    });
  }

  /* ---------- drobnosti ---------- */
  function fillMeta() {
    document.querySelectorAll("[data-zit='teacher']").forEach(e => e.textContent = C.teacher.name);
    document.querySelectorAll("[data-zit='email']").forEach(e => { e.textContent = C.teacher.email; e.setAttribute("href", "mailto:" + C.teacher.email); });
    document.querySelectorAll("[data-zit='year']").forEach(e => e.textContent = C.year);
  }
  window.ZIT_copy = async function (text, btn) {
    try { await navigator.clipboard.writeText(text); }
    catch (e) {
      const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch (x) { }
      ta.remove(); if (!ok) { if (btn) btn.textContent = "Nelze kopírovat"; return false; }
    }
    if (btn) { const o = btn.dataset.label || btn.textContent; btn.dataset.label = o; btn.textContent = "Zkopírováno ✓"; btn.classList.add("done"); setTimeout(() => { btn.textContent = o; btn.classList.remove("done"); }, 1800); }
    return true;
  };
  function copyButtons() {
    document.querySelectorAll("pre").forEach(pre => {
      if (pre.querySelector(".copy-btn") || pre.hasAttribute("data-nocopy")) return;
      const b = document.createElement("button");
      b.type = "button"; b.className = "copy-btn"; b.textContent = "Kopírovat";
      b.addEventListener("click", () => window.ZIT_copy((pre.querySelector("code") || pre).innerText.replace(/\n?Kopírovat$/, ""), b));
      pre.appendChild(b);
    });
  }
  function optionalLinks() {
    document.querySelectorAll("[data-check]").forEach(async a => {
      const url = a.getAttribute("data-check");
      try {
        const r = await fetch(url, { method: "HEAD", cache: "no-store" });
        if (!r.ok) throw 0;
        a.setAttribute("href", url); a.hidden = false; a.classList.remove("is-disabled");
      } catch (e) {
        if (a.dataset.missing) { a.classList.add("is-disabled"); a.removeAttribute("href"); const l = a.querySelector(".lbl"); if (l) l.textContent = a.dataset.missing; }
        else a.hidden = true;
      }
    });
  }
  /* nezlomitelná mezera za jednopísmennými předložkami a spojkami */
  function czechNbsp(root) {
    const re = /(^|[\s(„"])([KkSsVvZzOoUuAaIi])\s(?=\S)/g;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const p = n.parentElement;
        if (!p || p.closest("pre, code, kbd, textarea, script, style, input, .no-nbsp, .paper")) return NodeFilter.FILTER_REJECT;
        return n.nodeValue.length > 3 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(n => { const v = n.nodeValue.replace(re, "$1$2 "); if (v !== n.nodeValue) n.nodeValue = v; });
  }
  /* zvýraznění sekce v podmenu info stránky */
  function subnavSpy() {
    const links = [...document.querySelectorAll(".subnav a[href^='#']")];
    if (!links.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
    }), { rootMargin: "-25% 0px -65% 0px" });
    links.forEach(a => { const t = document.querySelector(a.getAttribute("href")); if (t) io.observe(t); });
  }

  function renderAll() { renderPickers(); renderHub(); renderSchedule(); renderExerciseMeta(); }

  document.addEventListener("DOMContentLoaded", () => {
    markNav(); renderAll(); fillMeta(); copyButtons(); optionalLinks(); subnavSpy();
    czechNbsp(document.body);
  });

  window.ZIT = { C, ROOT, LS, esc, fmt, fmtLong, daysUntil, rel, group, czechNbsp };
})();

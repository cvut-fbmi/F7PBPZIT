/* =====================================================================
   main.js – společná logika webu (téma, navigace, paralelka, harmonogram,
   pokrok v lekci, česká typografie, kopírování kódu, kontrola slidů).
   Bez závislostí. Každá stránka má na <html> atribut data-root s relativní
   cestou ke kořeni webu (např. "./" nebo "../../").
   ===================================================================== */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  const C = window.ZIT_COURSE || { lectures: [], groups: {} };
  const ROOT = document.documentElement.getAttribute("data-root") || "./";
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* soukromý režim apod. */ } }
  };
  const DAYS = ["ne", "po", "út", "st", "čt", "pá", "so"];
  const MONTHS_GEN = ["ledna", "února", "března", "dubna", "května", "června", "července", "srpna", "září", "října", "listopadu", "prosince"];

  function parseISO(iso) { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); }
  function today() { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); }
  function fmtDate(iso, opts = {}) {
    const d = parseISO(iso);
    const day = DAYS[d.getDay()];
    const base = `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
    return opts.long ? `${day} ${d.getDate()}. ${MONTHS_GEN[d.getMonth()]} ${d.getFullYear()}` : `${day} ${base}`;
  }
  function daysUntil(iso) { return Math.round((parseISO(iso) - today()) / 86400000); }
  function relative(iso) {
    const n = daysUntil(iso);
    if (n === 0) return "dnes";
    if (n === 1) return "zítra";
    if (n < 0) return "proběhlo";
    if (n < 7) return `za ${n} dny`;
    return `za ${Math.round(n / 7)} týd.`.replace("za 1 týd.", "za týden");
  }

  /* ---------- téma ---------- */
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute("data-theme", t); else document.documentElement.removeAttribute("data-theme");
    document.querySelectorAll("[data-theme-toggle]").forEach(b => {
      const dark = t === "dark" || (!t && matchMedia("(prefers-color-scheme: dark)").matches);
      b.textContent = dark ? "☀" : "☾";
      b.setAttribute("aria-label", dark ? "Přepnout na světlý režim" : "Přepnout na tmavý režim");
      b.title = b.getAttribute("aria-label");
    });
  }
  applyTheme(LS.get("zit.theme", null));
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-theme-toggle]");
    if (!b) return;
    const cur = document.documentElement.getAttribute("data-theme");
    const dark = cur === "dark" || (!cur && matchMedia("(prefers-color-scheme: dark)").matches);
    const next = dark ? "light" : "dark";
    LS.set("zit.theme", next); applyTheme(next);
  });

  /* ---------- mobilní navigace + aktivní odkaz ---------- */
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-nav-toggle]");
    if (!t) return;
    const nav = document.querySelector(".site-nav");
    nav.classList.toggle("open");
    t.setAttribute("aria-expanded", nav.classList.contains("open"));
  });
  (function markActive() {
    const here = location.pathname.replace(/index\.html$/, "");
    document.querySelectorAll(".site-nav a").forEach(a => {
      const href = a.getAttribute("href");
      if (!href) return;
      const url = new URL(href, location.href).pathname.replace(/index\.html$/, "");
      if (url === here || (url !== new URL(ROOT, location.href).pathname && here.startsWith(url))) a.setAttribute("aria-current", "page");
    });
  })();

  /* ---------- paralelka ---------- */
  const group = {
    get() { return LS.get("zit.group", null); },
    set(g) { LS.set("zit.group", g); document.dispatchEvent(new CustomEvent("zit-group", { detail: g })); }
  };
  function renderGroupPickers() {
    document.querySelectorAll("[data-zit='group-picker']").forEach(el => {
      const cur = group.get();
      el.className = "group-picker";
      el.setAttribute("role", "group");
      el.setAttribute("aria-label", "Vyber svou paralelku");
      el.innerHTML = [1, 2, 3].map(g => `<button type="button" data-g="${g}" aria-pressed="${cur === g}">${C.groups[g] ? C.groups[g].label.replace("Paralelka", "Par.") : "Par. " + g}</button>`).join("");
    });
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-zit='group-picker'] button");
    if (!b) return;
    const g = Number(b.dataset.g);
    group.set(group.get() === g ? null : g);
    renderAll();
  });

  /* ---------- pomocné vykreslování ---------- */
  function lectureHref(l) { return l.status === "published" ? `${ROOT}lectures/${l.slug}/` : null; }
  function lectureState(l, g) {
    const dates = g ? [l.dates[g]] : Object.values(l.dates);
    const ds = dates.map(daysUntil);
    if (ds.every(n => n < 0)) return "done";
    return "upcoming";
  }
  function nextLecture(g) {
    // nejbližší cvičení (dnes nebo v budoucnu); pokud žádné, poslední
    const list = C.lectures.map(l => {
      const ds = g ? [l.dates[g]] : Object.values(l.dates);
      const fut = ds.map(daysUntil).filter(n => n >= 0);
      return { l, n: fut.length ? Math.min(...fut) : null };
    }).filter(x => x.n !== null).sort((a, b) => a.n - b.n);
    return list.length ? list[0].l : C.lectures[C.lectures.length - 1];
  }
  function datesLine(l, g) {
    if (g) return `${fmtDate(l.dates[g])} · ${C.groups[g].time} · ${C.groups[g].room}`;
    const uniq = [...new Set(Object.values(l.dates))].sort();
    return uniq.map(d => fmtDate(d)).join(" / ");
  }

  function renderNext() {
    document.querySelectorAll("[data-zit='next']").forEach(el => {
      const g = group.get();
      const l = nextLecture(g);
      const href = lectureHref(l);
      const when = g ? l.dates[g] : [...new Set(Object.values(l.dates))].sort().find(d => daysUntil(d) >= 0) || Object.values(l.dates)[0];
      const rel = relative(when);
      el.innerHTML = `
        <div class="card" style="border-color:var(--accent); box-shadow: 0 0 0 4px var(--accent-soft), var(--shadow)">
          <div class="flex between" style="margin-bottom:.5rem">
            <span class="badge badge-accent badge-live">Nejbližší cvičení</span>
            <span class="muted small">${g ? C.groups[g].label : "Vyber paralelku pro přesný termín"}</span>
          </div>
          <h3 style="margin:.2em 0 .2em">${l.n}. ${l.title}</h3>
          <p class="muted" style="margin-bottom:.8rem">${l.subtitle}</p>
          <p style="margin-bottom:1rem"><strong>${fmtDate(when, { long: true })}</strong>${g ? ` · ${C.groups[g].time} · ${C.groups[g].room}` : ""} <span class="tag">${rel}</span></p>
          ${href ? `<a class="btn btn-primary" href="${href}">Otevřít cvičení →</a>` : `<span class="btn is-disabled">Materiály zveřejníme před cvičením</span>`}
        </div>`;
    });
  }

  function renderTimeline() {
    document.querySelectorAll("[data-zit='timeline']").forEach(el => {
      const g = group.get();
      const nxt = nextLecture(g);
      el.className = "timeline";
      el.innerHTML = C.lectures.map(l => {
        const href = lectureHref(l);
        const st = lectureState(l, g);
        const cls = [l === nxt ? "is-current" : "", st === "done" ? "is-done" : "", !href ? "is-locked" : ""].join(" ");
        const badges = [
          l.checkpoint ? `<span class="badge badge-warn">Checkpoint</span>` : "",
          l.final ? `<span class="badge badge-danger">Závěrečná simulace</span>` : "",
          href ? `<span class="badge badge-ok">Zveřejněno</span>` : `<span class="badge">Připravujeme</span>`
        ].join(" ");
        const inner = `
          <div class="t"><strong>${l.title}</strong><span>${l.subtitle}</span><div class="flex" style="margin-top:.4rem">${badges}</div></div>
          <div class="d">${datesLine(l, g)}</div>`;
        return `<li class="${cls}"><div class="num">${l.n}</div>${href ? `<a class="card card-link" href="${href}">${inner}</a>` : `<div class="card">${inner}</div>`}</li>`;
      }).join("");
    });
  }

  function renderScheduleTable() {
    document.querySelectorAll("[data-zit='schedule-table']").forEach(el => {
      const g = group.get();
      const rows = [];
      C.lectures.forEach(l => {
        Object.entries(l.dates).forEach(([gg, d]) => rows.push({ l, g: Number(gg), d }));
      });
      rows.sort((a, b) => (a.d === b.d ? C.groups[a.g].time.localeCompare(C.groups[b.g].time) || a.g - b.g : a.d.localeCompare(b.d)));
      el.innerHTML = `
        <table>
          <thead><tr><th>Datum</th><th>Čas</th><th>Paralelka</th><th>Místnost</th><th>Cvičení</th></tr></thead>
          <tbody>${rows.map(r => {
            const gr = C.groups[r.g];
            const mine = g === r.g;
            const past = daysUntil(r.d) < 0;
            const href = lectureHref(r.l);
            return `<tr style="${mine ? "background:var(--accent-soft)" : ""}${past ? ";opacity:.6" : ""}">
              <td class="nowrap">${fmtDate(r.d)}</td><td>${gr.time}</td><td>${gr.label}${mine ? " ★" : ""}</td><td>${gr.room}</td>
              <td>${r.l.n}. ${href ? `<a href="${href}">${r.l.title}</a>` : r.l.title}${r.l.checkpoint ? ' <span class="badge badge-warn">checkpoint</span>' : ""}${r.l.final ? ' <span class="badge badge-danger">simulace</span>' : ""}</td>
            </tr>`;
          }).join("")}</tbody>
        </table>`;
    });
  }

  function renderLectureMeta() {
    const n = Number(document.body.dataset.lecture);
    if (!n) return;
    const l = C.lectures.find(x => x.n === n);
    if (!l) return;
    const g = group.get();
    document.querySelectorAll("[data-zit='lecture-meta']").forEach(el => {
      el.className = "lecture-meta";
      el.innerHTML = [1, 3, 2].map(gg => {
        const gr = C.groups[gg];
        return `<span class="chip ${g === gg ? "is-mine" : ""}" title="${gr.label}"><b>${gr.label.replace("Paralelka", "Par.")}</b> ${fmtDate(l.dates[gg])} · ${gr.time} · ${gr.room}${g === gg ? " ★" : ""}</span>`;
      }).join("");
    });
    // navigace předchozí / další
    document.querySelectorAll("[data-zit='lecture-nav']").forEach(el => {
      const prev = C.lectures.find(x => x.n === n - 1), next = C.lectures.find(x => x.n === n + 1);
      const link = (x, label) => !x ? "" : (lectureHref(x) ? `<a class="btn" href="${lectureHref(x)}">${label} ${x.n}. ${x.title}</a>` : `<span class="btn is-disabled">${label} ${x.n}. ${x.title} (připravujeme)</span>`);
      el.innerHTML = `${link(prev, "←")}<span style="flex:1"></span>${link(next, "Příště: ")}`;
    });
  }

  /* ---------- pokrok v lekci (zit-done + TOC) ---------- */
  function updateProgress() {
    const dones = document.querySelectorAll("zit-done input");
    if (!dones.length) return;
    const total = dones.length, done = [...dones].filter(i => i.checked).length;
    const pct = Math.round(done / total * 100);
    document.querySelectorAll(".lecture-progress > span").forEach(s => s.style.width = pct + "%");
    document.querySelectorAll("[data-zit='progress-text']").forEach(s => s.textContent = `${done} / ${total} bloků hotovo (${pct} %)`);
    // TOC ✓
    dones.forEach(i => {
      const block = i.closest(".block");
      if (!block) return;
      const li = document.querySelector(`.lecture-toc li[data-for="${block.id}"]`);
      if (li) li.classList.toggle("is-done", i.checked);
    });
  }
  document.addEventListener("zit-progress", updateProgress);

  function buildToc() {
    const toc = document.querySelector("[data-zit='toc']");
    if (!toc) return;
    const blocks = [...document.querySelectorAll(".block[id]")];
    toc.innerHTML = blocks.map(b => {
      const h = b.querySelector("h2");
      const num = b.querySelector(".bn")?.textContent.trim() || "";
      return `<li data-for="${b.id}"><a href="#${b.id}"><span class="toc-num">${num}</span><span>${h ? h.textContent : b.id}</span></a></li>`;
    }).join("");
    const links = [...toc.querySelectorAll("a")];
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          links.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px", threshold: 0 });
    blocks.forEach(b => io.observe(b));
  }

  /* ---------- kopírování kódu ---------- */
  function addCopyButtons() {
    document.querySelectorAll("pre").forEach(pre => {
      if (pre.querySelector(".copy-btn") || pre.dataset.nocopy !== undefined) return;
      const b = document.createElement("button");
      b.type = "button"; b.className = "copy-btn"; b.textContent = "Kopírovat";
      b.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(pre.querySelector("code")?.innerText ?? pre.innerText); b.textContent = "Zkopírováno ✓"; b.classList.add("done"); }
        catch (e) { b.textContent = "Nelze kopírovat"; }
        setTimeout(() => { b.textContent = "Kopírovat"; b.classList.remove("done"); }, 1800);
      });
      pre.appendChild(b);
    });
  }
  window.ZIT_copy = async function (text, btn) {
    try { await navigator.clipboard.writeText(text); if (btn) { const o = btn.textContent; btn.textContent = "Zkopírováno ✓"; setTimeout(() => btn.textContent = o, 1800); } return true; }
    catch (e) { if (btn) btn.textContent = "Nelze kopírovat"; return false; }
  };

  /* ---------- odkazy, které se zobrazí jen když soubor existuje (např. slidy) ---------- */
  function checkOptionalLinks() {
    document.querySelectorAll("[data-check]").forEach(async a => {
      const url = a.getAttribute("data-check");
      try {
        const r = await fetch(url, { method: "HEAD", cache: "no-store" });
        if (!r.ok) throw 0;
        a.setAttribute("href", url); a.classList.remove("is-disabled"); a.removeAttribute("aria-disabled"); a.hidden = false;
      } catch (e) {
        if (a.dataset.missing !== undefined) { a.classList.add("is-disabled"); a.setAttribute("aria-disabled", "true"); a.removeAttribute("href"); const l = a.querySelector(".lbl"); if (l) l.textContent = a.dataset.missing; }
        else a.hidden = true;
      }
    });
  }

  /* ---------- jemné objevení bloků při scrollu ---------- */
  function revealOnScroll() {
    const els = [...document.querySelectorAll(".block, .reveal")];
    if (!els.length) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { els.forEach(e => e.classList.add("in")); return; }
    const check = () => {
      const h = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0, 600);
      els.forEach(e => { if (!e.classList.contains("in")) { const r = e.getBoundingClientRect(); if (r.top < h * 0.92 && r.bottom > 0) e.classList.add("in"); } });
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    window.addEventListener("hashchange", () => setTimeout(check, 50));
    // pojistka: po 10 s se zobrazí všechno, i kdyby scroll události nepřišly
    setTimeout(() => els.forEach(e => e.classList.add("in")), 10000);
  }

  /* ---------- česká typografie: nezlomitelné mezery za jednopísmennými předložkami ---------- */
  function czechNbsp(root) {
    const re = /(^|[\s(„"])([KkSsVvZzOoUuAaIi])\s(?=\S)/g;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const p = n.parentElement;
        if (!p || p.closest("pre, code, kbd, textarea, script, style, .mono, input, .no-nbsp")) return NodeFilter.FILTER_REJECT;
        return n.nodeValue.length > 3 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => { const v = n.nodeValue.replace(re, "$1$2 "); if (v !== n.nodeValue) n.nodeValue = v; });
  }

  /* ---------- rok v patičce ---------- */
  function fillMeta() {
    document.querySelectorAll("[data-zit='teacher']").forEach(e => e.textContent = C.teacher.name);
    document.querySelectorAll("[data-zit='email']").forEach(e => { e.textContent = C.teacher.email; e.setAttribute("href", "mailto:" + C.teacher.email); });
    document.querySelectorAll("[data-zit='year']").forEach(e => e.textContent = C.year);
  }

  function renderAll() { renderGroupPickers(); renderNext(); renderTimeline(); renderScheduleTable(); renderLectureMeta(); }

  document.addEventListener("DOMContentLoaded", () => {
    renderAll(); fillMeta(); buildToc(); addCopyButtons(); checkOptionalLinks(); revealOnScroll();
    czechNbsp(document.body);
    // pokrok se aktualizuje, až se zaregistrují komponenty
    setTimeout(updateProgress, 0);
  });

  window.ZIT = { C, ROOT, LS, fmtDate, daysUntil, relative, group, nextLecture, czechNbsp, updateProgress };
})();

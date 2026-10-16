/* =====================================================================
   Cvičení 3: vlastní interaktivní prvky stránky.
   <c3-types>    typ zdroje: primární / sekundární / terciární u devíti zdrojů
   <c3-reverse>  hledání podle obrázku: odkud je „dnešní“ fotka
   <c3-spot>     falešné oznámení: najdi šest varovných signálů
   <c3-crop>     výřez tabulky vs. celá tabulka měření (řazení, filtr)
   <c3-voice>    hlasová zpráva: označ varovné signály, pak vyhodnocení
   <c3-quiz>     checkpoint před testem 1 (8 otázek, okamžitá zpětná vazba)
   ===================================================================== */
(function () {
  "use strict";
  const H = window.ZIT_helpers;
  const { esc, LS } = H;
  const IMG = "../../materials/03/";

  /* ---------- typ zdroje ---------- */
  const TYPES = [["p", "primární"], ["s", "sekundární"], ["t", "terciární"]];
  const SRC = [
    ["01", "Tisková zpráva hasičů a kraje", "p", "Úřad, který opatření vyhlásil. Mluví o vlastním rozhodnutí."],
    ["02", "Článek Deníku Alfa", "s", "Novinářka píše o události, kterou sama nezažila. Ví to od hasičů."],
    ["03", "Příspěvek Pavla K.", "s", "Pavel nic neměřil. Přeposílá, co „slyšel“ a co „psali v deníku“."],
    ["04", "Blog „Alfa bez cenzury“", "s", "Anonymní autor cituje anonymní „zdroj ve firmě“."],
    ["05", "Tabulka měření hasičů", "p", "Čísla přímo z přístrojů. Data jsou primární zdroj."],
    ["06", "„Mimořádné oznámení“", "?", "Tváří se jako primární zdroj, úřad. Jestli opravdu je, zjistíš v kroku 4."],
    ["07", "Shrnutí od AI", "t", "Souhrn ze souhrnů. AI nic neviděla ani neměřila."],
    ["08", "Operační hlášení hasičů", "p", "Záznam přímo z operačního střediska, které zásah řídí."],
    ["09", "Hlasová zpráva „od starosty“", "?", "Tváří se jako primární zdroj, starosta. Jestli opravdu je, zjistíš v kroku 7."]
  ];
  class C3Types extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      const saved = LS.get("zit.c3.types", {});
      H.shell(this, {
        title: "Primární, sekundární, nebo terciární?", kind: "vyzkoušej",
        body: `<ul class="types">${SRC.map(s => `
          <li data-id="${s[0]}"><span class="t-id">${s[0]}</span><span class="t-name">${esc(s[1])}</span>
            <span class="t-btns" role="group" aria-label="Typ zdroje ${s[0]}">${TYPES.map(t => `<button type="button" data-t="${t[0]}">${t[1]}</button>`).join("")}</span>
            <span class="t-why" hidden></span></li>`).join("")}</ul>`,
        foot: `<span class="small muted">Klikni na typ u každého zdroje.</span><span class="zit-result"></span>`
      });
      this.ans = saved;
      this.addEventListener("click", e => {
        const b = e.target.closest("[data-t]"); if (!b) return;
        const li = b.closest("li"); this.ans[li.dataset.id] = b.dataset.t;
        LS.set("zit.c3.types", this.ans); this.render();
      });
      this.render();
    }
    render() {
      let ok = 0, done = 0;
      SRC.forEach(s => {
        const li = this.querySelector(`li[data-id="${s[0]}"]`), a = this.ans[s[0]];
        const why = li.querySelector(".t-why");
        li.className = "";
        li.querySelectorAll("[data-t]").forEach(b => b.setAttribute("aria-pressed", b.dataset.t === a));
        if (!a) { why.hidden = true; return; }
        done++;
        if (s[2] === "?") { li.className = "maybe"; ok++; why.innerHTML = `<b>Pozor:</b> ${esc(s[3])}`; }
        else if (a === s[2]) { li.className = "good"; ok++; why.innerHTML = esc(s[3]); }
        else { li.className = "wrong"; why.innerHTML = `Ještě jednou: odkud to autor ví? Viděl/a to, nebo to jen přeposílá?`; }
        why.hidden = false;
      });
      const r = this.querySelector(".zit-result");
      r.textContent = done ? `${ok} z ${SRC.length}` : "";
      r.className = "zit-result " + (ok === SRC.length ? "ok" : "mid");
    }
  }

  /* ---------- hledání podle obrázku ---------- */
  class C3Reverse extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      H.shell(this, {
        title: "Odkud je ta fotka?", kind: "hledání podle obrázku",
        body: `<div class="rev-q">
            <img src="${IMG}foto_mrazirny.png" alt="Ilustrace: hala s nápisem Mrazírny Bystrá, nad ní bílý oblak, na zemi sníh a holé stromy" width="900" height="600" loading="lazy">
            <p class="small muted mb-0">Pavel K., 15. 10. v 11:58: „Fotka od švagra z mrazíren.“</p></div>
          <div class="rev-res" aria-live="polite"></div>`,
        foot: `<button type="button" class="btn btn-primary btn-sm" data-go>⌕ Hledat stejnou fotku</button><span class="small muted">Simulace. Data z balíku na internetu nejsou.</span>`
      });
      this.querySelector("[data-go]").addEventListener("click", () => this.search());
    }
    async search() {
      const btn = this.querySelector("[data-go]"), res = this.querySelector(".rev-res");
      btn.disabled = true; res.innerHTML = `<p class="rev-wait">Hledám shodné obrázky…</p>`;
      await H.sleep(H.reduced() ? 50 : 900);
      res.innerHTML = `
        <p class="rev-h">Nalezeno 2× · seřazeno od nejstaršího</p>
        <div class="rev-hit old"><img src="${IMG}foto_mrazirny.png" alt="" width="120" height="80"><div><span class="badge badge-warn">shoda 100 %</span>
          <b>Deník Alfa · 2. 3. 2021</b><span>Únik čpavku v mrazírnách v Lužné: tři zaměstnanci skončili v nemocnici</span></div></div>
        <div class="rev-hit"><img src="${IMG}foto_mrazirny.png" alt="" width="120" height="80"><div><span class="badge">shoda 100 %</span>
          <b>sousedé.example · 15. 10. 2026</b><span>Pavel K.: „CHLÓR v Lužné!!!“</span></div></div>
        <div class="rev-dates"><div><small>událost</small><b>po 1. 3. 2021</b></div><div><small>článek vyšel</small><b>2. 3. 2021</b></div><div class="now"><small>sdíleno jako dnešní</small><b>15. 10. 2026</b></div></div>
        <p class="mb-0"><b>A fotka sama?</b> Leží na ní sníh a stromy jsou holé. V polovině října sníh v nížině nebývá a stromy mají ještě listí. Fotka je o pět let starší.</p>`;
      btn.textContent = "Hledat znovu"; btn.disabled = false;
    }
  }

  /* ---------- falešné oznámení ---------- */
  const SPOTS = [
    ["Den v týdnu", "Patnáctého října 2026 je čtvrtek, ne středa. Úřad si datum zkontroluje."],
    ["Název úřadu", "Úřad se jmenuje Krajský úřad modelového regionu Alfa. Napodobenina se netrefila."],
    ["Chlór", "Hasiči i kraj mluví o čpavku. Oznámení tvrdí totéž co fáma ze sítí."],
    ["Odkaz a rodné číslo", "Web není na doméně kraje (kraj-alfa.example). Úřad po tobě přes odkaz nechce rodné číslo ani číslo účtu. Tohle je podvod."],
    ["„Sdílejte všem“", "Úřad informuje rozhlasem, SMS a na webu. Nežádá tě, abys to poslal/a dál."],
    ["Podpis bez jména", "Skutečná zpráva má jmenovanou mluvčí a kontakt. „Krizový štáb“ může podepsat kdokoli."]
  ];
  class C3Spot extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      const s = i => `<button type="button" class="hs" data-s="${i}" aria-label="Varovný signál: ${esc(SPOTS[i][0])}">`;
      H.shell(this, {
        title: "Najdi šest varovných signálů", kind: "klikej na podezřelá místa",
        body: `<div class="paper notice">
            <div class="n-head"><span class="n-shield" aria-hidden="true">A</span><div>${s(1)}KRAJSKÝ ÚŘAD ALFA</button><small>${s(0)}Středa 15. 10. 2026</button>, 12:10</small></div></div>
            <div class="n-bar">MIMOŘÁDNÉ OZNÁMENÍ</div>
            <p class="n-lead">Z DŮVODU ÚNIKU ${s(2)}CHLÓRU</button> SE NAŘIZUJE OKAMŽITÁ EVAKUACE CELÉ OBCE LUŽNÁ.</p>
            <p>Všichni obyvatelé musí opustit domovy nejpozději do 14:00 a dostavit se do evakuačního centra ZŠ Mostkov.</p>
            <p>Nárok na ubytování a náhradu škody si zaregistrujte ZDE: ${s(3)}<u>krajalfa-evakuace.example.invalid</u> (jméno, rodné číslo, číslo účtu)</button>.</p>
            <p>Informační linka: +420 000 999 111</p>
            <p class="n-share">${s(4)}SDÍLEJTE VŠEM SOUSEDŮM!!!</button></p>
            <p class="n-sig">${s(5)}Krizový štáb</button></p>
          </div><ol class="spots"></ol>`,
        foot: `<span class="zit-result mid" style="margin-left:0">Nalezeno 0 ze 6</span><button type="button" class="btn btn-sm" data-all style="margin-left:auto">Ukázat všechny</button>`
      });
      this.found = [];
      this.addEventListener("click", e => {
        const b = e.target.closest(".hs"); if (b) this.mark(Number(b.dataset.s));
        if (e.target.closest("[data-all]")) SPOTS.forEach((_, i) => this.mark(i));
      });
    }
    mark(i) {
      if (this.found.includes(i)) return;
      this.found.push(i);
      const b = this.querySelector(`.hs[data-s="${i}"]`);
      b.classList.add("on"); b.insertAdjacentHTML("beforeend", `<span class="stamp">${this.found.length}</span>`);
      this.querySelector(".spots").insertAdjacentHTML("beforeend", `<li><b>${esc(SPOTS[i][0])}:</b> ${esc(SPOTS[i][1])}</li>`);
      const r = this.querySelector(".zit-result"), n = this.found.length;
      r.textContent = n === SPOTS.length ? "Všech šest. Kraj ve 12:55 potvrdil, že oznámení nevydal." : `Nalezeno ${n} ze 6`;
      r.className = "zit-result " + (n === SPOTS.length ? "ok" : "mid");
      if (n === SPOTS.length) this.querySelector("[data-all]").hidden = true;
    }
  }

  /* ---------- výřez vs. celá tabulka ---------- */
  const M = [
    ["11:00", "M1", "brána areálu mrazíren", 50, 38.0, ""], ["11:00", "M2", "ul. Polní, nejbližší domy", 300, 6.4, ""],
    ["11:00", "M3", "křižovatka Polní × Nádražní", 450, 2.8, ""], ["11:00", "M4", "ZŠ Lužná", 900, 0.9, ""],
    ["11:30", "M1", "brána areálu mrazíren", 50, 31.5, ""], ["11:30", "M2", "ul. Polní, nejbližší domy", 300, 5.1, ""],
    ["11:30", "M3", "křižovatka Polní × Nádražní", 450, 250.0, "chyba čidla, přeměřeno v 11:35"], ["11:30", "M4", "ZŠ Lužná", 900, 1.2, ""],
    ["11:35", "M3", "křižovatka Polní × Nádražní", 450, 3.1, "přeměřeno ručním přístrojem"],
    ["12:00", "M1", "brána areálu mrazíren", 50, 24.0, ""], ["12:00", "M2", "ul. Polní, nejbližší domy", 300, 3.9, ""],
    ["12:00", "M3", "křižovatka Polní × Nádražní", 450, 2.2, ""], ["12:00", "M4", "ZŠ Lužná", 900, 0.8, ""],
    ["12:00", "M5", "Mostkov, náměstí", 6200, 0.0, "měření na žádost starosty Mostkova"],
    ["12:30", "M1", "brána areálu mrazíren", 50, 6.2, ""], ["12:30", "M2", "ul. Polní, nejbližší domy", 300, 1.1, ""],
    ["12:30", "M3", "křižovatka Polní × Nádražní", 450, 0.7, ""], ["12:30", "M4", "ZŠ Lužná", 900, 0.2, ""],
    ["13:00", "M1", "brána areálu mrazíren", 50, 1.8, ""], ["13:00", "M2", "ul. Polní, nejbližší domy", 300, 0.6, ""],
    ["13:00", "M3", "křižovatka Polní × Nádražní", 450, 0.3, ""], ["13:00", "M4", "ZŠ Lužná", 900, 0.0, ""],
    ["13:00", "M5", "Mostkov, náměstí", 6200, 0.0, ""]
  ];
  const num = v => v.toFixed(1).replace(".", ",");
  class C3Crop extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      H.shell(this, {
        title: "Výřez, který poslal Pavel", kind: "screenshot vs. data",
        body: `<div class="crop"><table class="mb-0"><thead><tr><th>cas</th><th>misto</th><th class="num">nh3_ppm</th></tr></thead>
            <tbody><tr><td>11:30</td><td>M3</td><td class="num"><b>250,0</b></td></tr></tbody></table><span class="crop-tag">snímek obrazovky</span></div>
          <div class="full" hidden>
            <div class="seg" role="group" aria-label="Zobrazení tabulky">
              <button type="button" data-v="orig" aria-pressed="true">Původní pořadí</button>
              <button type="button" data-v="desc" aria-pressed="false">Od největšího</button>
              <button type="button" data-v="m5" aria-pressed="false">Jen M5 Mostkov</button>
            </div>
            <div class="full-wrap"><table class="meas mb-0"><thead><tr><th>čas</th><th>místo</th><th>popis</th><th class="num">m</th><th class="num">ppm</th><th>poznámka</th></tr></thead><tbody></tbody></table></div>
          </div><p class="crop-msg mb-0"></p>`,
        foot: `<button type="button" class="btn btn-primary btn-sm" data-open>Ukázat celou tabulku</button>`
      });
      this.view = "orig";
      this.querySelector("[data-open]").addEventListener("click", e => {
        this.querySelector(".full").hidden = false; e.currentTarget.hidden = true;
        this.querySelector(".crop").classList.add("faded");
        this.querySelector(".crop-msg").innerHTML = `Výřez zachytil tři sloupce ze sedmi. Sloupec <b>poznámka</b> a řádek pod ním říkají, že šlo o chybu čidla a za pět minut bylo naměřeno 3,1. Vyzkoušej řazení a filtr, totéž pak uděláš v Excelu.`;
        this.render();
      });
      this.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => {
        this.view = b.dataset.v; this.querySelectorAll("[data-v]").forEach(x => x.setAttribute("aria-pressed", x === b)); this.render();
      }));
    }
    render() {
      let rows = M.map((r, i) => ({ r, i }));
      if (this.view === "desc") rows.sort((a, b) => b.r[4] - a.r[4]);
      if (this.view === "m5") rows = rows.filter(x => x.r[1] === "M5");
      this.querySelector(".meas tbody").innerHTML = rows.map(({ r }) => {
        const cls = r[4] === 250 ? "err" : r[0] === "11:35" ? "fix" : r[4] === 38 ? "max" : "";
        return `<tr class="${cls}"><td>${r[0]}</td><td>${r[1]}</td><td>${esc(r[2])}</td><td class="num">${r[3].toLocaleString("cs-CZ")}</td><td class="num">${num(r[4])}</td><td>${esc(r[5])}</td></tr>`;
      }).join("");
    }
  }

  /* ---------- hlasová zpráva ---------- */
  const SIG = [
    [true, "Přišla z neznámého čísla.", "Starosta má číslo na webu obce. Tohle tam není."],
    [true, "Je „přeposlaná mnohokrát“.", "Nevíš, kdo ji poslal jako první. Původ nejde dohledat."],
    [true, "Tlačí na spěch: „okamžitě“, „pošlete všem“.", "Spěch má zabránit tomu, abys přemýšlel/a a ověřoval/a."],
    [true, "Odporuje tiskové zprávě, která říká zůstat doma.", "Oficiální kanál říká opak. To je důvod zpozornět."],
    [true, "„Úřady to tají“ říká údajně sám starosta.", "Starosta je úřad. Proč by tajil sám před sebou?"],
    [true, "Mluví o chlóru, hasiči o čpavku.", "Stejná chyba jako v příspěvku a ve falešném oznámení."],
    [true, "Hlas zní ploše, bez nádechů, jedna věta se opakuje stejně.", "Typické pro uměle vytvořený hlas. Ale pozor, ne vždy je to slyšet."],
    [false, "Hlas zní přesně jako starosta.", "To není důkaz pravosti. Klon hlasu zní jako originál, stačí mu pár vteřin nahrávky."],
    [false, "Zpráva je krátká.", "Krátké bývají i pravé zprávy. Délka nic neprozrazuje."]
  ];
  class C3Voice extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      const order = [7, 0, 2, 8, 3, 1, 5, 4, 6];
      H.shell(this, {
        title: "Hlasová zpráva v chatu sousedů (ZDROJ 09)", kind: "označ signály",
        body: `<div class="vm">
            <div class="vm-meta">+420 000 555 017 · Sousedé z Lužné a okolí · 12:26<br><i>» Přeposláno mnohokrát</i></div>
            <div class="vm-bubble" aria-hidden="true"><span class="vm-play">▶</span><span class="vm-wave">${Array.from({ length: 34 }, (_, i) => `<i style="height:${6 + Math.round(16 * Math.abs(Math.sin(i * .9) * Math.cos(i * .37)))}px"></i>`).join("")}</span><b>0:41</b></div>
            <blockquote class="vm-text">„Dobrý den, tady starosta Lužné Pavel Jezerský. Situace je mnohem vážnější, než se oficiálně říká. Chemici naměřili smrtelné hodnoty chlóru. Okamžitě opusťte domovy, vezměte doklady a jeďte směr Mostkov. Okamžitě opusťte domovy. Úřady to tají, aby nebyla panika. Pošlete to všem, na koho máte číslo.“</blockquote>
            <p class="small muted mb-0">Popis zvuku z karty metadat: hlas podobný starostovi, plochá intonace, žádné nádechy, žádné zvuky v pozadí.</p>
          </div>
          <p class="vs-q"><b>Co z toho je varovný signál?</b> Zaškrtni všechno, co tě znepokojuje.</p>
          <ul class="vsig">${order.map(i => `<li data-i="${i}"><label><input type="checkbox"> <span>${esc(SIG[i][1])}</span></label><div class="why" hidden></div></li>`).join("")}</ul>`,
        foot: `<button type="button" class="btn btn-primary btn-sm" data-eval>Vyhodnotit</button><span class="zit-result"></span>`
      });
      this.querySelector("[data-eval]").addEventListener("click", () => this.evaluate());
    }
    evaluate() {
      let hit = 0, miss = 0, trap = 0;
      this.querySelectorAll(".vsig li").forEach(li => {
        const [isSig, , why] = SIG[Number(li.dataset.i)], on = li.querySelector("input").checked, w = li.querySelector(".why");
        li.className = isSig ? (on ? "good" : "missed") : (on ? "trap" : "calm");
        if (isSig && on) hit++; if (isSig && !on) miss++; if (!isSig && on) trap++;
        w.textContent = (isSig ? (on ? "" : "Tohle je signál. ") : (on ? "Past. " : "Správně, tohle signál není. ")) + why; w.hidden = false;
      });
      const r = this.querySelector(".zit-result");
      r.textContent = `Signálů ${hit} ze 7${trap ? `, ${trap}× past` : ""}`;
      r.className = "zit-result " + (!miss && !trap ? "ok" : "mid");
      this.querySelector("[data-eval]").textContent = "Vyhodnotit znovu";
    }
  }

  /* ---------- checkpoint ---------- */
  const QUIZ = [
    ["Který název souboru odpovídá konvenci kurzu?", ["final_final.xlsx", "2026-10-19_overeni-unik_novakova_v01.xlsx", "Overeni Unik Nováková.xlsx"], 1,
      "Datum RRRR-MM-DD, téma, příjmení bez diakritiky, verze. Seřadí se a každý ví, čí je."],
    ["Synchronizace s OneDrive je záloha.", ["Pravda", "Nepravda"], 1,
      "Když soubor smažeš, synchronizace ho poslušně smaže i v cloudu. Záloha je kopie mimo synchronizaci."],
    ["Smíš do školního Copilotu vložit interní hlášení ze skutečné události?", ["Ne, interní dokument patří jen do prostředí, které organizace schválila", "Ano, je to školní účet", "Ano, když smažu jména"], 0,
      "Kategorie INTERNÍ: jen tam, kde to organizace dovolí. Cvičná data z kurzu jsou smyšlená, proto do Copilotu smí."],
    ["Proč dávat nadpisům ve Wordu styl Nadpis 1?", ["Jsou větší a tučné", "Jinak nejde dokument vytisknout", "Funguje navigace a automatický obsah"], 2,
      "Tučný text je pro Word obyčejný text. Styl mu řekne, že je to nadpis."],
    ["Někdo dnes sdílí článek z roku 2021. Co to je?", ["Pravdivý článek o jiné události, pro dnešek nic nedokazuje", "Fake news, článek lže", "Důkaz, že se to stalo znovu"], 0,
      "Článek může být pravdivý a přesto zavádějící, když se vydává za novinku. Hledej datum vydání a datum události."],
    ["AI ti dá odpověď s odkazem [1]. Co uděláš?", ["Věřím jí, má zdroj", "Otevřu zdroj a najdu v něm tu větu", "Zeptám se AI, jestli si je jistá"], 1,
      "Odkaz není důkaz. Důkaz je věta, kterou v [1] opravdu najdeš."],
    ["Hlasová zpráva zní přesně jako starosta. Je pravá?", ["Podle hlasu to poznat nejde, ověřím kanál a zavolám na oficiální číslo", "Ano, hlas poznám"], 0,
      "Klon hlasu zní jako originál. Ověřuje se, odkud zpráva přišla, ne jak zní."],
    ["Co z toho je primární zdroj?", ["Článek v deníku o úniku", "Shrnutí od AI", "Tabulka měření od hasičů"], 2,
      "Primární je původce: kdo měřil, rozhodl, viděl. Článek je sekundární, shrnutí od AI terciární."]
  ];
  class C3Quiz extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = true;
      this.innerHTML = `<ol class="quiz">${QUIZ.map((q, i) => `<li data-q="${i}"><p class="q">${esc(q[0])}</p><div class="opts">${q[1].map((o, k) => `<button type="button" class="btn btn-sm" data-k="${k}">${esc(o)}</button>`).join("")}</div><p class="fb" hidden></p></li>`).join("")}</ol><p class="quiz-score small" aria-live="polite"></p>`;
      this.res = {};
      this.addEventListener("click", e => {
        const b = e.target.closest("[data-k]"); if (!b) return;
        const li = b.closest("li"), i = Number(li.dataset.q), q = QUIZ[i], k = Number(b.dataset.k);
        if (this.res[i] !== undefined) return;
        this.res[i] = k === q[2];
        li.querySelectorAll("[data-k]").forEach(x => { x.disabled = true; if (Number(x.dataset.k) === q[2]) x.classList.add("right"); });
        if (k !== q[2]) b.classList.add("miss");
        const fb = li.querySelector(".fb"); fb.hidden = false; fb.innerHTML = `<b>${k === q[2] ? "Správně." : "Ne tak docela."}</b> ${esc(q[3])}`;
        const n = Object.keys(this.res).length, ok = Object.values(this.res).filter(Boolean).length;
        this.querySelector(".quiz-score").innerHTML = n === QUIZ.length ? `<b>${ok} z ${QUIZ.length}.</b> ${ok >= 6 ? "Na test jsi připravený/á." : "Projdi si ještě kroky, kde jsi chyboval/a, a tahák."}` : `${n} z ${QUIZ.length} zodpovězeno`;
      });
    }
  }

  customElements.define("c3-types", C3Types);
  customElements.define("c3-reverse", C3Reverse);
  customElements.define("c3-spot", C3Spot);
  customElements.define("c3-crop", C3Crop);
  customElements.define("c3-voice", C3Voice);
  customElements.define("c3-quiz", C3Quiz);
})();

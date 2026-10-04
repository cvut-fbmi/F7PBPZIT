/* =====================================================================
   Data kurzu: JEDINÉ místo, kde se udržuje harmonogram a seznam cvičení.
   Čte je úvodní stránka (rozcestník), info.html i stránky cvičení.
   Formát data: ISO "RRRR-MM-DD".
   status: "published" (stránka existuje) | "soon" (připravujeme)
   ===================================================================== */
window.ZIT_COURSE = {
  code: "F7PBPZIT",
  name: "Základy informačních technologií",
  faculty: "Fakulta biomedicínského inženýrství ČVUT v Praze",
  facultyShort: "ČVUT FBMI",
  programme: "Bezpečnost a ochrana obyvatelstva",
  year: "2026/2027",
  semester: "zimní semestr",
  teacher: { name: "Ing. Marek Sokol", email: "marek.sokol@cvut.cz" },
  siteUrl: "https://cvut-fbmi.github.io/F7PBPZIT/",
  copilotUrl: "https://m365.cloud.microsoft/chat",

  groups: {
    1: { label: "Paralelka 1", short: "Par. 1", time: "14:00", room: "KL:B-435" },
    2: { label: "Paralelka 2", short: "Par. 2", time: "14:00", room: "KL:B-435" },
    3: { label: "Paralelka 3", short: "Par. 3", time: "12:00", room: "KL:B-520" }
  },

  lectures: [
    {
      n: 1, slug: "01-digitalni-minimum", status: "published",
      title: "Digitální minimum",
      sub: "Soubory, cloud, bezpečná data a první prompt",
      dates: { 1: "2026-09-21", 3: "2026-09-28", 2: "2026-09-28" }
    },
    {
      n: 2, slug: "02-profesionalni-dokumenty", status: "published",
      title: "Profesionální dokumenty",
      sub: "Word, styly, obsah, PDF a AI jako editor",
      dates: { 1: "2026-10-05", 3: "2026-10-12", 2: "2026-10-12" }
    },
    {
      n: 3, slug: "03-overovani-informaci", status: "soon",
      title: "Ověřování informací",
      sub: "Zdroje, halucinace AI, fake news a deepfakes",
      dates: { 1: "2026-10-19", 3: "2026-10-26", 2: "2026-10-26" }
    },
    {
      n: 4, slug: "04-test1-excel", status: "soon",
      title: "Test 1 a Excel",
      sub: "Zápočtový test 1, pak tabulky, vzorce a filtry",
      dates: { 1: "2026-11-02", 3: "2026-11-09", 2: "2026-11-09" },
      test: "Zápočtový test 1"
    },
    {
      n: 5, slug: "05-analyza-dat", status: "soon",
      title: "Analýza krizových dat",
      sub: "Čištění dat, kontingenční tabulky, grafy, dashboard",
      dates: { 1: "2026-11-16", 3: "2026-11-23", 2: "2026-11-23" }
    },
    {
      n: 6, slug: "06-ai-krizovy-stab", status: "soon",
      title: "AI v krizovém štábu",
      sub: "Situační zprávy, komunikace a kontrola AI",
      dates: { 1: "2026-11-30", 3: "2026-12-07", 2: "2026-12-07" }
    },
    {
      n: 7, slug: "07-kyberbezpecnost-test2", status: "soon",
      title: "Kyberbezpečnost a Test 2",
      sub: "Phishing, deepfakes, výpadky a zápočtový test 2",
      dates: { 1: "2026-12-14", 3: "2027-01-11", 2: "2027-01-11" },
      test: "Zápočtový test 2"
    }
  ]
};

/* =====================================================================
   Data kurzu – JEDINÉ místo, kde se udržuje harmonogram a seznam cvičení.
   Používá je index.html, harmonogram.html, lectures/index.html i stránky cvičení.
   Formát data: ISO "RRRR-MM-DD".
   status: "published" (stránka existuje) | "soon" (bude zveřejněno) | "draft"
   ===================================================================== */
window.ZIT_COURSE = {
  code: "F7PBPZIT",
  name: "Základy informačních technologií",
  shortName: "ZIT",
  faculty: "Fakulta biomedicínského inženýrství ČVUT v Praze",
  programme: "Bezpečnost a ochrana obyvatelstva (BOO)",
  year: "2026/2027",
  semester: "zimní semestr",
  campus: "Kladno",
  teacher: { name: "Ing. Marek Sokol", email: "marek.sokol@cvut.cz" },
  siteUrl: "https://cvut-fbmi.github.io/F7PBPZIT/",
  copilotUrl: "https://m365.cloud.microsoft/chat",
  copilotStudioUrl: "https://copilotstudio.microsoft.com/",

  groups: {
    1: { label: "Paralelka 1", day: "pondělí", time: "14:00", room: "KL:B-435" },
    2: { label: "Paralelka 2", day: "pondělí", time: "14:00", room: "KL:B-435" },
    3: { label: "Paralelka 3", day: "pondělí", time: "12:00", room: "KL:B-520" }
  },

  lectures: [
    {
      n: 1, slug: "01-digitalni-minimum", status: "published",
      title: "Digitální minimum",
      subtitle: "Soubory, cloud, bezpečná práce, základy AI, prompting, ochrana dat",
      dates: { 1: "2026-09-21", 3: "2026-09-28", 2: "2026-09-28" },
      tags: ["soubory", "cloud", "Copilot", "prompting", "ochrana dat"]
    },
    {
      n: 2, slug: "02-profesionalni-dokumenty", status: "soon",
      title: "Profesionální dokumenty",
      subtitle: "Word, styly, obsah, PDF, typografie a AI jako editor",
      dates: { 1: "2026-10-05", 3: "2026-10-12", 2: "2026-10-12" },
      tags: ["Word", "styly", "PDF", "typografie"]
    },
    {
      n: 3, slug: "03-vyhledavani-a-overovani", status: "soon",
      title: "Vyhledávání a ověřování informací",
      subtitle: "Zdroje, AI rešerše, fake news, deepfakes, NotebookLM + checkpoint",
      dates: { 1: "2026-10-19", 3: "2026-10-26", 2: "2026-10-26" },
      tags: ["zdroje", "fake news", "deepfake", "checkpoint"],
      checkpoint: true
    },
    {
      n: 4, slug: "04-excel-pro-krizove-rizeni", status: "soon",
      title: "Excel pro krizové řízení",
      subtitle: "Tabulky, vzorce, relativní a absolutní odkazy, IF, filtrování, AI pomoc s formulemi",
      dates: { 1: "2026-11-02", 3: "2026-11-09", 2: "2026-11-09" },
      tags: ["Excel", "vzorce", "filtry"]
    },
    {
      n: 5, slug: "05-analyza-krizovych-dat", status: "soon",
      title: "Analýza krizových dat",
      subtitle: "Čištění dat, kontingenční tabulky, grafy, dashboard + AI datová analýza",
      dates: { 1: "2026-11-16", 3: "2026-11-23", 2: "2026-11-23" },
      tags: ["data", "kontingenční tabulky", "grafy", "dashboard"]
    },
    {
      n: 6, slug: "06-ai-asistent-krizoveho-stabu", status: "soon",
      title: "AI jako asistent krizového štábu",
      subtitle: "Situační zprávy, scénáře, komunikace, prompting a kontrola AI",
      dates: { 1: "2026-11-30", 3: "2026-12-07", 2: "2026-12-07" },
      tags: ["SITREP", "scénáře", "Copilot Studio"]
    },
    {
      n: 7, slug: "07-kyberbezpecnost-a-kontinuita", status: "soon",
      title: "Kyberbezpečnost a digitální kontinuita",
      subtitle: "Phishing, deepfakes, hardware a digitální kontinuita + závěrečná krizová mikrosimulace",
      dates: { 1: "2026-12-14", 3: "2027-01-11", 2: "2027-01-11" },
      tags: ["phishing", "deepfake", "kontinuita", "mikrosimulace"],
      final: true
    }
  ]
};

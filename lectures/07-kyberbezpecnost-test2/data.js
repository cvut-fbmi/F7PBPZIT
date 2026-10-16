/* Vygenerováno: teacher/07/build-package.py. Neupravuj ručně. */
window.C7_DATA = {
 "signals": {
  "odesilatel": "odesílatel",
  "domena": "doména",
  "nalehavost": "naléhavost",
  "priloha": "příloha",
  "odkaz": "odkaz",
  "gramatika": "gramatika",
  "neocekavane": "neočekávaný požadavek",
  "heslo": "požadavek na heslo",
  "mfa": "požadavek na MFA kód",
  "finance": "finanční požadavek"
 },
 "messages": [
  {
   "id": "Z1",
   "ok": true,
   "ch": "e-mail",
   "from": "IT oddělení <it@kraj-alfa.example>",
   "subj": "Plánovaná odstávka pošty v sobotu 19. 12.",
   "time": "po 14. 12. 07:12",
   "body": [
    "Dobrý den,",
    "v sobotu 19. 12. od 22:00 do 24:00 nebude dostupná e-mailová pošta kvůli aktualizaci serveru. Nic nemusíte dělat.",
    "Dotazy na lince 2100 (číslo najdete i na intranetu).",
    "Petr Kovář, IT oddělení Krajského úřadu"
   ],
   "extra": "",
   "sig": [],
   "why": "Známá doména kraje, žádný odkaz ani příloha, nic po tobě nechce. Kontakt si ověříš na intranetu."
  },
  {
   "id": "Z2",
   "ok": false,
   "ch": "e-mail",
   "from": "IT podpora <it-podpora@kraj-alfa-helpdesk.example.invalid>",
   "subj": "UPOZORNĚNÍ: Vaše schránka bude do 2 hodin ZABLOKOVÁNA",
   "time": "po 14. 12. 07:31",
   "body": [
    "Vážený uživateli,",
    "vaše poštovní schránka překročila limit. Abyste nepřišel o data, ověřte svůj účet do 2 hodin, jinak bude schránka zablokována.",
    "Ověřit účet: přihlaste se svým jménem a heslem na odkazu níže.",
    "S pozdravem IT Helpdesk"
   ],
   "extra": "odkaz: https://kraj-alfa-login.example.invalid/overeni",
   "sig": [
    "domena",
    "nalehavost",
    "odkaz",
    "heslo"
   ],
   "why": "Doména jen napodobuje kraj, tlačí na čas a chce heslo přes odkaz. IT po tobě heslo nikdy nechce."
  },
  {
   "id": "Z3",
   "ok": true,
   "ch": "e-mail",
   "from": "Mgr. Lenka Proudová <media@hzs-alfa.example>",
   "subj": "Tisková zpráva k výpadku proudu (k připomínkám)",
   "time": "po 14. 12. 07:40",
   "body": [
    "Ahoj,",
    "jak jsme se ráno domluvili na poradě, posílám návrh tiskové zprávy k výpadku. Připomínky prosím do 9:00.",
    "Lenka"
   ],
   "extra": "příloha: TZ_vypadek_navrh.pdf",
   "sig": [],
   "why": "Známá kolegyně, správná doména, navazuje na domluvu z porady a příloha je obyčejné PDF."
  },
  {
   "id": "Z4",
   "ok": false,
   "ch": "e-mail",
   "from": "Ing. Alena Bystrá <alena.bystra.kraj@mail.example.invalid>",
   "subj": "Urgentní platba",
   "time": "po 14. 12. 07:52",
   "body": [
    "Ahoj,",
    "jsem na jednání u hejtmana a nemůžu telefonovat. Potřebuju, abys hned zadal/a platbu za pronájem generátorů, dodavatel jinak nedoveze.",
    "Číslo účtu a částka 486 000 Kč jsou v příloze. Nikomu to zatím neříkej, řeším to přímo já.",
    "Alena"
   ],
   "extra": "příloha: faktura_generatory.pdf",
   "sig": [
    "odesilatel",
    "domena",
    "nalehavost",
    "neocekavane",
    "finance"
   ],
   "why": "Vedoucí píše ze soukromé adresy, nechce telefonovat, chce peníze a mlčení. Typický podvod „na šéfa“. Ověř si to telefonem na číslo, které znáš."
  },
  {
   "id": "Z5",
   "ok": false,
   "ch": "e-mail",
   "from": "Distributor elektřiny <info@elektro-alfa.example.invalid>",
   "subj": "Přehled obnovy dodávek, výpadek 14. 12.",
   "time": "po 14. 12. 08:03",
   "body": [
    "Dobrý den,",
    "zasíláme aktuální přehled obnovy dodávek elektřiny pro váš region. Pro zobrazení tabulky je nutné povolit obsah (makra).",
    "Distributor"
   ],
   "extra": "příloha: prehled_obnovy.xlsm",
   "sig": [
    "domena",
    "priloha",
    "neocekavane"
   ],
   "why": "Neznámá doména, nevyžádaná příloha a prosba o povolení maker. Makro je program, který se spustí v tvém počítači."
  },
  {
   "id": "Z6",
   "ok": false,
   "ch": "SMS",
   "from": "+420 000 777 812",
   "subj": "SMS",
   "time": "po 14. 12. 08:10",
   "body": [
    "Dobry den, tady IT kraje. Prave vam prisel overovaci kod, dokoncujeme migraci uctu. Poslete nam ho prosim sem, jinak se ucet zablokuje."
   ],
   "extra": "",
   "sig": [
    "odesilatel",
    "mfa",
    "nalehavost",
    "neocekavane"
   ],
   "why": "Ověřovací kód je poslední zámek tvého účtu. Kdo ho chce, má už tvoje heslo. Nikomu ho nesděluj, ani „IT“."
  },
  {
   "id": "Z7",
   "ok": true,
   "ch": "e-mail",
   "from": "Personální oddělení <personalni@kraj-alfa.example>",
   "subj": "Výplatní páska za listopad",
   "time": "po 14. 12. 08:15",
   "body": [
    "Dobrý den,",
    "výplatní páska za listopad je k dispozici v personálním systému. Přihlaste se jako obvykle přes intranet.",
    "Personální oddělení"
   ],
   "extra": "",
   "sig": [],
   "why": "Nic neposílá ani neodkazuje. Říká, ať jdeš obvyklou cestou přes intranet. Přesně tak to má vypadat."
  },
  {
   "id": "Z8",
   "ok": false,
   "ch": "leták",
   "from": "Leták na nástěnce u vchodu",
   "subj": "Nová pravidla parkování od 1. 1.",
   "time": "po 14. 12.",
   "body": [
    "Od 1. 1. 2027 se parkovací karty vydávají jen elektronicky. Naskenujte QR kód a přihlaste se svým pracovním účtem. Kdo se nezaregistruje do 18. 12., přijde o místo."
   ],
   "extra": "QR kód vede na: parkovani-kraj-alfa.example.invalid/login",
   "sig": [
    "odkaz",
    "heslo",
    "nalehavost",
    "neocekavane"
   ],
   "why": "QR kód je jen odkaz, který nevidíš. Vede na cizí doménu a chce pracovní přihlášení. Ověř si to u správy budovy."
  }
 ],
 "cases": [
  {
   "q": "Kolega tě prosí o heslo ke společnému účtu štábu, protože to svoje zapomněl.",
   "opts": [
    [
     "Pošlu mu ho do chatu, je to kolega.",
     false
    ],
    [
     "Nepošlu. Ať si heslo obnoví, nebo ať nám IT zřídí sdílený přístup.",
     true
    ],
    [
     "Napíšu mu ho na papír.",
     false
    ]
   ],
   "why": "Heslo se nesdílí, ani s kolegou. Účet je pak na tobě a nikdo nepozná, kdo co udělal. Na sdílení jsou sdílené schránky a správce hesel."
  },
  {
   "q": "Telefon ti ukáže žádost o schválení přihlášení (MFA), ale ty se zrovna nepřihlašuješ.",
   "opts": [
    [
     "Schválím, ať to přestane pípat.",
     false
    ],
    [
     "Odmítnu, nahlásím IT a změním heslo.",
     true
    ],
    [
     "Ignoruju to.",
     false
    ]
   ],
   "why": "Někdo zná tvoje heslo a zkouší se přihlásit. Žádost, kterou jsi nevyvolal/a, nikdy neschvaluj."
  },
  {
   "q": "Videohovor: na obrazovce je hejtman a chce, abys hned poslal/a interní seznam evakuovaných na soukromý e-mail.",
   "opts": [
    [
     "Pošlu, vidím ho na kameře.",
     false
    ],
    [
     "Hovor ukončím a zavolám zpět na číslo, které znám z oficiálního seznamu.",
     true
    ],
    [
     "Pošlu jen polovinu.",
     false
    ]
   ],
   "why": "Obličej i hlas jde dnes napodobit. Ověřuje se kanál, ne obličej. A interní data na soukromý e-mail nikdy."
  },
  {
   "q": "V kavárně se chceš připojit k Wi-Fi „Kavarna_FREE“ a poslat SITREP označený INTERNÍ.",
   "opts": [
    [
     "Připojím se, je to rychlé.",
     false
    ],
    [
     "Použiju hotspot z pracovního telefonu (nebo VPN) a SITREP pošlu až tak.",
     true
    ],
    [
     "Pošlu to přes osobní e-mail.",
     false
    ]
   ],
   "why": "Na veřejné Wi-Fi nevíš, kdo síť provozuje. Interní dokument posílej jen přes důvěryhodné připojení a pracovní nástroje."
  },
  {
   "q": "Počítač už týden hlásí „Čeká se na restart kvůli aktualizacím“.",
   "opts": [
    [
     "Odkládám, restart zdržuje.",
     false
    ],
    [
     "Uložím práci a restartuju ještě dnes.",
     true
    ],
    [
     "Aktualizace vypnu.",
     false
    ]
   ],
   "why": "Aktualizace zavírají díry, které útočníci znají. Odkládaná aktualizace je otevřené okno."
  }
 ],
 "layers": [
  "Napájení a počítač",
  "Síť (Wi-Fi, kabel, mobil)",
  "Internet",
  "Cloudová služba",
  "Soubor nebo účet"
 ],
 "cards": [
  {
   "q": "Počítač nejde zapnout, nic nesvítí.",
   "layer": 0,
   "first": "Je zapojený kabel a zapnutá zásuvka? Má notebook nabitou baterii?",
   "dont": "Neotvírej počítač, nerozebírej zdroj.",
   "it": "Když nesvítí ani v jiné zásuvce."
  },
  {
   "q": "Počítač běží, ale ikona Wi-Fi je přeškrtnutá.",
   "layer": 1,
   "first": "Není zapnutý režim Letadlo? Je Wi-Fi zapnutá? Vidí síť i telefon?",
   "dont": "Nepřipojuj se k první otevřené síti.",
   "it": "Když síť nevidí nikdo v kanceláři."
  },
  {
   "q": "Wi-Fi je připojená, ale stránky se nenačtou („bez internetu“).",
   "layer": 2,
   "first": "Zkus jinou stránku. Jde internet na telefonu ve stejné síti?",
   "dont": "Nerestartuj router, který spravuje IT.",
   "it": "Když nejde nikomu: hlásit IT hned."
  },
  {
   "q": "Internet funguje, ale Outlook a Teams hlásí chybu.",
   "layer": 3,
   "first": "Jde to i kolegům? Podívej se na stránku se stavem služby.",
   "dont": "Nepřeinstalovávej Office, nemaž profil.",
   "it": "Když to nejde ani po chvíli a nejde to i ostatním."
  },
  {
   "q": "Teams jde, ale soubor ze sdílené složky zmizel.",
   "layer": 4,
   "first": "Podívej se do koše a do historie verzí složky.",
   "dont": "Nevytvářej soubor znovu přes ten starý.",
   "it": "Když chybí víc souborů najednou (může to být útok)."
  },
  {
   "q": "Při výpadku proudu se počítač vypnul uprostřed psaní.",
   "layer": 0,
   "first": "Po zapnutí hledej automaticky obnovený dokument. Příště UPS nebo notebook s baterií.",
   "dont": "Nepanikař a nepiš všechno znovu, Word má automatické ukládání.",
   "it": "Když se počítač nezapne ani po návratu proudu."
  },
  {
   "q": "Mobil nemá signál, vysílač je bez proudu (jako v Olšanech).",
   "layer": 1,
   "first": "Jiný operátor, volání přes Wi-Fi, vysílačka, obecní rozhlas.",
   "dont": "Nečekej, že to vyřeší restart telefonu.",
   "it": "Hned informovat štáb: obyvatelé jsou bez spojení."
  },
  {
   "q": "Tiskárna netiskne, všechno ostatní jde.",
   "layer": 0,
   "first": "Papír, fronta tisku, je tiskárna zapnutá a online?",
   "dont": "Neposílej tisk desetkrát dokola.",
   "it": "Když tiskárna hlásí chybu, kterou neznáš."
  },
  {
   "q": "Po dovolené nejde přihlášení, heslo prý nesedí.",
   "layer": 4,
   "first": "Caps Lock, jazyk klávesnice. Heslo mohlo vypršet.",
   "dont": "Nezkoušej to desetkrát, účet se zablokuje.",
   "it": "Rovnou helpdesk, ověří tě a heslo obnoví."
  },
  {
   "q": "Celé kanceláři najednou nejde internet.",
   "layer": 2,
   "first": "Ověř u kolegů, jestli opravdu všem. Zapiš čas.",
   "dont": "Netahej za kabely v racku.",
   "it": "Hned IT. Pro nejnutnější práci hotspot z pracovního telefonu."
  }
 ]
};

// Orientations as sent by GET https://api.mypolitics.pl/api/v1/survey/{surveyId}
// on 2026-10-07, a few from each quiz.

export const identityQuizOrientations: unknown = [
  {
    id: "0654e995-7860-44b2-8476-430fdb7bec1a",
    description:
      "Zielona gospodarka to podejście, które łączy rozwój ekonomiczny z troską o środowisko naturalne, stawiając na zrównoważony wzrost i efektywne wykorzystanie zasobów. W przeciwieństwie do industrializmu, koncepcja ta podkreśla, że rozwój może odbywać się równolegle z ochroną przyrody, wykorzystując innowacyjne technologie i strategie minimalizujące negatywny wpływ na ekosystemy. W tej perspektywie zarówno dobrobyt społeczny, jak i równowaga ekologiczna stanowią podstawy harmonijnego rozwoju.",
    type: "IDEOLOGY",
    color: "#FFFFFF",
    logoUrl:
      "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/zielona-gospodarka.svg",
    surveyId: "60beb898-a4e4-4160-88c4-07a9931ab499",
    generalName: "Zielona Gospodarka",
    explanation: null,
    linkedOrientations: [],
  },
  {
    id: "fa5274b9-3b9f-4d54-a07f-fe96bb65b2a9",
    description:
      "Partia Razem to lewicowa formacja polityczna w Polsce, która opowiada się za równością społeczną, sprawiedliwością ekonomiczną oraz prawami człowieka. Jej program koncentruje się na walce z ubóstwem, promowaniu praw pracowniczych, ekologii oraz równości płci.\n\nWspółprzewodniczącymi partii są Adrian Zandberg i Aleksandra Owca. Formacja należy do Sojuszu Zielonej Lewicy Europy Środkowo-Wschodniej. Młodzieżówką partii są Młodzi Razem.",
    type: "PARTY",
    color: "#870F57",
    logoUrl:
      "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/razem.png",
    surveyId: "60beb898-a4e4-4160-88c4-07a9931ab499",
    generalName: "Razem",
    explanation: null,
    linkedOrientations: [],
  },
  {
    id: "f108a0b0-1ac7-4111-88cb-a4bbfe7f059b",
    description:
      '{\n  "short": "Twoje poglądy opierają się na dążeniu do pełnej równości ekonomicznej, silnym sektorze publicznym i zdecydowanej walce ze zmianami klimatu. Popierasz laicyzację państwa, postępowe wartości społeczne i pogłębioną współpracę międzynarodową.",\n  "long": "Międzynarodowych Socjalistów wyróżniają bardzo lewicowe poglądy. Dążą do pełnej równości ekonomicznej i usunięcia klas społecznych.\\n\\nWierzą, że państwo może zapewnić ludziom wszelkie potrzeby poprzez budowę silnego sektora publicznego, w tym budownictwa socjalnego i systemu ochrony zdrowia. Uznają za kluczową dla społeczeństwa walkę ze zmianami klimatycznymi, nawet za cenę rozwoju.\\n\\nChcą nagłego i stanowczego rozdziału państwa od kościoła, laicyzacji kultury i oświaty. Są bardzo postępowi, mocno popierają m.in. związki jednopłciowe czy powszechny dostęp do aborcji. Nie patrzą na świat w kategoriach narodowych, są przychylni zwiększaniu uprawnień instytucji międzynarodowych i pogłębianiu współpracy międzynarodowej."\n}',
    type: "IDENTITY",
    color: "#FFFFFF",
    logoUrl:
      '{\n  "m": "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/identities/miedzynarodowy-socjalista-m.png",\n  "f": "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/identities/miedzynarodowy-socjalista-f.png"\n}',
    surveyId: "60beb898-a4e4-4160-88c4-07a9931ab499",
    generalName:
      '{\n  "m": "Międzynarodowy socjalista",\n  "f": "Międzynarodowa socjalistka",\n  "slogan": "Pracownicy wszystkich narodów łączcie się!"\n}',
    explanation: null,
    linkedOrientations: ["fa5274b9-3b9f-4d54-a07f-fe96bb65b2a9"],
  },
];

export const presidentialQuizOrientations: unknown = [
  {
    id: "565946a2-6622-4fb6-8eee-196408544e9a",
    description:
      'Ekonomista, doktor nauk ekonomicznych, wykładowca akademicki, ekspert w zakresie polityki publicznej. Kandydat bezpartyjny, proponuje program oparty na tzw. "trzech siódemkach". ',
    type: "PARTY",
    color: "#FF0000",
    logoUrl:
      "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/prezydencki2025/2/bartoszewicz.png",
    surveyId: "270f6c12-6551-4661-bfcf-52635a703928",
    generalName:
      '{\n  "name": "Artur Bartoszewicz",\n  "slogan": "Nowoczesna, silna i nowoczesna Polska!",\n  "websiteUrl": "https://777.org.pl/",\n  "isOfficial": true,\n  "isHidden": false\n}',
    explanation: null,
    linkedOrientations: [],
  },
  {
    id: "538434a9-dfed-4680-be7d-01eadfcb27fe",
    description:
      "Dziennikarz, przedsiębiorca, właściciel Weszło, współzałożyciel Kanału Sportowego i założyciel Kanału Zero. Kandydat bezpartyjny, deklaruje kampanię bez konkretów, skupioną na obserwacji procesu wyborczego. ",
    type: "PARTY",
    color: "#DC2424",
    logoUrl:
      "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/prezydencki2025/2/stanowski.png",
    surveyId: "270f6c12-6551-4661-bfcf-52635a703928",
    generalName:
      '{\n  "name": "Krzysztof Stanowski",\n  "slogan": "#Zerokonkretów",\n  "websiteUrl": "https://stanowski2025.de/",\n  "isOfficial": false,\n  "isHidden": true\n}',
    explanation: null,
    linkedOrientations: [],
  },
  {
    id: "c28e9896-ff92-4881-a650-0e7f828ec381",
    description:
      '{\n  "shortDescription": "Twój wymarzony prezydent to lider, który wierzy, że silne państwo jest gwarantem stabilności i obrony tradycyjnych wartości. \\n\\nStawia na bliską współpracę z USA, zachowując dystans wobec wpływów UE. W kraju wspiera silne instytucje, centralizację władzy i interwencjonizm gospodarczy. \\n\\nStawia na energetykę jądrową, paliwa kopalne i znaczny udział państwa w gospodarce, dbając o bezpieczeństwo i rozwój w oparciu o narodowy interes.",\n  "longDescription": "Konserwatywny Państwowiec to prezydent, który stawia na silne państwo, przywiązanie do tradycyjnych wartości i bliską współpracę z USA. W polityce zagranicznej balansuje między polityką siły a umiarkowaną współpracą, zachowując rezerwę wobec UE i bezkompromisowo stawiając na Polski interes narodowy. W kraju promuje silną centralizację władzy, popiera utrzymanie obecnego stanu instytucji, takich jak KRS, oraz częściowo popiera walkę z dezinformacją. Gospodarczo wspiera interwencjonizm państwowy, inwestycje w energetykę jądrową i paliwa kopalne, a w kwestii mieszkalnictwa popiera dopłaty do kredytów hipotecznych."\n}',
    type: "IDENTITY",
    color: "#FFFFFF",
    logoUrl:
      "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/identities/konserwatywny-panstwowiec.png",
    surveyId: "270f6c12-6551-4661-bfcf-52635a703928",
    generalName: "Konserwatywny państwowiec",
    explanation: null,
    linkedOrientations: [],
  },
];

export const lineBreakQuizOrientations: unknown = [
  {
    id: "265d00ee-6004-4182-857f-bad9f97b3d9a",
    description:
      '{ "short": "Twoje poglądy opierają się na dążeniu do pełnej równości ekonomicznej, silnym sektorze publicznym i zdecydowanej walce ze zmianami klimatu. Popierasz laicyzację państwa, postępowe wartości społeczne i pogłębioną współpracę międzynarodową.", "long": "Międzynarodowych Socjalistów wyróżniają bardzo lewicowe poglądy. Dążą do pełnej równości ekonomicznej i usunięcia klas społecznych.\n\nWierzą, że państwo może zapewnić ludziom wszelkie potrzeby poprzez budowę silnego sektora publicznego, w tym budownictwa socjalnego i systemu ochrony zdrowia. Uznają za kluczową dla społeczeństwa walkę ze zmianami klimatycznymi, nawet za cenę rozwoju.\n\nChcą nagłego i stanowczego rozdziału państwa od kościoła, laicyzacji kultury i oświaty. Są bardzo postępowi, mocno popierają m.in. związki jednopłciowe czy powszechny dostęp do aborcji. Nie patrzą na świat w kategoriach narodowych, są przychylni zwiększaniu uprawnień instytucji międzynarodowych i pogłębianiu współpracy międzynarodowej." }',
    type: "IDENTITY",
    color: "#FFFFFF",
    logoUrl:
      '{ "m": "https://attic.sh/runpod/c0eb2c69-79e0-4f91-b753-37ec5d54c485.png", "f": "https://attic.sh/runpod/5c245829-0e63-4eea-8774-c210b9430377.png" }',
    surveyId: "2b5c1d4d-5e3b-4fae-b86d-9be400fc6de8",
    generalName:
      '{ "m": "Międzynarodowy socjalista", "f": "Międzynarodowa socjalistka", "slogan": "Pracownicy wszystkich narodów łączcie się!" }',
    explanation: null,
    linkedOrientations: ["5d8df04a-5431-45e5-ad05-bcdf1b3b2390"],
  },
];

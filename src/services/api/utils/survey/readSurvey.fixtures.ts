import { padWithCopies } from "@/utils/vitest/padWithCopies";

// Two quizzes as sent by GET https://api.mypolitics.pl/api/v1/survey/{surveyId}?lang=pl
// on 2026-10-08, cut down to a few items each: the orientations come without
// their descriptions, and an answer names only the orientations kept here.
// The questions and the axes are then padded with copies under new
// identifiers, up to the numbers the live quiz has.

const identityQuizOrientations = [
  {
    id: "756d7fd2-0bb3-414d-b3c6-9dd639b3a257",
    type: "IDEOLOGY",
    color: "#686868",
    logoUrl:
      "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/antyklimatyzm.svg",
    surveyId: "60beb898-a4e4-4160-88c4-07a9931ab499",
    generalName: "Antyklimatyzm",
    explanation: null,
    linkedOrientations: [],
  },
  {
    id: "cb5e42d2-f2b6-4725-9cbb-21ab7fef818c",
    type: "IDEOLOGY",
    color: "#5CAA49",
    logoUrl:
      "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/ekologia-klimatyczna.svg",
    surveyId: "60beb898-a4e4-4160-88c4-07a9931ab499",
    generalName: "Ekologia Klimatyczna",
    explanation: null,
    linkedOrientations: [],
  },
  {
    id: "5add8aaa-9589-4c63-b5a8-24b5d8141f75",
    type: "IDEOLOGY",
    color: "#FFFFFF",
    logoUrl:
      "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/industrializm.svg",
    surveyId: "60beb898-a4e4-4160-88c4-07a9931ab499",
    generalName: "Industrializm",
    explanation: null,
    linkedOrientations: [],
  },
  {
    id: "0654e995-7860-44b2-8476-430fdb7bec1a",
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
    id: "0eed54fe-d1c3-431b-9ba8-b117d924411d",
    type: "IDEOLOGY",
    color: "#2ECC71",
    logoUrl:
      "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/wolny-rynek.svg",
    surveyId: "60beb898-a4e4-4160-88c4-07a9931ab499",
    generalName: "Wolny rynek",
    explanation: null,
    linkedOrientations: [],
  },
  {
    id: "eb249317-b526-4ea3-82c6-bb6739d8eb4d",
    type: "IDEOLOGY",
    color: "#FFFFFF",
    logoUrl:
      "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/indywidualizm-ekonomiczny.svg",
    surveyId: "60beb898-a4e4-4160-88c4-07a9931ab499",
    generalName: "Indywidualizm ekonomiczny",
    explanation: null,
    linkedOrientations: [],
  },
  {
    id: "b7bb725e-74fc-48fb-ada9-1bb238c77280",
    type: "IDEOLOGY",
    color: "#E74C3C",
    logoUrl:
      "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/interwencjonizm.svg",
    surveyId: "60beb898-a4e4-4160-88c4-07a9931ab499",
    generalName: "Interwencjonizm",
    explanation: null,
    linkedOrientations: [],
  },
  {
    id: "5df67347-1f24-4054-ac44-58fbefefe140",
    type: "IDEOLOGY",
    color: "#FFFFFF",
    logoUrl:
      "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/solidaryzm-ekonomiczny.svg",
    surveyId: "60beb898-a4e4-4160-88c4-07a9931ab499",
    generalName: "Solidaryzm ekonomiczny",
    explanation: null,
    linkedOrientations: [],
  },
];

const identityQuizCategories = [
  {
    id: "9ccd7638-d271-406b-b412-42bfc2a19d5b",
    name: "Światopogląd",
    weight: 1.25,
  },
  {
    id: "daa39c91-3475-473c-a774-f385d20b85b7",
    name: "Ustrój",
    weight: 1.25,
  },
  {
    id: "f9cc62af-260b-46f0-ac55-ad86e818b009",
    name: "Gospodarka",
    weight: 1.25,
  },
  {
    id: "d98ab216-df29-4af2-b0f9-ef28d5571d49",
    name: "Polityka zagraniczna",
    weight: 1.25,
  },
  {
    id: "a7cafe79-7c59-4d6e-880e-764176e99b9f",
    name: "Ekologia",
    weight: 1.25,
  },
];

const identityQuizAxes = [
  {
    id: "94e03d6a-562a-4f7f-ba67-01a1ac41effa",
    name: '{\n  "name": "Ekologia Klimatyczna-Antyklimatyzm",\n  "category": "Ekologia",\n  "isMain": true\n}',
    type: "axis",
    description:
      "Oś Ekologia Klimatyczna-Antyklimatyzm odnosi się do spektrum poglądów na temat konieczności działań na rzecz ochrony klimatu, gdzie Ekologia Klimatyczna promuje aktywne minimalizowanie negatywnego wpływu człowieka na środowisko, a Antyklimatyzm kwestionuje sens takich działań, argumentując za priorytetem komfortu życia i rozwoju gospodarczego.",
    positiveOrientations: ["756d7fd2-0bb3-414d-b3c6-9dd639b3a257"],
    negativeOrientations: ["cb5e42d2-f2b6-4725-9cbb-21ab7fef818c"],
  },
  {
    id: "c1ffca92-311c-4f09-b41e-81f5961198e4",
    name: '{\n  "name": "Zielona Gospodarka-Industrializm",\n  "category": "Ekologia",\n  "isMain": false\n}',
    type: "axis",
    description:
      "Oś Zielona Gospodarka-Industrializm ilustruje konflikt między dążeniem do ochrony środowiska a priorytetem rozwoju przemysłowego, gdzie ekologia promuje zrównoważony rozwój, a industrializm stawia na efektywność gospodarczą kosztem natury.",
    positiveOrientations: ["5add8aaa-9589-4c63-b5a8-24b5d8141f75"],
    negativeOrientations: ["0654e995-7860-44b2-8476-430fdb7bec1a"],
  },
  {
    id: "8bd5f826-1aed-409b-8a6e-da4a76189c03",
    name: "gospodarczo",
    type: "compass_x_axis",
    description: "Oś gospodarcza kompasu (pozioma)",
    positiveOrientations: [
      "0eed54fe-d1c3-431b-9ba8-b117d924411d",
      "eb249317-b526-4ea3-82c6-bb6739d8eb4d",
    ],
    negativeOrientations: [
      "b7bb725e-74fc-48fb-ada9-1bb238c77280",
      "5df67347-1f24-4054-ac44-58fbefefe140",
    ],
  },
];

const identityQuizQuestions = [
  {
    id: "8b3fb9f4-9601-4993-b2cf-cf27899d3a69",
    surveyId: "60beb898-a4e4-4160-88c4-07a9931ab499",
    categoryId: "f9cc62af-260b-46f0-ac55-ad86e818b009",
    text: "Stawka procentowa podatku powinna zależeć od zamożności.",
    explanation:
      "Stawka zależna od zamożności to progresywny podatek, czyli system, w którym osoby o wyższych dochodach płacą większy procent swojego dochodu niż osoby mniej zamożne. Może on przyjmować różne formy, np. poprzez progi podatkowe (gdzie wyższe zarobki są opodatkowane wyższą stawką) lub podatek liniowy z ulgami dla osób o niższych dochodach.",
    answerType: "AGREE_OR_DISAGREE",
    status: "LIVE",
    possibleAnswers: [
      {
        id: "746b8c4f-cc9f-46b8-bc3b-811525bcd511",
        text: "Zdecydowanie za",
        weight: 4,
        questionId: "8b3fb9f4-9601-4993-b2cf-cf27899d3a69",
        orientationIds: ["5df67347-1f24-4054-ac44-58fbefefe140"],
      },
      {
        id: "994206df-036c-48da-927c-87ef4b634531",
        text: "Częściowo za",
        weight: 2,
        questionId: "8b3fb9f4-9601-4993-b2cf-cf27899d3a69",
        orientationIds: ["5df67347-1f24-4054-ac44-58fbefefe140"],
      },
      {
        id: "ce205999-bb38-40c0-bdc0-1401f2f70d89",
        text: "Częściowo przeciw",
        weight: 2,
        questionId: "8b3fb9f4-9601-4993-b2cf-cf27899d3a69",
        orientationIds: ["eb249317-b526-4ea3-82c6-bb6739d8eb4d"],
      },
      {
        id: "bedf84f4-a834-438f-9d63-6a9fc118c162",
        text: "Zdecydowanie przeciw",
        weight: 4,
        questionId: "8b3fb9f4-9601-4993-b2cf-cf27899d3a69",
        orientationIds: ["eb249317-b526-4ea3-82c6-bb6739d8eb4d"],
      },
    ],
  },
  {
    id: "c7814ec4-247a-4e94-bc36-e4e80c16b6af",
    surveyId: "60beb898-a4e4-4160-88c4-07a9931ab499",
    categoryId: "a7cafe79-7c59-4d6e-880e-764176e99b9f",
    text: "Wzrost gospodarczy jest ważniejszy od walki ze zmianami klimatu.",
    explanation: null,
    answerType: "AGREE_OR_DISAGREE",
    status: "LIVE",
    possibleAnswers: [
      {
        id: "52f6654a-e821-4b18-ae6d-dc493d8a5ac4",
        text: "Zdecydowanie za",
        weight: 6,
        questionId: "c7814ec4-247a-4e94-bc36-e4e80c16b6af",
        orientationIds: ["756d7fd2-0bb3-414d-b3c6-9dd639b3a257"],
      },
      {
        id: "9600f997-522f-4d1b-b0f3-ee44490ef4bb",
        text: "Częściowo za",
        weight: 3,
        questionId: "c7814ec4-247a-4e94-bc36-e4e80c16b6af",
        orientationIds: ["756d7fd2-0bb3-414d-b3c6-9dd639b3a257"],
      },
      {
        id: "d7770de3-5a5b-4b20-81be-585488bcf858",
        text: "Częściowo przeciw",
        weight: 3,
        questionId: "c7814ec4-247a-4e94-bc36-e4e80c16b6af",
        orientationIds: ["cb5e42d2-f2b6-4725-9cbb-21ab7fef818c"],
      },
      {
        id: "cd07e581-6a9d-4c56-b22e-6ecfbdd38705",
        text: "Zdecydowanie przeciw",
        weight: 6,
        questionId: "c7814ec4-247a-4e94-bc36-e4e80c16b6af",
        orientationIds: ["cb5e42d2-f2b6-4725-9cbb-21ab7fef818c"],
      },
    ],
  },
  {
    id: "687144c2-51ea-4da3-a5d8-aa1f28d387b8",
    surveyId: "60beb898-a4e4-4160-88c4-07a9931ab499",
    categoryId: "a7cafe79-7c59-4d6e-880e-764176e99b9f",
    text: "Na czym powinna opierać się polska energetyka?",
    explanation:
      "OZE (odnawialne źródła energii) to energia pochodząca z naturalnych i niewyczerpywalnych źródeł, takich jak słońce, wiatr, woda czy biomasa. Alternatywą są paliwa kopalne (węgiel, gaz, ropa) lub energia jądrowa, które opierają się na ograniczonych zasobach.",
    answerType: "ONE_OF_MANY",
    status: "LIVE",
    possibleAnswers: [
      {
        id: "93b44389-a9d9-44a0-bc5c-80967765b768",
        text: "Przede wszystkim na węglu",
        weight: 3,
        questionId: "687144c2-51ea-4da3-a5d8-aa1f28d387b8",
        orientationIds: ["756d7fd2-0bb3-414d-b3c6-9dd639b3a257"],
      },
      {
        id: "bc0e2975-9965-45e4-9b59-132cdd743610",
        text: "Przede wszystkim na odnawialnych źródłach energii",
        weight: 3,
        questionId: "687144c2-51ea-4da3-a5d8-aa1f28d387b8",
        orientationIds: ["cb5e42d2-f2b6-4725-9cbb-21ab7fef818c"],
      },
      {
        id: "65e27680-f048-4377-9242-ac572aa1838c",
        text: "Przede wszystkim na atomie",
        weight: 1,
        questionId: "687144c2-51ea-4da3-a5d8-aa1f28d387b8",
        orientationIds: ["cb5e42d2-f2b6-4725-9cbb-21ab7fef818c"],
      },
      {
        id: "0627e53b-2184-469b-b7d4-803c4beb64c9",
        text: "Na odnawialnych źródłach energii i atomie",
        weight: 2,
        questionId: "687144c2-51ea-4da3-a5d8-aa1f28d387b8",
        orientationIds: ["cb5e42d2-f2b6-4725-9cbb-21ab7fef818c"],
      },
    ],
  },
];

export const IDENTITY_QUIZ_QUESTION_COUNT = 102;
export const IDENTITY_QUIZ_AXIS_COUNT = 18;

export const identityQuizSurvey: Record<string, unknown> = {
  id: "60beb898-a4e4-4160-88c4-07a9931ab499",
  title: "myPolitics Quiz Tożsamościowy",
  description:
    "Najbardziej zaawansowany test poglądów politycznych. Poznaj najbliższą ideologię, partię i porównaj ze znajomymi!",
  createdAt: "2025-03-01T22:25:03.037Z",
  type: "OFFICIAL",
  isPublic: true,
  logoUrl:
    "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/v2/mypolitics.png",
  imageUrl:
    "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/v2/mypolitics-identity-quiz.svg",
  averageFinishTime: 15,
  projectId: "5ab50822-e95e-4c7c-a1d6-14aceb68f108",
  version: "mp-qt-1",
  algorithm: "default",
  authors: [],
  defaultLanguage: "pl",
  supportedLanguages: ["pl"],
  orientations: identityQuizOrientations,
  categories: identityQuizCategories,
  axis: padWithCopies(identityQuizAxes, IDENTITY_QUIZ_AXIS_COUNT),
  questions: padWithCopies(identityQuizQuestions, IDENTITY_QUIZ_QUESTION_COUNT),
};

const presidentialQuizOrientations = [
  {
    id: "565946a2-6622-4fb6-8eee-196408544e9a",
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
    id: "041b4896-272f-48fe-9def-c174756819d4",
    type: "PARTY",
    color: "#D5213D",
    logoUrl:
      "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/prezydencki2025/2/trzaskowski.png",
    surveyId: "270f6c12-6551-4661-bfcf-52635a703928",
    generalName:
      '{\n  "name": "Rafał Trzaskowski",\n  "slogan": "Cała Polska naprzód!",\n  "websiteUrl": "https://trzaskowski.pl/",\n  "isOfficial": false,\n  "isHidden": false\n}',
    explanation: null,
    linkedOrientations: [],
  },
  {
    id: "538434a9-dfed-4680-be7d-01eadfcb27fe",
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

const presidentialQuizCategories = [
  {
    id: "ff4dde33-c560-4243-bbf8-7d3016247b3b",
    name: '{\n  "name": "Polityka zagraniczna",\n  "isHidden": false\n}',
    weight: 1.25,
  },
  {
    id: "4da4b4c7-0252-4ef1-9c48-d05b1497d645",
    name: '{\n  "name": "Światopogląd",\n  "isHidden": false\n}',
    weight: 1.25,
  },
  {
    id: "33e1ca50-3907-411f-8733-d9462fe9bdfe",
    name: '{\n  "name": "Praworządność",\n  "isHidden": false\n}',
    weight: 1.25,
  },
  {
    id: "5f270f53-988e-4c8a-874c-35383dacc0c4",
    name: '{\n  "name": "Polityka krajowa",\n  "isHidden": false\n}',
    weight: 1.25,
  },
  {
    id: "48ac265a-96a0-4b18-a89d-3e8408aef173",
    name: '{\n  "name": "Gospodarka",\n  "isHidden": false\n}',
    weight: 1.25,
  },
  {
    id: "8fe79b1c-d058-47f1-aa2f-3d8ac8f23580",
    name: '{\n  "name": "Prezydentura",\n  "isHidden": true\n}',
    weight: 1,
  },
];

const presidentialQuizQuestions = [
  {
    id: "e0d29bb5-284b-4a3d-b909-e6ed63ce7222",
    surveyId: "270f6c12-6551-4661-bfcf-52635a703928",
    categoryId: "8fe79b1c-d058-47f1-aa2f-3d8ac8f23580",
    text: "Prezydentem powinien być...",
    explanation: null,
    answerType: "ONE_OF_MANY",
    status: "LIVE",
    possibleAnswers: [
      {
        id: "60a2e949-409c-4f19-9ae6-165b2c6dba77",
        text: "Polityk z doświadczeniem, powiązany z dzisiejszymi elitami",
        weight: 4,
        questionId: "e0d29bb5-284b-4a3d-b909-e6ed63ce7222",
        orientationIds: ["c28e9896-ff92-4881-a650-0e7f828ec381"],
      },
      {
        id: "752977dc-ff42-4315-aeb3-dfe39ad93870",
        text: "Polityk spoza głównego nurtu, proponujący radykalne zmiany",
        weight: 4,
        questionId: "e0d29bb5-284b-4a3d-b909-e6ed63ce7222",
        orientationIds: [],
      },
    ],
  },
  {
    id: "99158de1-7b92-4901-8eb5-8b9b00d7e61d",
    surveyId: "270f6c12-6551-4661-bfcf-52635a703928",
    categoryId: "ff4dde33-c560-4243-bbf8-7d3016247b3b",
    text: "Polska powinna dążyć do zakończenia wojny na Ukrainie nawet za cenę ustępstw wobec Rosji.",
    explanation: null,
    answerType: "AGREE_OR_DISAGREE",
    status: "LIVE",
    possibleAnswers: [
      {
        id: "379f7925-cc05-4969-8b47-574a7face470",
        text: "Zdecydowanie za",
        weight: 8,
        questionId: "99158de1-7b92-4901-8eb5-8b9b00d7e61d",
        orientationIds: ["565946a2-6622-4fb6-8eee-196408544e9a"],
      },
      {
        id: "3f907a92-3917-4d86-9552-62fb3f40f18e",
        text: "Za",
        weight: 6,
        questionId: "99158de1-7b92-4901-8eb5-8b9b00d7e61d",
        orientationIds: ["565946a2-6622-4fb6-8eee-196408544e9a"],
      },
      {
        id: "3b8c5082-f9a4-472a-a032-6502180131b8",
        text: "Przeciw",
        weight: 3,
        questionId: "99158de1-7b92-4901-8eb5-8b9b00d7e61d",
        orientationIds: [
          "041b4896-272f-48fe-9def-c174756819d4",
          "c28e9896-ff92-4881-a650-0e7f828ec381",
        ],
      },
      {
        id: "35b3b84e-8c2a-4c5c-a836-7be61a23c55e",
        text: "Zdecydowanie przeciw",
        weight: 4,
        questionId: "99158de1-7b92-4901-8eb5-8b9b00d7e61d",
        orientationIds: [
          "041b4896-272f-48fe-9def-c174756819d4",
          "c28e9896-ff92-4881-a650-0e7f828ec381",
        ],
      },
    ],
  },
  {
    id: "7fd405af-1eff-43c2-a1d7-600f41bbf3b5",
    surveyId: "270f6c12-6551-4661-bfcf-52635a703928",
    categoryId: "48ac265a-96a0-4b18-a89d-3e8408aef173",
    text: "Program 800+ (wcześniej: 500+) należy...",
    explanation:
      "Waloryzacja to podwyższenie świadczenia mające na celu zachowanie jego realnej wartości. Może polegać na zwiększeniu kwoty świadczenia o tyle procent, o ile średnio wzrosły ceny",
    answerType: "ONE_OF_MANY",
    status: "LIVE",
    possibleAnswers: [
      {
        id: "9c1efc78-b9f3-459f-80dc-9f228dc275b9",
        text: "Zwiększyć (np. do 1000+ lub zwaloryzować)",
        weight: 4,
        questionId: "7fd405af-1eff-43c2-a1d7-600f41bbf3b5",
        orientationIds: [
          "565946a2-6622-4fb6-8eee-196408544e9a",
          "c28e9896-ff92-4881-a650-0e7f828ec381",
        ],
      },
      {
        id: "e60c94bc-5f83-47f2-bf22-806d78d646e2",
        text: "Utrzymać w obecnej formie",
        weight: 4,
        questionId: "7fd405af-1eff-43c2-a1d7-600f41bbf3b5",
        orientationIds: [
          "565946a2-6622-4fb6-8eee-196408544e9a",
          "c28e9896-ff92-4881-a650-0e7f828ec381",
        ],
      },
      {
        id: "6ec9593b-95d4-4aeb-9450-c35d726a1726",
        text: "Ograniczyć zakres beneficjentów (np. rodziny wielodzietne, osoby pracujące)",
        weight: 4,
        questionId: "7fd405af-1eff-43c2-a1d7-600f41bbf3b5",
        orientationIds: ["041b4896-272f-48fe-9def-c174756819d4"],
      },
      {
        id: "43031e6c-f181-45e5-80f6-fa0b0faa6b7b",
        text: "Zastąpić ulgą podatkową",
        weight: 4,
        questionId: "7fd405af-1eff-43c2-a1d7-600f41bbf3b5",
        orientationIds: [],
      },
      {
        id: "785c3b9d-1c4b-4b3e-acf7-21434018b9f4",
        text: "Zlikwidować",
        weight: 6,
        questionId: "7fd405af-1eff-43c2-a1d7-600f41bbf3b5",
        orientationIds: [],
      },
    ],
  },
];

export const PRESIDENTIAL_QUIZ_QUESTION_COUNT = 77;

export const presidentialQuizSurvey: Record<string, unknown> = {
  id: "270f6c12-6551-4661-bfcf-52635a703928",
  title: "Barometr Prezydencki 2025",
  description:
    "Głosuj świadomie. Poznaj najbliższego sobie kandydata na prezydenta w 2025!",
  createdAt: "2025-04-24T11:35:39.674Z",
  type: "OFFICIAL",
  isPublic: true,
  logoUrl:
    "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/v2/prezydencki2025.svg",
  imageUrl:
    "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/v2/prezydencki-2025-banner.png",
  averageFinishTime: 10,
  projectId: "69ef6c38-7292-4096-a9ef-a58e682dbfde",
  version: "mp-qp2025-3",
  algorithm: "default",
  authors: [],
  defaultLanguage: "pl",
  supportedLanguages: ["pl"],
  orientations: presidentialQuizOrientations,
  categories: presidentialQuizCategories,
  axis: [],
  questions: padWithCopies(
    presidentialQuizQuestions,
    PRESIDENTIAL_QUIZ_QUESTION_COUNT,
  ),
};

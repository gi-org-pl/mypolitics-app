import { readSurveyResultModules } from "@/services/api/utils/result-module/readSurveyResultModules";
import { readSurvey } from "@/services/api/utils/survey/readSurvey";
import { presidentialQuizSurvey } from "@/services/api/utils/survey/readSurvey.fixtures";
import type { QuizResult } from "@/types/results";
import type {
  Survey,
  SurveyLoadResult,
  SurveyLoadStatus,
} from "@/types/survey";
import {
  identityQuizResult,
  identityResultQuiz,
} from "@/utils/result-modules/identityQuizResult.fixtures";
import { getDoneQuestions } from "@/utils/running-state/progress/getDoneQuestions";
import { getRunningScores } from "@/utils/running-state/scores/getRunningScores";

import { PRESIDENTIAL_SURVEY_ID } from "./result-modules.fixtures";

// The two quizzes the app keeps a list of result modules for, each with a
// result of it, and what the app's own list resolves to against that result.
//
// The expected values were written out by the code of commit 4bb6605, where
// `selection`, `groupBy`, `marker` and `visibleRows` were still fields of a
// record: whatever shape a record is saved in, the header and the modules of
// these two results stay what they were. They were changed by hand once
// since, for what the lists were made to say when they were set against the
// result page of the old site: the order and the column of the identity
// quiz's cards, the explanations of its axes and of its parties, and what a
// header and an identity card do with a leader below a partial match.
//
// An orientation is written as its identifier: it is the quiz's own, and
// nothing about it comes from a record. A field with no value is left out.

// The identity quiz, read as when the API sends no list for it: with the
// app's own.
const identityQuiz: Survey = {
  ...identityResultQuiz,
  resultModules: readSurveyResultModules(
    undefined,
    { id: identityResultQuiz.id, language: "pl" },
    {
      orientationIds: new Set(
        identityResultQuiz.orientations.map(({ id }) => id),
      ),
      axisIds: new Set(identityResultQuiz.axes.map(({ id }) => id)),
    },
  ),
};

// The cut of the presidential quiz. Its reply holds no list, so it is read
// with the app's own.
const presidentialQuiz = (
  readSurvey(presidentialQuizSurvey, PRESIDENTIAL_SURVEY_ID, "pl") as Extract<
    SurveyLoadResult,
    { status: typeof SurveyLoadStatus.Ready }
  >
).survey;

// The result the back-end counts for a taker who picks the first answer of
// every question.
const answerFirst = (survey: Survey): QuizResult => {
  const answers = survey.questions.map(({ id, possibleAnswers }) => ({
    questionId: id,
    answerId: possibleAnswers[0].id,
  }));

  return {
    scores: getRunningScores(survey, getDoneQuestions(survey, answers), []),
    answers,
  };
};

const RESOLVED = {
  identity: {
    leader: {
      orientation: "99681a0e-6851-4967-8fcc-cf77ac4717a5",
      value: 100,
    },
    header: {
      orientation: "99681a0e-6851-4967-8fcc-cf77ac4717a5",
      confidence: 100,
      lowMatch: "named",
      lowMatchLabel:
        "Twoje poglądy nie są wystarczająco podobne do żadnej tożsamości (mniej niż 50% pewności).",
    },
    modules: [
      {
        id: "34247794-ee0f-451b-9e48-b8685067c8de", // its axes
        position: 1,
        column: "start",
        title: "Ideologie",
        description:
          "Oś określa bliskość do ideologii. Dodatkowe osie opisują Twoje poglądy na węższych płaszczyznach niż osie główne (widoczne domyślnie). Ich zadaniem jest opisać Twoje poglądy w bardziej precyzyjny sposób.",
        type: "multi_axis",
        groups: [
          {
            name: "Gospodarka",
            axes: [
              {
                id: "25233c46-e0d3-4288-ac4f-bae8b9dcda8f",
                name: "Interwencjonizm-Wolny rynek",
                start: {
                  orientation: "b7bb725e-74fc-48fb-ada9-1bb238c77280",
                  value: 77.777_777_777_777_79,
                },
                end: {
                  orientation: "0eed54fe-d1c3-431b-9ba8-b117d924411d",
                  value: 0,
                },
              },
              {
                id: "99ac7fae-050b-4847-91f9-fb2e7d83ff72",
                name: "Solidaryzm ekonomiczny-Indywidualizm ekonomiczny",
                start: {
                  orientation: "5df67347-1f24-4054-ac44-58fbefefe140",
                  value: 77.419_354_838_709_68,
                },
                end: {
                  orientation: "eb249317-b526-4ea3-82c6-bb6739d8eb4d",
                  value: 0,
                },
              },
            ],
          },
          {
            name: "Ekologia",
            axes: [
              {
                id: "94e03d6a-562a-4f7f-ba67-01a1ac41effa",
                name: "Ekologia Klimatyczna-Antyklimatyzm",
                start: {
                  orientation: "cb5e42d2-f2b6-4725-9cbb-21ab7fef818c",
                  value: 100,
                },
                end: {
                  orientation: "756d7fd2-0bb3-414d-b3c6-9dd639b3a257",
                  value: 0,
                },
              },
              {
                id: "c1ffca92-311c-4f09-b41e-81f5961198e4",
                name: "Zielona Gospodarka-Industrializm",
                start: {
                  orientation: "0654e995-7860-44b2-8476-430fdb7bec1a",
                  value: 100,
                },
                end: {
                  orientation: "5add8aaa-9589-4c63-b5a8-24b5d8141f75",
                  value: 0,
                },
              },
            ],
          },
          {
            axes: [
              {
                id: "6c2611c8-2989-48a9-ab9f-dbf45dbb3496",
                name: "Progresywizm-Tradycjonalizm",
                start: {
                  orientation: "416cd027-2a4b-41da-b122-ea478ffcb2a3",
                  value: 81.818_181_818_181_83,
                },
                end: {
                  orientation: "2254acd5-94cf-4868-a3a5-c438579a77d2",
                  value: 8.571_428_571_428_571,
                },
              },
              {
                id: "c4b9c12a-96e5-4b8a-88ea-0a0b262b13d0",
                name: "Pacyfizm-Militaryzm",
                start: {
                  orientation: "3b04dacf-b0d6-4a82-9f08-20ac80ebfc3f",
                  value: 60,
                },
                end: {
                  orientation: "3c05e3fa-84c6-4fb6-9525-f8c7abeef2bb",
                  value: 9.523_809_523_809_524,
                },
              },
              {
                id: "fe9a1d36-e127-4aee-bd88-a5638415ecc2",
                name: "Tolerancja-Ksenofobia",
                start: {
                  orientation: "b92b8298-cf06-4cd3-8e18-207f811ad697",
                  value: 85.294_117_647_058_83,
                },
                end: {
                  orientation: "a8016c76-3e01-4095-ac4b-c560321c4d59",
                  value: 0,
                },
              },
              {
                id: "10e3dd16-08a4-45de-90af-2a1dcda7177b",
                name: "Sekularyzm-Religijność",
                start: {
                  orientation: "8e84fb2e-e4ac-45b4-baf7-4d4cfa5bcb8d",
                  value: 86.363_636_363_636_36,
                },
                end: {
                  orientation: "2c997384-6331-4d55-adf3-054261647625",
                  value: 0,
                },
              },
              {
                id: "5bee0f10-a7d2-43ee-a731-384c2e68067a",
                name: "Równość-Hierarchia społeczna",
                start: {
                  orientation: "2349790d-d5c0-4538-8ae2-fffeed0bbee4",
                  value: 78.723_404_255_319_15,
                },
                end: {
                  orientation: "f65ef649-dfe8-438f-a6fe-bec7800ac021",
                  value: 0,
                },
              },
              {
                id: "5b50de95-3b38-414f-aa17-f2e1dc88bac8",
                name: "Wolność moralna-Opiekuńczość",
                start: {
                  orientation: "428d14d3-d251-444d-abd1-a6527b6edb7a",
                  value: 32.142_857_142_857_146,
                },
                end: {
                  orientation: "e5e53d87-91b6-49ac-9cfb-e609aa357968",
                  value: 60.416_666_666_666_664,
                },
              },
              {
                id: "34986b5c-5f60-407e-86e1-537b70a133da",
                name: "Równowaga polityczna-Jednowładztwo",
                start: {
                  orientation: "7695e5c8-146b-4929-94c6-aa35f752a41d",
                  value: 62.5,
                },
                end: {
                  orientation: "fbf1f664-c0f4-401f-bf1d-2f8fedd36dd2",
                  value: 16.666_666_666_666_664,
                },
              },
              {
                id: "21103775-2988-41a6-97e8-d6e955d915d6",
                name: "Decentralizacja-Centralizacja",
                start: {
                  orientation: "4daf4e78-cdf8-4b59-b369-040c645ef121",
                  value: 27.586_206_896_551_722,
                },
                end: {
                  orientation: "4f912cfe-9eb5-44e2-ad28-ad8b362d9eea",
                },
              },
              {
                id: "8994da07-5c80-475f-9aca-cff8b519a1a2",
                name: "Państwo minimum-Państwo zaangażowane",
                start: {
                  orientation: "67df60c3-0da7-4e8f-9514-32091614fe12",
                  value: 14.285_714_285_714_285,
                },
                end: {
                  orientation: "91128c5d-127b-401c-871d-c61fcc29f952",
                  value: 23.809_523_809_523_807,
                },
              },
              {
                id: "400ac069-425a-42dd-838f-083adef98f2b",
                name: "Kosmopolityzm-Patriotyzm",
                start: {
                  orientation: "756343e2-c0ec-4537-a008-33fc5d11f956",
                  value: 43.75,
                },
                end: {
                  orientation: "e1910ced-8d65-4568-8083-476cba24c52e",
                  value: 25,
                },
              },
              {
                id: "841d9884-aedd-48ad-ac5b-bc59109efcc9",
                name: "Prounijność-Antyunijność",
                start: {
                  orientation: "d5550886-3520-48af-8417-094c2c708421",
                  value: 83.333_333_333_333_34,
                },
                end: {
                  orientation: "2fa32762-cd7b-4e48-8683-6c0590379ed8",
                  value: 0,
                },
              },
              {
                id: "32460d47-dca9-4029-baa7-ad3c45740680",
                name: "Globalizm-Izolacjonizm",
                start: {
                  orientation: "1ec6ccb6-1338-450a-a0d5-f4d6fe25baa2",
                  value: 75,
                },
                end: {
                  orientation: "c83a864f-0896-4d5a-b6e5-2ab0b227e5a3",
                  value: 0,
                },
              },
            ],
          },
        ],
        marker: 50,
      },
      {
        id: "b9f37f04-1b35-4423-ba31-90d523a09664", // its identity card
        position: 2,
        column: "end",
        title: "Tożsamość",
        type: "archetype",
        lowMatch: "named",
        entries: [
          {
            orientation: "f108a0b0-1ac7-4111-88cb-a4bbfe7f059b",
            value: 80.110_497_237_569_05,
          },
          {
            orientation: "99681a0e-6851-4967-8fcc-cf77ac4717a5",
            value: 100,
          },
          {
            orientation: "14fc7ded-e9c0-447c-aa18-380d7241be00",
            value: 62.650_602_409_638_56,
          },
          {
            orientation: "5f733105-050f-4d65-8d1c-5f387212ea0b",
            value: 50.660_792_951_541_86,
          },
          {
            orientation: "296019ab-8963-4590-896e-51426517d11b",
            value: 64.768_683_274_021_36,
          },
          {
            orientation: "90e1762d-9e22-4f32-8130-e7828595ea1f",
            value: 39.814_814_814_814_82,
          },
          {
            orientation: "6f1cb5a4-232a-41b5-a848-f2329406d12d",
            value: 51.428_571_428_571_42,
          },
          {
            orientation: "59d45ff8-6e4c-47b8-895e-1846a2d0fe94",
            value: 33.232_628_398_791_54,
          },
          {
            orientation: "322b9b00-b131-4d8b-9eb5-c38ba552dc93",
            value: 13.090_909_090_909_092,
          },
          {
            orientation: "4cf08882-e9f9-4f5d-a27c-eac3f24e3a77",
            value: 30.824_372_759_856_633,
          },
          {
            orientation: "8625fa1f-e39e-4183-8a37-5d78fa6c3c85",
            value: 10.561_056_105_610_561,
          },
          {
            orientation: "4a1c3bef-42fc-49d2-b8c7-279a446aa9e3",
            value: 13.191_489_361_702_127,
          },
          {
            orientation: "a6ef4109-7141-4b0b-9924-b87a700d90b5",
            value: 8.305_647_840_531_561,
          },
          {
            orientation: "2e46f89d-913e-4d82-85a6-70a8c25902f5",
            value: 12.5,
          },
          {
            orientation: "010a5a3d-0729-4315-b231-c9dd081d0d55",
            value: 8.426_966_292_134_832,
          },
        ],
      },
      {
        id: "9ada868c-90a5-42e1-a12a-b1f4ecd3150b", // its compass
        position: 3,
        column: "end",
        description:
          "Kompas dwuosiowy to forma prezentacji Twoich poglądów na wykresie dwuosiowym. Oś pozioma to poglądy gospodarcze (lewica-prawica), a pionowa to poglądy obyczajowe (lewica na dole, prawica na górze).",
        type: "nolan_chart",
        horizontal: {
          id: "8bd5f826-1aed-409b-8a6e-da4a76189c03",
          name: "gospodarczo",
          start: {
            orientation: "b7bb725e-74fc-48fb-ada9-1bb238c77280",
            value: 77.611_940_298_507_46,
          },
          end: {
            orientation: "0eed54fe-d1c3-431b-9ba8-b117d924411d",
            value: 0,
          },
        },
        vertical: {
          id: "092ea01d-2d31-4ee2-ae30-deffa1c7c096",
          name: "światopoglądowo",
          start: {
            orientation: "416cd027-2a4b-41da-b122-ea478ffcb2a3",
            value: 66.820_276_497_695_86,
          },
          end: {
            orientation: "2254acd5-94cf-4868-a3a5-c438579a77d2",
            value: 16.831_683_168_316_832,
          },
        },
        labels: {
          centre: "Centrowy",
          horizontalStartModerate: "Lewicowy gospodarczo",
          horizontalStartExtreme: "Lewicowy gospodarczo",
          horizontalEndModerate: "Prawicowy gospodarczo",
          horizontalEndExtreme: "Prawicowy gospodarczo",
          verticalStartModerate: "Lewicowy światopoglądowo",
          verticalStartExtreme: "Lewicowy światopoglądowo",
          verticalEndModerate: "Prawicowy światopoglądowo",
          verticalEndExtreme: "Prawicowy światopoglądowo",
          topLeftModerate: "Mieszany",
          topLeftExtreme: "Mieszany",
          topRightModerate: "Prawicowy",
          topRightExtreme: "Prawicowy",
          bottomLeftModerate: "Lewicowy",
          bottomLeftExtreme: "Lewicowy",
          bottomRightModerate: "Mieszany",
          bottomRightExtreme: "Mieszany",
        },
        colors: {},
      },
      {
        id: "2c5ba77b-959e-421a-8079-edf2d948a01c", // its parties
        position: 4,
        column: "end",
        title: "Partie",
        description:
          "Te partie zazwyczaj wybierają osoby o poglądach podobnych do Twoich. W quizie tożsamościowym nie dopasowujemy partii do Twoich wyników według odpowiedzi. Zamiast tego najpierw określamy najbliższą tożsamość, a później to, jak ta tożsamość prawdopodobnie zagłosowałaby w wyborach.",
        type: "horizontal_bar",
        entries: [
          {
            orientation: "cd7c4031-81a4-4a93-aa04-a66651f10b8a",
            isOfficial: false,
          },
          {
            orientation: "c00d6c51-7ab2-450d-b779-8a01ab269965",
            isOfficial: false,
          },
        ],
        visibleRows: 3,
      },
    ],
  },
  presidential: {
    leader: {
      orientation: "565946a2-6622-4fb6-8eee-196408544e9a",
      value: 100,
    },
    header: {
      orientation: "565946a2-6622-4fb6-8eee-196408544e9a",
      confidence: 100,
      linkLabel: "Program",
      lowMatch: "no_match",
    },
    modules: [
      {
        id: "26585cf4-cfb5-4755-b6f6-f997764b60c5", // its candidates
        position: 1,
        column: "start",
        title: "Kandydaci",
        type: "horizontal_bar",
        entries: [
          {
            orientation: "565946a2-6622-4fb6-8eee-196408544e9a",
            value: 100,
            isOfficial: true,
          },
          {
            orientation: "041b4896-272f-48fe-9def-c174756819d4",
            value: 0,
            isOfficial: false,
          },
        ],
        visibleRows: 13,
      },
      {
        id: "a9fabbef-3b68-4121-ac03-174016fd849a", // its presidential identity
        position: 2,
        column: "end",
        title: "Prezydent",
        type: "archetype",
        lowMatch: "no_match",
        entries: [
          {
            orientation: "c28e9896-ff92-4881-a650-0e7f828ec381",
            value: 66.233_766_233_766_23,
          },
        ],
      },
      {
        id: "31a5619f-c941-4802-ac9b-4a477f5a2a90", // its candidates by category
        position: 3,
        column: "end",
        title: "Kategorie",
        type: "horizontal_bar",
        categories: [
          {
            id: "ff4dde33-c560-4243-bbf8-7d3016247b3b",
            name: "Polityka zagraniczna",
            entries: [
              {
                orientation: "565946a2-6622-4fb6-8eee-196408544e9a",
                value: 100,
                isOfficial: true,
              },
              {
                orientation: "041b4896-272f-48fe-9def-c174756819d4",
                value: 0,
                isOfficial: false,
              },
            ],
          },
          {
            id: "4da4b4c7-0252-4ef1-9c48-d05b1497d645",
            name: "Światopogląd",
            entries: [
              {
                orientation: "565946a2-6622-4fb6-8eee-196408544e9a",
                isOfficial: true,
              },
              {
                orientation: "041b4896-272f-48fe-9def-c174756819d4",
                isOfficial: false,
              },
            ],
          },
          {
            id: "33e1ca50-3907-411f-8733-d9462fe9bdfe",
            name: "Praworządność",
            entries: [
              {
                orientation: "565946a2-6622-4fb6-8eee-196408544e9a",
                isOfficial: true,
              },
              {
                orientation: "041b4896-272f-48fe-9def-c174756819d4",
                isOfficial: false,
              },
            ],
          },
          {
            id: "5f270f53-988e-4c8a-874c-35383dacc0c4",
            name: "Polityka krajowa",
            entries: [
              {
                orientation: "565946a2-6622-4fb6-8eee-196408544e9a",
                isOfficial: true,
              },
              {
                orientation: "041b4896-272f-48fe-9def-c174756819d4",
                isOfficial: false,
              },
            ],
          },
          {
            id: "48ac265a-96a0-4b18-a89d-3e8408aef173",
            name: "Gospodarka",
            entries: [
              {
                orientation: "565946a2-6622-4fb6-8eee-196408544e9a",
                value: 100,
                isOfficial: true,
              },
              {
                orientation: "041b4896-272f-48fe-9def-c174756819d4",
                value: 0,
                isOfficial: false,
              },
            ],
          },
        ],
        visibleRows: 3,
      },
    ],
  },
};

export const OWN_LIST_RESULTS: [
  name: string,
  survey: Survey,
  result: QuizResult,
  resolved: unknown,
][] = [
  ["the identity quiz", identityQuiz, identityQuizResult, RESOLVED.identity],
  [
    "the presidential quiz",
    presidentialQuiz,
    answerFirst(presidentialQuiz),
    RESOLVED.presidential,
  ],
];

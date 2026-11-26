import { DEFAULT_LANGUAGE } from "@/constants/common";
import { OWN_RECORD_IDS } from "@/constants/result-modules.fixtures";
import { readSurvey } from "@/services/api/utils/survey/readSurvey";
import type { QuizResult } from "@/types/results";
import type { SurveyLoadResult, SurveyLoadStatus } from "@/types/survey";
import {
  IDENTITY_QUIZ_ID,
  identityQuizResponse,
} from "@/utils/running-state/identityQuiz.fixtures";
import { getDoneQuestions } from "@/utils/running-state/progress/getDoneQuestions";
import { getRunningScores } from "@/utils/running-state/scores/getRunningScores";

// The identity quiz with result modules, and a result of it.
//
// The quiz is the cut the running state already replays, with the three
// things a result needs that the cut leaves out. They are cut as well, to
// four identities, the six parties they link, the axes of two categories and
// the two compass axes:
//   - the parties an identity links and the category of an axis, as
//     GET https://api.mypolitics.pl/api/v1/survey/{surveyId} sent them on
//     2026-10-13,
//   - the list of result modules, as the API would send it in Polish. No quiz
//     sends one yet, so it is the list that draws the result the old page drew.

export const IDENTITY_IDS = {
  internationalSocialist: "f108a0b0-1ac7-4111-88cb-a4bbfe7f059b",
  greenProgressive: "99681a0e-6851-4967-8fcc-cf77ac4717a5",
  euroEnthusiast: "296019ab-8963-4590-896e-51426517d11b",
  conservativeLibertarian: "8625fa1f-e39e-4183-8a37-5d78fa6c3c85",
};

export const PARTY_IDS = {
  nowoczesna: "a3356612-5554-4510-a867-71b03bc63980",
  nowaLewica: "c00d6c51-7ab2-450d-b779-8a01ab269965",
  razem: "fa5274b9-3b9f-4d54-a07f-fe96bb65b2a9",
  zieloni: "cd7c4031-81a4-4a93-aa04-a66651f10b8a",
  platformaObywatelska: "6a2f8e53-1573-4257-b0eb-1806e3fe137a",
  nowaNadzieja: "6a890e5e-7137-4e8c-a7ba-a140b639d71e",
};

const linkedOrientations: Record<string, string[]> = {
  [IDENTITY_IDS.internationalSocialist]: [PARTY_IDS.razem],
  [IDENTITY_IDS.greenProgressive]: [PARTY_IDS.zieloni, PARTY_IDS.nowaLewica],
  [IDENTITY_IDS.euroEnthusiast]: [
    PARTY_IDS.platformaObywatelska,
    PARTY_IDS.nowaLewica,
    PARTY_IDS.nowoczesna,
  ],
  [IDENTITY_IDS.conservativeLibertarian]: [PARTY_IDS.nowaNadzieja],
};

export const AXIS_IDS = {
  marketIntervention: "25233c46-e0d3-4288-ac4f-bae8b9dcda8f",
  economicSolidarity: "99ac7fae-050b-4847-91f9-fb2e7d83ff72",
  climate: "94e03d6a-562a-4f7f-ba67-01a1ac41effa",
  greenEconomy: "c1ffca92-311c-4f09-b41e-81f5961198e4",
  compassHorizontal: "8bd5f826-1aed-409b-8a6e-da4a76189c03",
  compassVertical: "092ea01d-2d31-4ee2-ae30-deffa1c7c096",
};

// The name of an axis as the API packs it, with its category.
const axisNames: Record<string, string> = {
  [AXIS_IDS.marketIntervention]:
    '{"name":"Interwencjonizm-Wolny rynek","category":"Gospodarka","isMain":true}',
  [AXIS_IDS.economicSolidarity]:
    '{"name":"Solidaryzm ekonomiczny-Indywidualizm ekonomiczny","category":"Gospodarka","isMain":false}',
  [AXIS_IDS.climate]:
    '{"name":"Ekologia Klimatyczna-Antyklimatyzm","category":"Ekologia","isMain":true}',
  [AXIS_IDS.greenEconomy]:
    '{"name":"Zielona Gospodarka-Industrializm","category":"Ekologia","isMain":false}',
};

const identityIds = Object.values(IDENTITY_IDS);

const resultModules = [
  {
    id: OWN_RECORD_IDS.identityHeader,
    type: "header",
    position: 0,
    orientationIds: identityIds,
    values: [
      { key: "lowMatch", value: "named" },
      {
        key: "label.lowMatch",
        value:
          "Twoje poglądy nie są wystarczająco podobne do żadnej tożsamości (mniej niż 50% pewności).",
      },
    ],
  },
  {
    id: OWN_RECORD_IDS.identityIdeologies,
    type: "multi_axis",
    position: 1,
    column: "start",
    axisIds: [
      AXIS_IDS.climate,
      AXIS_IDS.marketIntervention,
      AXIS_IDS.greenEconomy,
      AXIS_IDS.economicSolidarity,
    ],
    values: [
      { key: "title", value: "Ideologie" },
      {
        key: "description",
        value:
          "Oś określa bliskość do ideologii. Dodatkowe osie opisują Twoje poglądy na węższych płaszczyznach niż osie główne (widoczne domyślnie). Ich zadaniem jest opisać Twoje poglądy w bardziej precyzyjny sposób.",
      },
      { key: "groupBy", value: "category" },
    ],
  },
  {
    id: OWN_RECORD_IDS.identityArchetype,
    type: "archetype",
    position: 2,
    column: "end",
    orientationIds: identityIds,
    values: [
      { key: "title", value: "Tożsamość" },
      { key: "lowMatch", value: "named" },
    ],
  },
  {
    id: OWN_RECORD_IDS.identityCompass,
    type: "nolan_chart",
    position: 3,
    column: "end",
    axisIds: [AXIS_IDS.compassHorizontal, AXIS_IDS.compassVertical],
    values: [
      { key: "label.centre", value: "Centrowy" },
      { key: "label.horizontalStartModerate", value: "Lewicowy gospodarczo" },
      { key: "label.horizontalEndModerate", value: "Prawicowy gospodarczo" },
      {
        key: "label.verticalStartModerate",
        value: "Lewicowy światopoglądowo",
      },
      {
        key: "label.verticalEndModerate",
        value: "Prawicowy światopoglądowo",
      },
      { key: "label.bottomLeftModerate", value: "Lewicowy" },
      { key: "label.bottomLeftExtreme", value: "Lewicowy" },
      { key: "label.topRightModerate", value: "Prawicowy" },
      { key: "label.topRightExtreme", value: "Prawicowy" },
      { key: "label.topLeftModerate", value: "Mieszany" },
      { key: "label.topLeftExtreme", value: "Mieszany" },
      { key: "label.bottomRightModerate", value: "Mieszany" },
      { key: "label.bottomRightExtreme", value: "Mieszany" },
    ],
  },
  {
    id: OWN_RECORD_IDS.identityParties,
    type: "horizontal_bar",
    position: 4,
    column: "end",
    orientationIds: Object.values(PARTY_IDS),
    values: [
      { key: "title", value: "Partie" },
      {
        key: "description",
        value:
          "Te partie zazwyczaj wybierają osoby o poglądach podobnych do Twoich. W quizie tożsamościowym nie dopasowujemy partii do Twoich wyników według odpowiedzi. Zamiast tego najpierw określamy najbliższą tożsamość, a później to, jak ta tożsamość prawdopodobnie zagłosowałaby w wyborach.",
      },
      { key: "selection", value: "linked_to_leader" },
      { key: "label.empty", value: "Brak najbliższej partii" },
    ],
  },
];

export const identityResultQuiz = (
  readSurvey(
    {
      ...identityQuizResponse,
      orientations: identityQuizResponse.orientations.map((orientation) => ({
        ...orientation,
        linkedOrientations: linkedOrientations[orientation.id] ?? [],
      })),
      axis: identityQuizResponse.axis.map((axis) => ({
        ...axis,
        name: axisNames[axis.id] ?? axis.name,
      })),
      resultModules,
    },
    IDENTITY_QUIZ_ID,
    DEFAULT_LANGUAGE,
  ) as Extract<SurveyLoadResult, { status: typeof SurveyLoadStatus.Ready }>
).survey;

// The answers of a taker who answers every question the way that gives one
// identity the most. A question with no answer that supports the identity is
// answered with its last answer.
const answerFor = (identityId: string): QuizResult["answers"] =>
  identityResultQuiz.questions.map(({ id, possibleAnswers }) => {
    const [best = possibleAnswers[possibleAnswers.length - 1]] = possibleAnswers
      .filter(({ orientationIds }) => orientationIds.includes(identityId))
      .sort((first, second) => second.weight - first.weight);

    return { questionId: id, answerId: best.id };
  });

// The scores are the ones the back-end counts for the answers: over the
// whole quiz, with no category prioritised.
const toResult = (answers: QuizResult["answers"]): QuizResult => ({
  scores: getRunningScores(
    identityResultQuiz,
    getDoneQuestions(identityResultQuiz, answers),
    [],
  ),
  answers,
});

// A taker who answers every question the way that gives the green progressive
// the most. Every question of the quiz has an answer that supports it.
export const identityQuizResult: QuizResult = toResult(
  answerFor(IDENTITY_IDS.greenProgressive),
);

// A second result of the quiz, for a comparison: a made-up friend who answers
// the way that gives the conservative libertarian the most.
export const identityFriendResult: QuizResult = toResult(
  answerFor(IDENTITY_IDS.conservativeLibertarian),
);

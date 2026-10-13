import { DEFAULT_LANGUAGE } from "@/constants/common";
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
    id: "identity-header",
    type: "header",
    position: 0,
    orientationIds: identityIds,
  },
  {
    id: "identity-archetype",
    type: "archetype",
    position: 1,
    column: "end",
    title: "Tożsamość",
    orientationIds: identityIds,
  },
  {
    id: "identity-ideologies",
    type: "multi_axis",
    position: 2,
    column: "start",
    title: "Ideologie",
    axisIds: [
      AXIS_IDS.climate,
      AXIS_IDS.marketIntervention,
      AXIS_IDS.greenEconomy,
      AXIS_IDS.economicSolidarity,
    ],
    groupBy: "category",
  },
  {
    id: "identity-compass",
    type: "nolan_chart",
    position: 3,
    column: "end",
    axisIds: [AXIS_IDS.compassHorizontal, AXIS_IDS.compassVertical],
    labels: {
      centre: "Centrowy",
      horizontalStartModerate: "Lewicowy gospodarczo",
      horizontalEndModerate: "Prawicowy gospodarczo",
      verticalStartModerate: "Lewicowy światopoglądowo",
      verticalEndModerate: "Prawicowy światopoglądowo",
      bottomLeftModerate: "Lewicowy",
      bottomLeftExtreme: "Lewicowy",
      topRightModerate: "Prawicowy",
      topRightExtreme: "Prawicowy",
      topLeftModerate: "Mieszany",
      topLeftExtreme: "Mieszany",
      bottomRightModerate: "Mieszany",
      bottomRightExtreme: "Mieszany",
    },
  },
  {
    id: "identity-parties",
    type: "horizontal_bar",
    position: 4,
    column: "start",
    title: "Partie",
    description:
      "W quizie tożsamościowym nie dopasowujemy partii do Twoich wyników według odpowiedzi. Zamiast tego najpierw określamy najbliższą tożsamość, a później to, jak ta tożsamość prawdopodobnie zagłosowałaby w wyborach.",
    orientationIds: Object.values(PARTY_IDS),
    selection: "linked_to_leader",
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

// A taker who answers every question the way that gives the green progressive
// the most. Every question of the quiz has an answer that supports it.
const answers = identityResultQuiz.questions.map(({ id, possibleAnswers }) => ({
  questionId: id,
  answerId: possibleAnswers
    .filter(({ orientationIds }) =>
      orientationIds.includes(IDENTITY_IDS.greenProgressive),
    )
    .sort((first, second) => second.weight - first.weight)[0].id,
}));

// The scores are the ones the back-end counts for those answers: over the
// whole quiz, with no category prioritised.
export const identityQuizResult: QuizResult = {
  scores: getRunningScores(
    identityResultQuiz,
    getDoneQuestions(identityResultQuiz, answers),
    [],
  ),
  answers,
};

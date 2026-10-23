import { SURVEY_ID } from "../survey/survey.fixture";

// A small identity quiz and a calculated result of it, in the shapes
// GET /v1/survey/{surveyId} and GET /v1/result/{resultId} send them.
//
// The quiz sends its own list of result modules, so the screen is composed
// from the API's list: the header over the two identities, the ideologies
// and the parties of the leader in the start column, the identity in the end
// column. It has two visible categories and two scale questions, so a taker
// can be led through it in a few steps.
//
// In the result the green progressive leads with 90 of 100, which makes its
// two parties the ones the ranking shows.

export const RESULT_ID = "3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11";
export const RESULT_QUIZ_NAME = "Quiz Tożsamościowy próbny";
export const LEADER_NAME = "Zielony postępowiec";
export const PARTIES_DESCRIPTION =
  "Najpierw określamy najbliższą tożsamość, a później to, jak ta tożsamość prawdopodobnie zagłosowałaby w wyborach.";

const CATEGORY_IDS = {
  economy: "c1d2e3f4-0001-4a5b-8c6d-7e8f9a0b1c2d",
  worldview: "c1d2e3f4-0002-4a5b-8c6d-7e8f9a0b1c2d",
};

const IDS = {
  green: "a1b2c3d4-0001-4e5f-8a9b-0c1d2e3f4a5b",
  conservative: "a1b2c3d4-0002-4e5f-8a9b-0c1d2e3f4a5b",
  greens: "a1b2c3d4-0003-4e5f-8a9b-0c1d2e3f4a5b",
  newLeft: "a1b2c3d4-0004-4e5f-8a9b-0c1d2e3f4a5b",
  right: "a1b2c3d4-0005-4e5f-8a9b-0c1d2e3f4a5b",
  intervention: "a1b2c3d4-0006-4e5f-8a9b-0c1d2e3f4a5b",
  market: "a1b2c3d4-0007-4e5f-8a9b-0c1d2e3f4a5b",
  progress: "a1b2c3d4-0008-4e5f-8a9b-0c1d2e3f4a5b",
  tradition: "a1b2c3d4-0009-4e5f-8a9b-0c1d2e3f4a5b",
};

const AXIS_IDS = {
  economy: "b1c2d3e4-0001-4f5a-9b8c-7d6e5f4a3b2c",
  worldview: "b1c2d3e4-0002-4f5a-9b8c-7d6e5f4a3b2c",
};

const toOrientation = (
  id: string,
  type: "IDENTITY" | "PARTY" | "IDEOLOGY",
  generalName: string,
  color: string,
  linkedOrientations: string[] = [],
) => ({
  id,
  type,
  color,
  logoUrl: null,
  surveyId: SURVEY_ID,
  generalName,
  explanation: null,
  linkedOrientations,
});

const toPackedName = (name: string): string =>
  JSON.stringify({ name, isHidden: false });

// A scale question: the agreeing answers score the first orientations, the
// disagreeing ones the second.
const toQuestion = (
  id: string,
  categoryId: string,
  text: string,
  agreeing: string[],
  disagreeing: string[],
) => ({
  id,
  surveyId: SURVEY_ID,
  categoryId,
  text,
  explanation: null,
  answerType: "AGREE_OR_DISAGREE",
  status: "LIVE",
  possibleAnswers: [
    { text: "Zdecydowanie za", weight: 2, orientationIds: agreeing },
    { text: "Częściowo za", weight: 1, orientationIds: agreeing },
    { text: "Częściowo przeciw", weight: 1, orientationIds: disagreeing },
    { text: "Zdecydowanie przeciw", weight: 2, orientationIds: disagreeing },
  ].map((answer, index) => ({
    ...answer,
    id: `${id}-a${index + 1}`,
    questionId: id,
  })),
});

export const RESULT_QUESTIONS = [
  toQuestion(
    "result-q1",
    CATEGORY_IDS.economy,
    "Państwo powinno inwestować w transport publiczny.",
    [IDS.green, IDS.intervention],
    [IDS.conservative, IDS.market],
  ),
  toQuestion(
    "result-q2",
    CATEGORY_IDS.worldview,
    "Związki partnerskie powinny być uznawane przez państwo.",
    [IDS.green, IDS.progress],
    [IDS.conservative, IDS.tradition],
  ),
];

export const resultSurveyFixture = {
  id: SURVEY_ID,
  title: RESULT_QUIZ_NAME,
  description: "Quiz do testów ekranu wyników.",
  createdAt: "2025-03-01T22:25:03.037Z",
  type: "OFFICIAL",
  isPublic: true,
  averageFinishTime: 1,
  version: "e2e-results-1",
  algorithm: "default",
  authors: [],
  defaultLanguage: "pl",
  supportedLanguages: ["pl"],
  orientations: [
    toOrientation(IDS.green, "IDENTITY", LEADER_NAME, "#27ae60", [
      IDS.greens,
      IDS.newLeft,
    ]),
    toOrientation(
      IDS.conservative,
      "IDENTITY",
      "Narodowy konserwatysta",
      "#2c3e50",
      [IDS.right],
    ),
    toOrientation(IDS.greens, "PARTY", "Zieloni", "#249668"),
    toOrientation(IDS.newLeft, "PARTY", "Nowa Lewica", "#a01846"),
    toOrientation(IDS.right, "PARTY", "Prawica", "#1a3a7c"),
    toOrientation(IDS.intervention, "IDEOLOGY", "Interwencjonizm", "#c0392b"),
    toOrientation(IDS.market, "IDEOLOGY", "Wolny rynek", "#27ae60"),
    toOrientation(IDS.progress, "IDEOLOGY", "Progresywizm", "#8e44ad"),
    toOrientation(IDS.tradition, "IDEOLOGY", "Tradycjonalizm", "#16a085"),
  ],
  categories: [
    { id: CATEGORY_IDS.economy, name: toPackedName("Gospodarka"), weight: 1 },
    {
      id: CATEGORY_IDS.worldview,
      name: toPackedName("Światopogląd"),
      weight: 1,
    },
  ],
  axis: [
    {
      id: AXIS_IDS.economy,
      name: JSON.stringify({
        name: "Interwencjonizm-Wolny rynek",
        category: "Gospodarka",
        isMain: true,
      }),
      type: "axis",
      description: "Oś gospodarcza.",
      negativeOrientations: [IDS.intervention],
      positiveOrientations: [IDS.market],
    },
    {
      id: AXIS_IDS.worldview,
      name: JSON.stringify({
        name: "Progresywizm-Tradycjonalizm",
        category: "Światopogląd",
        isMain: true,
      }),
      type: "axis",
      description: "Oś światopoglądowa.",
      negativeOrientations: [IDS.progress],
      positiveOrientations: [IDS.tradition],
    },
  ],
  questions: RESULT_QUESTIONS,
  resultModules: [
    {
      id: "result-header",
      type: "header",
      position: 0,
      orientationIds: [IDS.green, IDS.conservative],
    },
    {
      id: "result-ideologies",
      type: "multi_axis",
      position: 1,
      column: "start",
      title: "Ideologie",
      axisIds: [AXIS_IDS.economy, AXIS_IDS.worldview],
      groupBy: "category",
    },
    {
      id: "result-identity",
      type: "archetype",
      position: 2,
      column: "end",
      title: "Tożsamość",
      orientationIds: [IDS.green, IDS.conservative],
    },
    {
      id: "result-parties",
      type: "horizontal_bar",
      position: 3,
      column: "start",
      title: "Partie",
      description: PARTIES_DESCRIPTION,
      orientationIds: [IDS.greens, IDS.newLeft, IDS.right],
      selection: "linked_to_leader",
    },
  ],
};

const toScore = (id: string, points: number) => ({
  id,
  points,
  maxPossible: 10,
});

// The result of a taker of that quiz, once it is calculated.
export const createResultResponse = (
  resultId: string,
  answers: unknown[] = [
    { questionId: "result-q1", answerId: "result-q1-a1" },
    { questionId: "result-q2", answerId: "result-q2-a2" },
  ],
) => ({
  id: resultId,
  surveyId: SURVEY_ID,
  prioritizedCategories: [],
  results: {
    algorithm: "default",
    calculatedAt: "2026-10-08T10:00:00.000Z",
    orientations: [
      toScore(IDS.green, 9),
      toScore(IDS.conservative, 2),
      toScore(IDS.intervention, 7),
      toScore(IDS.market, 3),
      toScore(IDS.progress, 8),
      toScore(IDS.tradition, 2),
    ],
  },
  answers,
  createdAt: "2026-10-08T09:59:58.000Z",
  calculatedAt: "2026-10-08T10:00:00.000Z",
});

import { SURVEY_ID } from "./survey.fixture";

// A quiz with two axes, in the shape GET /v1/survey/{surveyId} sends it:
// sixteen scale questions of one category, four orientations, and two axes of
// type `axis`. Questions 1 to 5 and 12 to 16 belong to the first axis,
// questions 6 to 11 to the second. In every question the two agreeing answers
// score the positive side of the question's axis and the two disagreeing
// answers its negative side.
//
// It has one visible category, so no topics are picked, and it has no
// identity orientations and no compass axes. After five answers only the
// first axis has five answered questions behind it, and the axis closeness
// card - ahead of the puzzle in priority - takes that axis. The next card can
// come no sooner than six questions later, at the boundary after the
// eleventh question, where only the second axis is left; a second closeness
// card in a row is left out, so the card there is the single axis puzzle
// about the second axis.

const CATEGORY_ID = "8c2d4e6f-1a3b-4c5d-8e7f-2b3c4d5e6f7a";
const QUESTION_COUNT = 16;
// The questions of the second axis, by their place in the quiz.
const SECOND_AXIS_FROM = 5;
const SECOND_AXIS_TO = 11;

const toOrientation = (id: string, generalName: string, color: string) => ({
  id,
  type: "IDEOLOGY",
  color,
  logoUrl: null,
  surveyId: SURVEY_ID,
  generalName,
  explanation: null,
  linkedOrientations: [],
});

const CONSERVATISM = toOrientation(
  "a1b2c3d4-1111-4a6b-9c7e-1d2f3a4b5c6d",
  "Konserwatyzm",
  "#b67559",
);
const PROGRESSIVISM = toOrientation(
  "a1b2c3d4-2222-4a6b-9c7e-1d2f3a4b5c6d",
  "Progresywizm",
  "#1a79bc",
);
const INTERVENTIONISM = toOrientation(
  "a1b2c3d4-3333-4a6b-9c7e-1d2f3a4b5c6d",
  "Interwencjonizm",
  "#e74c3c",
);
const FREE_MARKET = toOrientation(
  "a1b2c3d4-4444-4a6b-9c7e-1d2f3a4b5c6d",
  "Wolny rynek",
  "#2ecc71",
);

// The two poles of the second axis, in the order of the bar: the negative
// side first.
export const AXIS_PUZZLE_POLES = [
  INTERVENTIONISM.generalName,
  FREE_MARKET.generalName,
];

const AXES = [
  {
    id: "c3d4e5f6-1111-4d80-a1e4-6f5d4c3b2a19",
    name: "Konserwatyzm-Progresywizm",
    category: "Społeczeństwo",
    negative: CONSERVATISM,
    positive: PROGRESSIVISM,
  },
  {
    id: "c3d4e5f6-2222-4d80-a1e4-6f5d4c3b2a19",
    name: "Interwencjonizm-Wolny rynek",
    category: "Gospodarka",
    negative: INTERVENTIONISM,
    positive: FREE_MARKET,
  },
];

// The four answers of a scale question, each with its weight and the side of
// the question's axis it scores.
const SCALE = [
  { text: "Zdecydowanie za", weight: 2, side: "positive" },
  { text: "Częściowo za", weight: 1, side: "positive" },
  { text: "Częściowo przeciw", weight: 1, side: "negative" },
  { text: "Zdecydowanie przeciw", weight: 2, side: "negative" },
] as const;

export const AXIS_PUZZLE_QUESTIONS = Array.from(
  { length: QUESTION_COUNT },
  (_, questionIndex) => {
    const id = `puzzle-q${questionIndex + 1}`;
    const isOfSecondAxis =
      questionIndex >= SECOND_AXIS_FROM && questionIndex < SECOND_AXIS_TO;
    const axis = AXES[isOfSecondAxis ? 1 : 0];

    return {
      id,
      surveyId: SURVEY_ID,
      categoryId: CATEGORY_ID,
      text: `Stwierdzenie ${questionIndex + 1} o państwie.`,
      explanation: null,
      answerType: "AGREE_OR_DISAGREE",
      status: "LIVE",
      possibleAnswers: SCALE.map(({ text, weight, side }, index) => ({
        id: `${id}-a${index + 1}`,
        text,
        weight,
        questionId: id,
        orientationIds: [axis[side].id],
      })),
    };
  },
);

export const axisPuzzleSurveyFixture = {
  id: SURVEY_ID,
  title: "Quiz próbny z dwiema osiami",
  description: "Quiz do testów kart checkpointów.",
  createdAt: "2025-03-01T22:25:03.037Z",
  type: "OFFICIAL",
  isPublic: true,
  averageFinishTime: QUESTION_COUNT,
  version: "e2e-axis-puzzle-1",
  algorithm: "default",
  authors: [],
  defaultLanguage: "pl",
  supportedLanguages: ["pl"],
  orientations: [CONSERVATISM, PROGRESSIVISM, INTERVENTIONISM, FREE_MARKET],
  categories: [
    {
      id: CATEGORY_ID,
      name: JSON.stringify({ name: "Państwo", isHidden: false }),
      weight: 1,
    },
  ],
  axis: AXES.map(({ id, name, category, negative, positive }) => ({
    id,
    name: JSON.stringify({ name, category, isMain: true }),
    type: "axis",
    description: `Oś ${name}.`,
    negativeOrientations: [negative.id],
    positiveOrientations: [positive.id],
  })),
  questions: AXIS_PUZZLE_QUESTIONS,
};

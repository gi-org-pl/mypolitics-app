import { SURVEY_ID } from "./survey.fixture";

// A quiz with one axis, in the shape GET /v1/survey/{surveyId} sends it: nine
// scale questions of one category, two orientations, and one axis of type
// `axis` with the first orientation on its negative side and the second on
// its positive side. In every question the two agreeing answers score the
// first orientation and the two disagreeing answers score the second.
//
// It has one visible category, so no categories are picked, and it has no
// identity orientations and no compass axes: the only personal checkpoint
// card that can fire in it is the axis closeness card, after the fifth
// answer.

const CATEGORY_ID = "5b8a3c1e-2f4d-4a6b-9c7e-1d2f3a4b5c6d";
const AXIS_ID = "7e1c9a52-3b6f-4d80-a1e4-6f5d4c3b2a19";
const QUESTION_COUNT = 9;

export const AXIS_ORIENTATIONS = [
  {
    id: "c2a4e6f8-1b3d-4f5a-8c7e-9a0b1c2d3e4f",
    type: "IDEOLOGY",
    color: "#b67559",
    logoUrl: null,
    surveyId: SURVEY_ID,
    generalName: "Eurosceptycyzm",
    explanation: null,
    linkedOrientations: [],
  },
  {
    id: "d3b5f7a9-2c4e-4a6b-9d8f-0b1c2d3e4f5a",
    type: "IDEOLOGY",
    color: "#1a79bc",
    logoUrl: null,
    surveyId: SURVEY_ID,
    generalName: "Federacjonizm",
    explanation: null,
    linkedOrientations: [],
  },
];

const [FIRST_ORIENTATION, SECOND_ORIENTATION] = AXIS_ORIENTATIONS;

// The four answers of a scale question, each with the orientation it scores.
const SCALE = [
  { text: "Zdecydowanie za", weight: 2, orientationId: FIRST_ORIENTATION.id },
  { text: "Częściowo za", weight: 1, orientationId: FIRST_ORIENTATION.id },
  {
    text: "Częściowo przeciw",
    weight: 1,
    orientationId: SECOND_ORIENTATION.id,
  },
  {
    text: "Zdecydowanie przeciw",
    weight: 2,
    orientationId: SECOND_ORIENTATION.id,
  },
];

export const AXIS_QUESTIONS = Array.from(
  { length: QUESTION_COUNT },
  (_, questionIndex) => {
    const id = `axis-q${questionIndex + 1}`;

    return {
      id,
      surveyId: SURVEY_ID,
      categoryId: CATEGORY_ID,
      text: `Stwierdzenie ${questionIndex + 1} o Unii Europejskiej.`,
      explanation: null,
      answerType: "AGREE_OR_DISAGREE",
      status: "LIVE",
      possibleAnswers: SCALE.map(({ text, weight, orientationId }, index) => ({
        id: `${id}-a${index + 1}`,
        text,
        weight,
        questionId: id,
        orientationIds: [orientationId],
      })),
    };
  },
);

export const axisSurveyFixture = {
  id: SURVEY_ID,
  title: "Quiz próbny z osią",
  description: "Quiz do testów kart checkpointów.",
  createdAt: "2025-03-01T22:25:03.037Z",
  type: "OFFICIAL",
  isPublic: true,
  averageFinishTime: QUESTION_COUNT,
  version: "e2e-axis-1",
  algorithm: "default",
  authors: [],
  defaultLanguage: "pl",
  supportedLanguages: ["pl"],
  orientations: AXIS_ORIENTATIONS,
  categories: [
    {
      id: CATEGORY_ID,
      name: JSON.stringify({ name: "Unia Europejska", isHidden: false }),
      weight: 1,
    },
  ],
  axis: [
    {
      id: AXIS_ID,
      name: JSON.stringify({
        name: "Eurosceptycyzm-Federacjonizm",
        category: "Unia Europejska",
        isMain: true,
      }),
      type: "axis",
      description: "Oś stosunku do integracji europejskiej.",
      negativeOrientations: [FIRST_ORIENTATION.id],
      positiveOrientations: [SECOND_ORIENTATION.id],
    },
  ],
  questions: AXIS_QUESTIONS,
};

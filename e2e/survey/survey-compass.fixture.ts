import { SURVEY_ID, surveyFixture } from "./survey.fixture";

// A quiz with a compass, in the shape GET /v1/survey/{surveyId} sends it:
// twenty scale questions in one category, an average finish time of twenty
// minutes, four orientations and the two axes of the compass - left to right
// and down to up. Every question pulls the same way: agreeing gives its
// points to "right" and "up", disagreeing to "left" and "down".
//
// So the first answer decides the corner the taker starts in, at the extreme
// level, and answering the other way from then on carries them through the
// middle into the opposite quadrant: two quadrants are visited well before
// the tenth question. The path card needs ten done questions, so it fires at
// the boundary after the tenth - where the halfway card is due too and loses
// to it. No other card can fire in this quiz.

const CATEGORY_ID = "8c2f5d1b-3e47-4a90-b6d2-5f1e7a9c0d34";
const QUESTION_COUNT = 20;

const ORIENTATION_IDS = {
  left: "1d0b3a52-6c7e-4f18-9a2b-0c4d5e6f7a81",
  right: "2e1c4b63-7d8f-4a29-8b3c-1d5e6f7a8b92",
  down: "3f2d5c74-8e9a-4b3a-9c4d-2e6f7a8b9ca3",
  up: "4a3e6d85-9fab-4c4b-8d5e-3f7a8b9cadb4",
};

const AGREE = [ORIENTATION_IDS.right, ORIENTATION_IDS.up];
const DISAGREE = [ORIENTATION_IDS.left, ORIENTATION_IDS.down];

export const COMPASS_CATEGORY = "Poglądy";

export const COMPASS_ANSWERS = [
  { text: "Zdecydowanie za", weight: 2, orientationIds: AGREE },
  { text: "Częściowo za", weight: 1, orientationIds: AGREE },
  { text: "Częściowo przeciw", weight: 1, orientationIds: DISAGREE },
  { text: "Zdecydowanie przeciw", weight: 2, orientationIds: DISAGREE },
];

const toOrientation = (id: string, name: string) => ({
  id,
  type: "IDEOLOGY",
  generalName: name,
  surveyId: SURVEY_ID,
});

const toAxis = (
  id: string,
  name: string,
  type: "compass_x_axis" | "compass_y_axis",
  negativeId: string,
  positiveId: string,
) => ({
  id,
  name: JSON.stringify({ name }),
  type,
  negativeOrientations: [negativeId],
  positiveOrientations: [positiveId],
});

export const COMPASS_QUESTIONS = Array.from(
  { length: QUESTION_COUNT },
  (_, index) => {
    const id = `q${index + 1}`;

    return {
      id,
      surveyId: SURVEY_ID,
      categoryId: CATEGORY_ID,
      text: `Teza numer ${index + 1} powinna zostać przyjęta.`,
      explanation: null as string | null,
      answerType: "AGREE_OR_DISAGREE" as const,
      status: "LIVE",
      possibleAnswers: COMPASS_ANSWERS.map((answer, answerIndex) => ({
        id: `${id}-a${answerIndex + 1}`,
        questionId: id,
        ...answer,
      })),
    };
  },
);

export const compassSurveyFixture = {
  ...surveyFixture,
  title: "Quiz z kompasem",
  averageFinishTime: QUESTION_COUNT,
  version: "e2e-compass-1",
  orientations: [
    toOrientation(ORIENTATION_IDS.left, "Lewo"),
    toOrientation(ORIENTATION_IDS.right, "Prawo"),
    toOrientation(ORIENTATION_IDS.down, "Dół"),
    toOrientation(ORIENTATION_IDS.up, "Góra"),
  ],
  categories: [
    {
      id: CATEGORY_ID,
      name: JSON.stringify({ name: COMPASS_CATEGORY, isHidden: false }),
      weight: 1,
    },
  ],
  axis: [
    toAxis(
      "5b4f7e96-a0bc-4d5c-9e6f-4a8b9cadbec5",
      "Lewo-Prawo",
      "compass_x_axis",
      ORIENTATION_IDS.left,
      ORIENTATION_IDS.right,
    ),
    toAxis(
      "6c5a8fa7-b1cd-4e6d-8f7a-5b9cadbecfd6",
      "Dół-Góra",
      "compass_y_axis",
      ORIENTATION_IDS.down,
      ORIENTATION_IDS.up,
    ),
  ],
  questions: COMPASS_QUESTIONS,
};

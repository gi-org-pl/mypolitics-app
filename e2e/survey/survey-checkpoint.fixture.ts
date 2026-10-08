import { SURVEY_ID, surveyFixture } from "./survey.fixture";

// A quiz for the Checkpoints phase, in the shape GET /v1/survey/{surveyId}
// sends it: nine scale questions in one category, an average finish time of
// nine minutes, no axes and no orientations. With one category there is no
// category select, and the only card that can fire in such a quiz is the
// halfway card, at the boundary after the fifth question.

const CATEGORY_ID = "4f0b8a53-7a0e-4f8e-9d55-3c1c6c1c7b21";

export const CHECKPOINT_CATEGORY = "Państwo";

export const CHECKPOINT_ANSWERS = [
  "Zdecydowanie za",
  "Częściowo za",
  "Częściowo przeciw",
  "Zdecydowanie przeciw",
];

const STATEMENTS = [
  "Państwo powinno podnosić płacę minimalną co roku.",
  "Komunikacja miejska powinna być bezpłatna.",
  "Szkoły powinny uczyć programowania od pierwszej klasy.",
  "Samorządy powinny dostawać większą część podatków.",
  "Niedziele powinny być wolne od handlu.",
  "Głosowanie przez internet powinno być możliwe w wyborach.",
  "Państwo powinno dopłacać do remontów starych budynków.",
  "Wiek emerytalny powinien być taki sam dla wszystkich.",
  "Urzędy powinny załatwiać każdą sprawę przez internet.",
];

export const CHECKPOINT_QUESTIONS = STATEMENTS.map((text, index) => {
  const id = `q${index + 1}`;

  return {
    id,
    surveyId: SURVEY_ID,
    categoryId: CATEGORY_ID,
    text,
    explanation: null as string | null,
    answerType: "AGREE_OR_DISAGREE" as const,
    status: "LIVE",
    possibleAnswers: CHECKPOINT_ANSWERS.map((answerText, answerIndex) => ({
      id: `${id}-a${answerIndex + 1}`,
      text: answerText,
      weight: 2,
      questionId: id,
      orientationIds: [],
    })),
  };
});

export const checkpointSurveyFixture = {
  ...surveyFixture,
  title: "Quiz z checkpointem",
  averageFinishTime: STATEMENTS.length,
  version: "e2e-checkpoint-1",
  orientations: [],
  categories: [
    {
      id: CATEGORY_ID,
      name: JSON.stringify({ name: CHECKPOINT_CATEGORY, isHidden: false }),
      weight: 1,
    },
  ],
  axis: [],
  questions: CHECKPOINT_QUESTIONS,
};

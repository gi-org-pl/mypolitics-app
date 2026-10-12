import type { Survey } from "@/types/survey";

import { createSurvey } from "./createSurvey";
import { createSurveyQuestion } from "./createSurveyQuestion";

const QUESTIONS = 9;

// A quiz for the tests of the Checkpoints phase: nine questions of one
// category, q1 to q9, two answers each, and an average finish time of nine
// minutes. It has no axes and no named positions, so the only card that can
// fire in it is the halfway card, at the boundary after the fifth question.
export const createNineQuestionSurvey = (
  overrides: Partial<Survey> = {},
): Survey =>
  createSurvey({
    averageFinishTime: QUESTIONS,
    questions: Array.from({ length: QUESTIONS }, (_, index) =>
      createSurveyQuestion(`q${index + 1}`, ["Za", "Przeciw"], {
        categoryId: "economy",
      }),
    ),
    ...overrides,
  });

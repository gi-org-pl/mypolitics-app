import type { SurveyQuestion } from "@/types/survey";

import { createSurveyQuestion } from "./createSurveyQuestion";

// A question for a test quiz, given by what its possible answers score: each
// is a weight and the orientations it goes to, in the order given. The
// answers are identified by their place: `${id}-a1`, ...
export const createScoredQuestion = (
  id: string,
  answers: [weight: number, orientationIds: string[]][],
  overrides: Partial<SurveyQuestion> = {},
): SurveyQuestion =>
  createSurveyQuestion(id, [], {
    possibleAnswers: answers.map(([weight, orientationIds], index) => ({
      id: `${id}-a${index + 1}`,
      text: `Odpowiedź ${index + 1}`,
      weight,
      orientationIds,
    })),
    ...overrides,
  });

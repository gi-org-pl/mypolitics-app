import type { SurveyQuestion } from "@/types/survey";

// A scale question for a test quiz, with one possible answer per text, in the
// order given. The answers are identified by their place: `${id}-a1`, ...
export const createSurveyQuestion = (
  id: string,
  answerTexts: string[],
  overrides: Partial<SurveyQuestion> = {},
): SurveyQuestion => ({
  id,
  text: `Stwierdzenie ${id}.`,
  answerType: "agree-or-disagree",
  possibleAnswers: answerTexts.map((text, index) => ({
    id: `${id}-a${index + 1}`,
    text,
    weight: 1,
    orientationIds: [],
  })),
  ...overrides,
});

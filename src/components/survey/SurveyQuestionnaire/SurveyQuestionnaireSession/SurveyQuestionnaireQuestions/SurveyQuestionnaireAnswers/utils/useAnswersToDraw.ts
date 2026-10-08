import { useMemo } from "react";

import type { SurveyAnswerToDraw, SurveyQuestion } from "@/types/survey";
import { getAnswersToDraw } from "@/utils/survey/getAnswersToDraw";

// The answers of a question, with their kind and in their order: worked out
// once per question, when it is shown, and not on every render of a press.
export const useAnswersToDraw = (
  question: SurveyQuestion,
): SurveyAnswerToDraw[] =>
  useMemo(() => getAnswersToDraw(question), [question]);

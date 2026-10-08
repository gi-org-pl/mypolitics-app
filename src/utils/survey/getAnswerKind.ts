import { SURVEY_SCALE_ANSWER_KINDS } from "@/constants/survey";
import type {
  SurveyAnswerKind,
  SurveyPossibleAnswer,
  SurveyQuestion,
} from "@/types/survey";

// The answer type of the question decides whether the text is read at all:
// only a scale question has steps.
export const getAnswerKind = (
  question: SurveyQuestion,
  answer: SurveyPossibleAnswer,
): SurveyAnswerKind => {
  const step =
    question.answerType === "agree-or-disagree"
      ? SURVEY_SCALE_ANSWER_KINDS.get(answer.text.trim().toLowerCase())
      : undefined;

  return step ?? "custom";
};

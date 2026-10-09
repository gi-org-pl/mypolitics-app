import { SURVEY_SCALE_ANSWER_KINDS } from "@/constants/survey";
import type {
  SurveyAnswerKind,
  SurveyPossibleAnswer,
  SurveyQuestion,
} from "@/types/survey";

// The answer type of the question decides whether the text is read at all:
// only a scale question has steps. The text is looked up among the wordings
// of every language the app is in, whatever language the quiz was asked for.
// A wording that is not among them makes the answer a custom one.
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

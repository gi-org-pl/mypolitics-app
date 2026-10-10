import { SURVEY_ANSWER_KINDS } from "@/constants/survey";
import type { SurveyAnswerToDraw, SurveyQuestion } from "@/types/survey";
import { toSingleLine } from "@/utils/text/toSingleLine";

import { getAnswerKind } from "./getAnswerKind";

// The scale first, in its own order, then the custom answers. Answers of the
// same kind keep the order the API sent them in.
export const getAnswersToDraw = (
  question: SurveyQuestion,
): SurveyAnswerToDraw[] =>
  question.possibleAnswers
    .map((answer) => ({
      id: answer.id,
      label: toSingleLine(answer.text),
      kind: getAnswerKind(question, answer),
    }))
    .sort(
      (first, second) =>
        SURVEY_ANSWER_KINDS.indexOf(first.kind) -
        SURVEY_ANSWER_KINDS.indexOf(second.kind),
    );

import type { FriendSide } from "@/types/comparison";
import type { SurveyPossibleAnswer, SurveyQuestion } from "@/types/survey";

import { getChosenAnswer } from "./getChosenAnswer";

// The answers of a friend to a question: the one they chose, or none when
// they did not answer it.
export const getFriendAnswers = (
  question: Pick<SurveyQuestion, "id" | "possibleAnswers">,
  { result }: Pick<FriendSide, "result">,
): SurveyPossibleAnswer[] => {
  const answer = getChosenAnswer(question, result.answers);

  return answer ? [answer] : [];
};

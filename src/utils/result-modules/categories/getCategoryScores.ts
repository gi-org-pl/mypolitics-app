import type { RunningScore } from "@/types/checkpoint";
import type { ResultAnswer } from "@/types/results";
import type { Survey } from "@/types/survey";
import { getResultQuestions } from "@/utils/result-modules/getResultQuestions";
import { getRunningScores } from "@/utils/running-state/scores/getRunningScores";

// Inside one category every question has the same multiplier, so it cancels
// out of a value: the questions are counted with no category prioritised.
const NO_PRIORITIZED_CATEGORY_IDS: readonly string[] = [];

// The score of every orientation of the quiz inside one category: the
// arithmetic of the whole result, on the questions of that category alone.
export const getCategoryScores = (
  survey: Pick<Survey, "orientations" | "categories" | "questions">,
  answers: ResultAnswer[],
  categoryId: string,
): Record<string, RunningScore> =>
  getRunningScores(
    survey,
    getResultQuestions(survey, answers).filter(
      ({ question }) => question.categoryId === categoryId,
    ),
    NO_PRIORITIZED_CATEGORY_IDS,
  );

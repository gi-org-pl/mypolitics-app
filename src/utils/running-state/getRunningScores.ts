import { EMPTY_SCORE_TOTAL } from "@/constants/checkpoint";
import type {
  DoneQuestion,
  RunningScore,
  ScoreTotal,
} from "@/types/checkpoint";
import type { Survey } from "@/types/survey";

import { addScoreTotals } from "./addScoreTotals";
import { getOrientationIds } from "./getOrientationIds";
import { getQuestionMultiplier } from "./getQuestionMultiplier";
import { getQuestionScores } from "./getQuestionScores";
import { getScoreValue } from "./getScoreValue";

// Points, maximum and value of every orientation of the quiz, by the
// arithmetic of `mp-qu-2025-1.0.1` applied to the done questions only.
export const getRunningScores = (
  survey: Pick<Survey, "orientations" | "categories">,
  doneQuestions: readonly DoneQuestion[],
  topicIds: readonly string[],
): Record<string, RunningScore> => {
  const orientationIds = getOrientationIds(survey);
  const totals = new Map<string, ScoreTotal>();

  for (const doneQuestion of doneQuestions) {
    const added = getQuestionScores(
      doneQuestion,
      getQuestionMultiplier(doneQuestion.question, survey.categories, topicIds),
      orientationIds,
    );

    for (const [id, score] of Object.entries(added)) {
      totals.set(
        id,
        addScoreTotals(totals.get(id) ?? EMPTY_SCORE_TOTAL, score),
      );
    }
  }

  return Object.fromEntries(
    Array.from(orientationIds, (id) => {
      const total = totals.get(id) ?? EMPTY_SCORE_TOTAL;

      return [id, { ...total, value: getScoreValue(total) }];
    }),
  );
};

import type { DoneQuestion, ScoreTotal } from "@/types/checkpoint";
import { toKnownOrientationIds } from "@/utils/running-state/orientations/toKnownOrientationIds";
import { getQuestionMaximums } from "./getQuestionMaximums";
import { toWeight } from "./toWeight";

// What one done question adds, by orientation it feeds: the points its answer
// gave and the most it could have given, both times the multiplier. A skipped
// question gives no points and still adds its full maximum.
export const getQuestionScores = (
  { question, answer }: DoneQuestion,
  multiplier: number,
  orientationIds: ReadonlySet<string>,
): Record<string, ScoreTotal> => {
  const chosenIds = new Set(
    toKnownOrientationIds(answer?.orientationIds ?? [], orientationIds),
  );
  const points = toWeight(answer?.weight) * multiplier;

  return Object.fromEntries(
    Array.from(
      getQuestionMaximums(question, orientationIds),
      ([id, maximum]) => [
        id,
        {
          points: chosenIds.has(id) ? points : 0,
          maximum: maximum * multiplier,
        },
      ],
    ),
  );
};

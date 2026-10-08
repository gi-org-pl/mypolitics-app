import { ANSWER_COUNTS_MAX_AGE_HOURS } from "@/constants/checkpoint";
import {
  answerCountsResponseSchema,
  questionCountsResponseSchema,
} from "@/services/api/schemas/answerCounts";
import type { CheckpointAggregates } from "@/types/checkpoint";
import { uniqueBy } from "@/utils/array/uniqueBy";
import { safely } from "@/utils/function/safely";
import { parseItems } from "@/utils/zod/parseItems";

import { toAnswerCounts } from "./toAnswerCounts";

const MS_PER_HOUR = 3_600_000;

// The answer counts of a quiz as the engine takes them, by question
// identifier - or nothing. The counts are usable when they say when they were
// computed, and that was not after `now` and no more than 24 hours before it.
// Every question is read on its own: a malformed one is left out and the
// others are kept, and of two items for one question the first is kept.
// Numbers are passed as sent, and so are counts for questions and answers the
// quiz does not have: the engine refuses what it cannot use.
//
// Never throws: a response that cannot be read gives nothing.
export const readAnswerCounts = (
  response: unknown,
  now: Date,
): CheckpointAggregates | undefined =>
  safely(() => {
    const { success, data } = answerCountsResponseSchema.safeParse(response);

    if (!success) return undefined;

    const age = now.getTime() - Date.parse(data.computedAt);

    // An age that is not a number passes neither check.
    if (!(age >= 0 && age <= ANSWER_COUNTS_MAX_AGE_HOURS * MS_PER_HOUR)) {
      return undefined;
    }

    return Object.fromEntries(
      uniqueBy(
        parseItems(data.questions, questionCountsResponseSchema),
        ({ questionId }) => questionId,
      ).flatMap((question) => {
        const counts = toAnswerCounts(question);

        return counts ? [[question.questionId, counts]] : [];
      }),
    );
  }, undefined);

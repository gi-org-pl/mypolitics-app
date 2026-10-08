import {
  answerCountResponseSchema,
  identifiedAnswerResponseSchema,
  type QuestionCountsResponse,
} from "@/services/api/schemas/answerCounts";
import type { CheckpointAnswerCounts } from "@/types/checkpoint";
import { uniqueBy } from "@/utils/array/uniqueBy";
import { parseItems } from "@/utils/zod/parseItems";

// The counts of one question as the engine takes them: the results counted,
// and the results that chose each possible answer. An answer item without an
// identifier is left out, and so is one without a count - the engine reads a
// missing count as zero. Of two items for one answer the first is kept.
// Nothing when a count is there and is not a number: such a question is left
// out as a whole.
export const toAnswerCounts = ({
  resultsCounted,
  answers,
}: QuestionCountsResponse): CheckpointAnswerCounts | undefined => {
  const counts = uniqueBy(
    parseItems(answers, identifiedAnswerResponseSchema),
    ({ answerId }) => answerId,
  ).map((answer) => answerCountResponseSchema.safeParse(answer));

  return counts.every(({ success }) => success)
    ? {
        resultsCounted,
        chosen: Object.fromEntries(
          counts.flatMap(({ data }) =>
            data?.count === undefined ? [] : [[data.answerId, data.count]],
          ),
        ),
      }
    : undefined;
};

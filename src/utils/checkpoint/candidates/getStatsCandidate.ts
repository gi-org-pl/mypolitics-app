import {
  STATS_MAX_PERCENT,
  STATS_MIN_PERCENT,
  STATS_MIN_SAMPLE,
  WHOLE_PERCENT,
} from "@/constants/checkpoint";
import type {
  CheckpointCandidate,
  CheckpointTriggerInput,
} from "@/types/checkpoint";

import { getAnswerSide } from "@/utils/checkpoint/answer-counts/getAnswerSide";
import { getQuestionCounts } from "@/utils/checkpoint/answer-counts/getQuestionCounts";
import { getShownCards } from "@/utils/checkpoint/record/getShownCards";

// The stats chart, once per session: the question done at this boundary was
// answered, is on the agreement scale and has usable counts, at least 100
// takers answered it, and the side the taker chose is the side of 10% of the
// takers it was shown to, or fewer. The share is compared in whole numbers,
// before any rounding; the percent the card prints is the share rounded up,
// never below 1. It is a moment: a question that is not the last one done is
// never brought up.
export const getStatsCandidate = ({
  survey,
  entries,
  state,
  record,
  aggregates,
}: CheckpointTriggerInput):
  | Extract<CheckpointCandidate, { type: "stats" }>
  | undefined => {
  const entry = entries.at(-1);
  const question = survey.questions.find(({ id }) => id === entry?.questionId);
  const answer = question?.possibleAnswers.find(
    ({ id }) => id === entry?.answerId,
  );

  if (
    !question ||
    !answer ||
    getShownCards(record.cardsShown, "stats").length > 0
  ) {
    return undefined;
  }

  const side = getAnswerSide(question, answer);
  const questionCounts = getQuestionCounts(question, aggregates?.[question.id]);

  if (!side || !questionCounts) return undefined;

  const { sample, ...counts } = questionCounts;
  const resultsCounted = sample + counts.noAnswer;
  const sidePercent = (counts[side] * WHOLE_PERCENT) / resultsCounted;

  return sample >= STATS_MIN_SAMPLE &&
    counts[side] * WHOLE_PERCENT <= STATS_MAX_PERCENT * resultsCounted
    ? {
        type: "stats",
        boundary: state.progress.done,
        questionId: question.id,
        thesis: question.text,
        side,
        counts,
        percent: Math.max(STATS_MIN_PERCENT, Math.ceil(sidePercent)),
      }
    : undefined;
};

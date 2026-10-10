import { TIME_SAMPLE_CAP_SECONDS } from "@/constants/checkpoint";
import type { DoneQuestion, RunningTiming } from "@/types/checkpoint";
import type { Survey, SurveyTimeSample } from "@/types/survey";
import { isNumber } from "@/utils/number/isNumber";

import { getMinutesLeft } from "./getMinutesLeft";

// The taker's pace and the time the rest of the quiz will take. A sample
// counts when it belongs to a done question and is a number of zero or more;
// of two samples for one question the later one counts, and each counts as
// 60 seconds at most.
export const getRunningTiming = (
  survey: Pick<Survey, "questions" | "averageFinishTime">,
  doneQuestions: readonly DoneQuestion[],
  timeSamples: readonly SurveyTimeSample[],
): RunningTiming => {
  const doneIds = new Set(doneQuestions.map(({ question }) => question.id));
  const secondsByQuestionId = new Map<string, number>();

  for (const { questionId, seconds } of timeSamples) {
    if (doneIds.has(questionId) && isNumber(seconds) && seconds >= 0) {
      secondsByQuestionId.set(
        questionId,
        Math.min(seconds, TIME_SAMPLE_CAP_SECONDS),
      );
    }
  }

  const timedQuestions = secondsByQuestionId.size;
  const averagePace =
    timedQuestions > 0
      ? [...secondsByQuestionId.values()].reduce(
          (sum, seconds) => sum + seconds,
          0,
        ) / timedQuestions
      : undefined;

  return {
    timedQuestions,
    averagePace,
    minutesLeft: getMinutesLeft({
      all: survey.questions.length,
      left: survey.questions.length - doneQuestions.length,
      timedQuestions,
      averagePace,
      averageFinishTime: survey.averageFinishTime,
    }),
  };
};

import {
  MIN_MINUTES_LEFT,
  MIN_TIMED_QUESTIONS,
  SECONDS_PER_MINUTE,
} from "@/constants/checkpoint";
import { isNumber } from "@/utils/number/isNumber";
import { isPositiveNumber } from "@/utils/number/isPositiveNumber";

interface MinutesLeftInput {
  all: number; // questions in the quiz
  left: number; // questions not done yet
  timedQuestions: number;
  averagePace?: number; // the taker's own seconds per question
  averageFinishTime?: number; // the survey's minutes for the whole quiz
}

const toWholeMinutes = (minutes: number): number =>
  Math.max(MIN_MINUTES_LEFT, Math.ceil(minutes));

// The minutes the rest of the quiz will take, rounded up to a whole minute
// and never below 1. With enough timed questions it is the taker's own pace
// times the questions left; with fewer it is the same share of the survey's
// average finish time as the share of questions left. Without a usable
// average there is nothing: no pace is invented.
export const getMinutesLeft = ({
  all,
  left,
  timedQuestions,
  averagePace,
  averageFinishTime,
}: MinutesLeftInput): number | undefined => {
  if (timedQuestions >= MIN_TIMED_QUESTIONS && isNumber(averagePace)) {
    return toWholeMinutes((left * averagePace) / SECONDS_PER_MINUTE);
  }

  return isPositiveNumber(averageFinishTime) && all > 0
    ? toWholeMinutes((averageFinishTime * left) / all)
    : undefined;
};

import { MIDPOINT_SHARE } from "@/constants/checkpoint";
import type { DoneQuestion, RunningProgress } from "@/types/checkpoint";
import type { Survey } from "@/types/survey";

// The counts over the questions of the quiz. A question with no possible
// answers is still a question here.
export const getRunningProgress = (
  survey: Pick<Survey, "questions">,
  doneQuestions: readonly DoneQuestion[],
): RunningProgress => {
  const all = survey.questions.length;
  const done = doneQuestions.length;
  const answered = doneQuestions.filter(
    ({ answer }) => answer !== undefined,
  ).length;

  return {
    all,
    done,
    answered,
    skipped: done - answered,
    left: all - done,
    share: all > 0 ? done / all : 0,
    midpointBoundary: Math.ceil(all * MIDPOINT_SHARE),
  };
};

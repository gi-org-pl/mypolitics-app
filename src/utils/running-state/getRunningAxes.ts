import type { AxisEntry } from "@/types/axis";
import type {
  DoneQuestion,
  RunningAxis,
  RunningScore,
} from "@/types/checkpoint";
import type { Orientation } from "@/types/orientation";
import type { Survey } from "@/types/survey";

import { getAxisPoles } from "./getAxisPoles";
import { getFedOrientationIds } from "./getFedOrientationIds";
import { getOrientationIds } from "./getOrientationIds";
import { getQuestionMaximums } from "./getQuestionMaximums";
import { getSideValue } from "./getSideValue";
import { toKnownAxis } from "./toKnownAxis";
import { toRunningAxis } from "./toRunningAxis";

// The axes a card can speak about, in the quiz's order, each with the value of
// its sides, its lean and the number of answered questions that feed it. An
// orientation no question of the quiz feeds counts as an empty side.
export const getRunningAxes = (
  survey: Pick<Survey, "orientations" | "axes" | "questions">,
  doneQuestions: readonly DoneQuestion[],
  scores: Readonly<Record<string, RunningScore>>,
): RunningAxis[] => {
  const orientationIds = getOrientationIds(survey);
  const fedIds = getFedOrientationIds(survey);
  const answeredFeeds = doneQuestions
    .filter(({ answer }) => answer !== undefined)
    .map(({ question }) => getQuestionMaximums(question, orientationIds));

  const toEntry = (orientation?: Orientation): AxisEntry | undefined =>
    orientation && fedIds.has(orientation.id)
      ? { orientation, value: getSideValue(scores, [orientation.id]) }
      : undefined;

  return survey.axes.flatMap((axis) => {
    const poles = getAxisPoles(
      toKnownAxis(axis, orientationIds),
      survey.orientations,
    );
    const start = toEntry(poles?.start);
    const end = toEntry(poles?.end);
    const answered = answeredFeeds.filter(
      (feed) =>
        (start && feed.has(start.orientation.id)) ||
        (end && feed.has(end.orientation.id)),
    ).length;
    const runningAxis = toRunningAxis({ id: axis.id, answered }, start, end);

    return runningAxis ? [runningAxis] : [];
  });
};

import { EMPTY_SCORE_TOTAL } from "@/constants/checkpoint";
import type {
  CompassPoint,
  DoneQuestion,
  RunningCompass,
} from "@/types/checkpoint";
import type { Survey } from "@/types/survey";
import { getNolanPosition } from "@/utils/results/getNolanPosition";

import { addScoreTotals } from "./addScoreTotals";
import { getCompassAxes } from "./getCompassAxes";
import { getOrientationIds } from "./getOrientationIds";
import { getQuadrantsVisited } from "./getQuadrantsVisited";
import { getQuestionMultiplier } from "./getQuestionMultiplier";
import { getQuestionScores } from "./getQuestionScores";
import { getScoreValue } from "./getScoreValue";
import { getSideTotal } from "./getSideTotal";

// The trail of the taker on the quiz's compass and the quadrants it visited,
// or null for a quiz without a compass. The position is the Nolan chart's:
// the negative side of an axis is its start pole, the positive side its end
// pole. The done questions are gone through once, each adding to the totals
// of the four sides, and every answered question from the first that has a
// position leaves a point. A skip moves the totals and leaves none.
export const getRunningCompass = (
  survey: Pick<Survey, "orientations" | "categories" | "axes">,
  doneQuestions: readonly DoneQuestion[],
  topicIds: readonly string[],
): RunningCompass | null => {
  const axes = getCompassAxes(survey);

  if (!axes) return null;

  const orientationIds = getOrientationIds(survey);
  const sides = [
    axes.horizontal.negativeOrientationIds,
    axes.horizontal.positiveOrientationIds,
    axes.vertical.negativeOrientationIds,
    axes.vertical.positiveOrientationIds,
  ];
  const trail: CompassPoint[] = [];
  let totals = sides.map(() => EMPTY_SCORE_TOTAL);

  for (const [index, doneQuestion] of doneQuestions.entries()) {
    const scores = getQuestionScores(
      doneQuestion,
      getQuestionMultiplier(doneQuestion.question, survey.categories, topicIds),
      orientationIds,
    );

    totals = totals.map((total, side) =>
      addScoreTotals(total, getSideTotal(scores, sides[side])),
    );

    const [horizontalStart, horizontalEnd, verticalStart, verticalEnd] =
      totals.map(getScoreValue);
    const position = doneQuestion.answer
      ? getNolanPosition(
          { start: horizontalStart, end: horizontalEnd },
          { start: verticalStart, end: verticalEnd },
        )
      : null;

    if (position) {
      const { x, y, level, quadrant } = position;

      trail.push({ x, y, level, quadrant, done: index + 1 });
    }
  }

  return { trail, quadrantsVisited: getQuadrantsVisited(trail) };
};

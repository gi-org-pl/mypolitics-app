import {
  NOLAN_PATH_ALL_QUADRANTS,
  NOLAN_PATH_MIN_DONE,
  NOLAN_PATH_MIN_QUADRANTS,
} from "@/constants/checkpoint";
import type {
  CheckpointCandidate,
  CheckpointTriggerInput,
  NolanPathCheckpointCard,
} from "@/types/checkpoint";

import { getShownCards } from "./getShownCards";

// The Nolan path card: the quiz has a compass, the taker's trail visited at
// least 2 quadrants, and 10 questions are done. It has two versions and each
// is shown once: the partial one for 2 or 3 quadrants, the full one for all
// 4 - also after the partial one, never the other way round. A first path
// card draws the whole trail. The full card after a partial one draws only
// what came since: from the point the partial card ended on, which the record
// holds as the last point of that card's trail. When the taker stepped back
// behind that point it is no longer on the trail, and the whole trail is
// drawn.
export const getNolanPathCandidate = ({
  state,
  record,
}: CheckpointTriggerInput):
  | Extract<CheckpointCandidate, { type: "nolan-path" }>
  | undefined => {
  const { compass, progress } = state;
  const count = compass?.quadrantsVisited.length ?? 0;
  const shownCards = getShownCards(record.cardsShown, "nolan-path");
  const partialCard = shownCards.find(({ variant }) => variant === "partial");
  const isFull = count === NOLAN_PATH_ALL_QUADRANTS;

  if (
    !compass ||
    count < NOLAN_PATH_MIN_QUADRANTS ||
    count > NOLAN_PATH_ALL_QUADRANTS ||
    progress.done < NOLAN_PATH_MIN_DONE ||
    shownCards.some(({ variant }) => variant === "full") ||
    (partialCard && !isFull)
  ) {
    return undefined;
  }

  const lastDrawn = partialCard?.trail.at(-1);
  const resumeAt = compass.trail.findIndex(
    ({ x, y, done }) =>
      x === lastDrawn?.x && y === lastDrawn?.y && done === lastDrawn?.done,
  );

  return {
    type: "nolan-path",
    boundary: progress.done,
    variant: isFull ? "full" : "partial",
    count: count as NolanPathCheckpointCard["count"],
    trail: compass.trail.slice(Math.max(resumeAt, 0)),
    isSecondPath: partialCard !== undefined,
  };
};

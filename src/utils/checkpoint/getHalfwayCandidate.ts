import { HALFWAY_MAX_MINUTES, WHOLE_PERCENT } from "@/constants/checkpoint";
import type {
  CheckpointCandidate,
  CheckpointTriggerInput,
} from "@/types/checkpoint";
import { isNumber } from "@/utils/number/isNumber";

import { getShownCards } from "./getShownCards";

// The halfway card, once per session: this boundary is the midpoint boundary
// and a time left exists that the card can print, 99 minutes at most. It is a
// moment: at any other boundary it is not a candidate. The percent is the
// progress as a whole percent rounded down, taken from the two counts so that
// no rounding error of the share can cost it a percent.
export const getHalfwayCandidate = ({
  state,
  record,
}: CheckpointTriggerInput):
  | Extract<CheckpointCandidate, { type: "halfway" }>
  | undefined => {
  const { all, done, midpointBoundary } = state.progress;
  const { minutesLeft } = state.timing;

  return done === midpointBoundary &&
    isNumber(minutesLeft) &&
    minutesLeft <= HALFWAY_MAX_MINUTES &&
    getShownCards(record.cardsShown, "halfway").length === 0
    ? {
        type: "halfway",
        boundary: done,
        percent: Math.floor((done * WHOLE_PERCENT) / all),
        minutes: minutesLeft,
      }
    : undefined;
};

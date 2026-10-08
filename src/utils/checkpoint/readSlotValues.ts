import {
  MIN_MINUTES_LEFT,
  NOLAN_PATH_ALL_QUADRANTS,
  NOLAN_PATH_MIN_QUADRANTS,
  STATS_MAX_PERCENT,
  STATS_MIN_PERCENT,
} from "@/constants/checkpoint";
import type { CheckpointCandidate, CheckpointPoolId } from "@/types/checkpoint";

import { toSlotName } from "./toSlotName";
import { toSlotNumber } from "./toSlotNumber";
import { toSlotThesis } from "./toSlotThesis";

// The slots of one of the card's own pools, each with the value the card
// holds for it: a name exactly as the quiz wrote it, trimmed; the thesis
// without its one closing full stop; a number inside its range. A value the
// line may not print is left undefined, and a pool without slots gives no
// values. The pool has to be one the card can draw from.
export const readSlotValues = (
  card: CheckpointCandidate,
  pool: CheckpointPoolId,
): Record<string, string | number | undefined> => {
  switch (card.type) {
    case "halfway":
      return { minutes: toSlotNumber(card.minutes, MIN_MINUTES_LEFT) };
    case "axis-closeness":
      return card.variant === "single"
        ? { orientation: toSlotName(card.entry.orientation) }
        : {
            leading: toSlotName(card[card.leadingSide].orientation),
            other: toSlotName(
              (card.leadingSide === "start" ? card.end : card.start)
                .orientation,
            ),
          };
    case "new-trait":
      return { trait: toSlotName(card.trait) };
    case "nolan-path":
      return card.variant === "full"
        ? {}
        : {
            count: toSlotNumber(
              card.count,
              NOLAN_PATH_MIN_QUADRANTS,
              NOLAN_PATH_ALL_QUADRANTS - 1,
            ),
          };
    case "stats":
      return {
        percent: toSlotNumber(
          card.percent,
          STATS_MIN_PERCENT,
          STATS_MAX_PERCENT,
        ),
        thesis: toSlotThesis(card.thesis),
      };
    case "axis-puzzle":
      return pool === "axis-puzzle-ask"
        ? {}
        : { leading: toSlotName(card[card.leadingSide].orientation) };
    default:
      return pool === "position-puzzle-hit"
        ? { position: toSlotName(card.leader) }
        : {};
  }
};

import type { HalfwayCheckpointCard } from "@/types/checkpoint";
import { clamp } from "@/utils/number/clamp";
import { isNumber } from "@/utils/number/isNumber";

const MIN_PERCENT = 0;
const MAX_PERCENT = 100;

// The number the halfway card prints: the percent of the card as a whole
// number, rounded down, 100 at most. A card is stored JSON, so its percent can
// be anything: nothing when it is not a number.
export const getHalfwayPercent = (
  card: HalfwayCheckpointCard,
): number | undefined =>
  isNumber(card.percent)
    ? clamp(Math.floor(card.percent), MIN_PERCENT, MAX_PERCENT)
    : undefined;

import type { CheckpointRecord } from "@/types/checkpoint";
import type { SurveyCheckpointRecord } from "@/types/survey";

import { readShownCard } from "./readShownCard";

// The session's record with its cards checked: the only way a stored record
// becomes a typed one. An item of the cards shown that is not a shown card is
// dropped and the others are kept, so a dropped card may repeat once. Cards
// shown that are not a list are no cards shown. The time samples are kept as
// they are. Never throws.
export const readCheckpointRecord = (
  stored: SurveyCheckpointRecord,
): CheckpointRecord => {
  const { cardsShown, timeSamples } = (stored ?? {}) as Partial<
    Record<keyof SurveyCheckpointRecord, unknown>
  >;

  return {
    timeSamples: Array.isArray(timeSamples) ? timeSamples : [],
    cardsShown: Array.isArray(cardsShown)
      ? cardsShown.flatMap((item) => readShownCard(item) ?? [])
      : [],
  };
};

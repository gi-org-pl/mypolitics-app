import { useLingui } from "@lingui/react/macro";

import { NOLAN_PATH_ALL_QUADRANTS } from "@/constants/checkpoint";
import type { NolanPathCheckpointCard } from "@/types/checkpoint";
import { clamp } from "@/utils/number/clamp";
import { isNumber } from "@/utils/number/isNumber";

import { getPathPosition } from "./getPathPosition";

// The description of the map on the path card, in the active language: how
// many of the four quadrants the route has passed through, and whether the
// taker now stands in the highlighted quadrant or near the centre. The count
// is the card's - on a second path the line can lie in one corner while the
// whole run counts four - read as 4 when it is above and as 0 when it is
// below or not a number. A quadrant is highlighted exactly when the map fills
// one: the last point of the trail is not at the centre level. No quadrant is
// named and no coordinate is given, as the card names none.
export const useNolanPathDescription = (
  card: NolanPathCheckpointCard,
): string => {
  const { t } = useLingui();
  const count = isNumber(card.count)
    ? clamp(card.count, 0, NOLAN_PATH_ALL_QUADRANTS)
    : 0;
  const position = getPathPosition(card.trail);

  return position && position.level !== "centre"
    ? t`Kompas: trasa przeszła przez ${count} z 4 ćwiartek. Twoja pozycja jest teraz w podświetlonej ćwiartce.`
    : t`Kompas: trasa przeszła przez ${count} z 4 ćwiartek. Twoja pozycja jest teraz blisko środka.`;
};

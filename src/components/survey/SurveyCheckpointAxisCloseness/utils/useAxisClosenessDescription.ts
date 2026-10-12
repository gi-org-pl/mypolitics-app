import { useLingui } from "@lingui/react/macro";

import type { AxisClosenessCheckpointCard } from "@/types/checkpoint";
import { safely } from "@/utils/function/safely";
import { toSingleLine } from "@/utils/text/toSingleLine";

// The bar of the card in words, in the active language: what a sighted taker
// reads from it. The single variant names the orientation and says its score
// is high; the double variant names both sides in the bar's order and the
// side that is ahead. The names are placed as the quiz wrote them, on one
// line, and the text carries no value: the card shows none. Blank when the
// card cannot be read - such a card is not drawn.
export const useAxisClosenessDescription = (
  card: AxisClosenessCheckpointCard,
): string => {
  const { t } = useLingui();

  return safely(() => {
    if (card.variant === "single") {
      const orientation = toSingleLine(card.entry.orientation.name);

      return t`Skala „${orientation}”: wysoki wynik`;
    }

    const start = toSingleLine(card.start.orientation.name);
    const end = toSingleLine(card.end.orientation.name);
    const leading = card.leadingSide === "end" ? end : start;

    return t`„${start}” i „${end}”: wyższy wynik po stronie „${leading}”`;
  }, "");
};

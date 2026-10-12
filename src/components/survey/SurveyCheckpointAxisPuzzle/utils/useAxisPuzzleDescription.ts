import { useLingui } from "@lingui/react/macro";

import type { AxisPuzzleCheckpointCard } from "@/types/checkpoint";
import type { CheckpointGuessState } from "@/utils/checkpoint/useCheckpointGuess";
import { safely } from "@/utils/function/safely";
import { toSingleLine } from "@/utils/text/toSingleLine";

// The bar of the card in words, in the active language: what a sighted taker
// reads from it in that state. While the card asks, it names both poles in
// the bar's order and says the reading is hidden - nothing in it tells the
// poles apart. After the guess it names both poles and the one the taker is
// closer to, the same for a hit and for a miss. The names are placed as the
// quiz wrote them, on one line, and the text never carries a value: the bar
// shows none. Blank when the card cannot be read - such a card is not drawn.
export const useAxisPuzzleDescription = (
  card: AxisPuzzleCheckpointCard,
  state: CheckpointGuessState,
): string => {
  const { t } = useLingui();

  return safely(() => {
    const start = toSingleLine(card.start.orientation.name);
    const end = toSingleLine(card.end.orientation.name);

    if (state === "ask") return t`„${start}” i „${end}”: wynik ukryty`;

    const leading = card.leadingSide === "end" ? end : start;

    return t`„${start}” i „${end}”: bliżej Ci do strony „${leading}”`;
  }, "");
};

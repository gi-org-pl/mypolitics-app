import { useLingui } from "@lingui/react/macro";

import type { PositionPuzzleCheckpointCard } from "@/types/checkpoint";
import type { CheckpointGuessState } from "@/utils/checkpoint/useCheckpointGuess";
import { safely } from "@/utils/function/safely";
import { toSingleLine } from "@/utils/text/toSingleLine";

// The bar of the card in words, in the active language: what a sighted taker
// reads from it in that state. While the card asks, and after a miss, it says
// a hidden character is close and names nobody. After a hit it names the
// leader, as the quiz wrote the name, on one line. It never carries a value:
// the bar shows none. Blank when the card cannot be read - such a card is not
// drawn.
export const usePositionPuzzleDescription = (
  card: PositionPuzzleCheckpointCard,
  state: CheckpointGuessState,
): string => {
  const { t } = useLingui();

  return safely(() => {
    if (state !== "hit") return t`Ukryta postać jest blisko Ciebie`;

    const name = toSingleLine(card.leader.name);

    return t`${name} jest blisko Ciebie`;
  }, "");
};

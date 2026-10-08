import type {
  CheckpointCard,
  CheckpointShownCard,
  CheckpointType,
} from "@/types/checkpoint";

// The cards of one type that were put on screen in this session, oldest
// first.
export const getShownCards = <Type extends CheckpointType>(
  cardsShown: readonly CheckpointShownCard[],
  type: Type,
): Extract<CheckpointCard, { type: Type }>[] =>
  cardsShown
    .map(({ card }) => card)
    .filter(
      (card): card is Extract<CheckpointCard, { type: Type }> =>
        card.type === type,
    );

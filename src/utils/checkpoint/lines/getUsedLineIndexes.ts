import type { CheckpointPoolId, CheckpointShownCard } from "@/types/checkpoint";

// The lines of one pool this session has drawn, in the order they were
// drawn: the line of every card shown, and the reveal lines of a puzzle.
export const getUsedLineIndexes = (
  cardsShown: readonly CheckpointShownCard[],
  pool: CheckpointPoolId,
): number[] =>
  cardsShown
    .flatMap(({ card, revealLines }) => [
      card.line,
      revealLines?.hit,
      revealLines?.miss,
    ])
    .flatMap((line) => (line?.pool === pool ? [line.index] : []));

import {
  CHECKPOINT_PRIORITY,
  GENERIC_CHECKPOINT_TYPE,
} from "@/constants/checkpoint";
import type {
  CheckpointCandidate,
  CheckpointShownCard,
} from "@/types/checkpoint";

// The candidates that may be shown at this boundary, the winner first. They
// are ordered by three keys: a personal card before the generic one, a type
// not yet shown in this session before a type that was, and the priority of
// the type. The full Nolan path counts as not yet shown even after the
// partial one - the one exception to the second key. Then the last pacing
// rule: a candidate of the same type as the previous card is left out,
// however long ago that card was, so the next one of another type takes its
// place. No key uses chance.
export const rankCheckpointCandidates = <Candidate extends CheckpointCandidate>(
  candidates: readonly Candidate[],
  cardsShown: readonly CheckpointShownCard[],
): Candidate[] => {
  const shownTypes = new Set(cardsShown.map(({ card }) => card.type));
  const previousType = cardsShown.at(-1)?.card.type;
  const getKeys = (candidate: Candidate): number[] => [
    Number(candidate.type === GENERIC_CHECKPOINT_TYPE),
    Number(
      shownTypes.has(candidate.type) &&
        !(candidate.type === "nolan-path" && candidate.variant === "full"),
    ),
    CHECKPOINT_PRIORITY.indexOf(candidate.type),
  ];

  return candidates
    .filter(({ type }) => type !== previousType)
    .map((candidate) => ({ candidate, keys: getKeys(candidate) }))
    .sort(
      (first, second) =>
        first.keys[0] - second.keys[0] ||
        first.keys[1] - second.keys[1] ||
        first.keys[2] - second.keys[2],
    )
    .map(({ candidate }) => candidate);
};

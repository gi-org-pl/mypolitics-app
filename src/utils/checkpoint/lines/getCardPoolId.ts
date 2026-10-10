import type { CheckpointCandidate, CheckpointPoolId } from "@/types/checkpoint";

// The pool the line of a card comes from when the card fires: one per card
// and state. For a puzzle that is its ask pool.
export const getCardPoolId = (card: CheckpointCandidate): CheckpointPoolId => {
  switch (card.type) {
    case "stats":
      return card.side === "for" ? "stats-for" : "stats-against";
    case "nolan-path":
      return card.variant === "full" ? "nolan-path-full" : "nolan-path-partial";
    case "axis-closeness":
      return card.variant === "single"
        ? "axis-closeness-single"
        : "axis-closeness-double";
    case "axis-puzzle":
      return "axis-puzzle-ask";
    case "position-puzzle":
      return "position-puzzle-ask";
    default:
      return card.type;
  }
};

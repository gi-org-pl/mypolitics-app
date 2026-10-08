import { POSITION_PUZZLE_DISTRACTORS } from "@/constants/checkpoint";
import type { Orientation } from "@/types/orientation";

// The rows the card asks with: the leader and its distractors. The card has
// no form with fewer or with more.
export const POSITION_PUZZLE_ROWS = POSITION_PUZZLE_DISTRACTORS + 1;

// The colour of the bar while the archetype is held back: the literal value
// of the Athena palette token named beside it. A bar's colour check accepts
// no CSS variables, so the token cannot be referenced.
export const HIDDEN_BAR_COLOR = "oklch(0.4189 0.076 219.48)"; // --gi-light-primary

// Who the bar is about while the archetype is held back: nobody. It carries
// the neutral colour and nothing else - no name, no image, and an identifier
// no archetype has.
export const HIDDEN_ORIENTATION: Orientation = {
  id: "",
  type: "other",
  color: HIDDEN_BAR_COLOR,
};

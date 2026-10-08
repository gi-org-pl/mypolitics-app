import type { QuizCardBadgePlacement } from "./QuizCardBadge.types";

// The badge at the top of a card is taller than the one below an image.
export const BADGE_PLACEMENT_CLASS_NAMES: Record<
  QuizCardBadgePlacement,
  string
> = {
  top: "px-4 py-2.5",
  belowImage: "px-3 py-1.5",
  belowImageOnNarrowScreen: "px-3 py-1.5 md:px-4 md:py-2.5",
};

// On a wide screen the text of the badge lines up with the wider padding of
// the highlighted card.
export const HIGHLIGHTED_BADGE_CLASS_NAME = "md:px-6";

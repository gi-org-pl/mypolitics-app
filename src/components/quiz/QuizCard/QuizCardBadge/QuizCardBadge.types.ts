// Where the badge sits: at the top of a card without an image, directly below
// the image of a card with one, or below an image that only a narrow screen
// shows (so at the top of the card on a wide one).
export type QuizCardBadgePlacement =
  | "top"
  | "belowImage"
  | "belowImageOnNarrowScreen";

export interface QuizCardBadgeProps {
  text: string;
  placement: QuizCardBadgePlacement;
  isHighlighted: boolean;
}

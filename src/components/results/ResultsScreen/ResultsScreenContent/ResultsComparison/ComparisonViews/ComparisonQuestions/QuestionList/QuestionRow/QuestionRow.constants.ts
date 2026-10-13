import { Agreement } from "@/types/comparison";

// The tint of a row by how the two sides stand on its question: green where
// they agree, red where they do not, none where they cannot be compared. The
// green of the design has no token in the palette: the closest one is used.
export const ROW_TINT_CLASS_NAMES: Record<Agreement, string> = {
  [Agreement.Agree]: "bg-emerald-600/5",
  [Agreement.Disagree]: "bg-gi-red/5",
  [Agreement.Neither]: "",
};

// How the two sides of an opened row stand: one under the other, and next to
// each other from the width of the narrow frame of the design - 320 px, less
// the border of the row, which a container does not count.
//
// Next to each other, each side has half the row, and the name of the other
// side may need more: the design lets it run on to where the short name of
// the taker begins. So the row says how much room that name has - its own
// half while the sides stand under each other; both halves and the gap
// between them, less the 5 rem kept for the name and the mark of the taker,
// while they stand next to each other.
export const ROW_SIDES_CLASS_NAME =
  "grid-cols-1 [--side-name-room:100%] @[19.875rem]:grid-cols-2 @[19.875rem]:[--side-name-room:calc(200%+0.5rem-5rem)]";

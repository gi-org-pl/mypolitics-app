import { Agreement } from "@/types/comparison";

// The tint of a row by how the two sides stand on its question: green where
// they agree, red where they do not, none where they cannot be compared. The
// green of the design has no token in the palette: the closest one is used.
export const ROW_TINT_CLASS_NAMES: Record<Agreement, string> = {
  [Agreement.Agree]: "bg-emerald-600/5",
  [Agreement.Disagree]: "bg-gi-red/5",
  [Agreement.Neither]: "",
};

// How the two sides of an opened row stand: next to each other at every
// width, as the design draws them in its narrow frame too - it has no frame
// with one side under the other. Each side has half the row; a long answer
// wraps inside its half.
//
// The name of the other side may need more than its half: the design lets it
// run on to where the short name of the taker begins. So the row says how
// much room that name has - both halves and the gap between them, less the
// 5 rem kept for the name and the mark of the taker.
export const ROW_SIDES_CLASS_NAME =
  "grid-cols-2 [--side-name-room:calc(200%+0.5rem-5rem)]";

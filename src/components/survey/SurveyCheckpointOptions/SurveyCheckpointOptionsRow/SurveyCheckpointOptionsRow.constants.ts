import { FOCUS_CLASS_NAME } from "@/constants/focus";

// One row: an outlined pill, 48 px high with one line of name and taller
// with more. The 1 px border is part of its 16 px padding at the sides, and
// of the 12 px above and below the 24 px image.
export const ROW_CLASS_NAME = `flex min-h-12 w-full min-w-0 cursor-pointer items-center gap-2 rounded-4xl border border-gi-dark-ash bg-transparent px-3.75 py-2.75 text-left text-base leading-tight font-bold text-gi-primary transition-colors hover:bg-gi-primary/10 active:bg-gi-primary/10 ${FOCUS_CLASS_NAME}`;

// The image of a row: a 24 px disc in the colour of the orientation, or in
// the neutral colour when it has none, with the image drawn over it.
export const ROW_IMAGE_CLASS_NAME =
  "size-6 shrink-0 rounded-full bg-gi-dark-gray bg-cover bg-center bg-no-repeat";

// On a wide screen the card and the banner share the row in the proportion
// the design draws them in: 406 to 778.
export const WIDE_ROW_CLASS_NAME =
  "lg:grid-cols-[minmax(0,406fr)_minmax(0,778fr)]";

// The banner belongs to the wide layouts: on a narrow screen the picture is
// part of the card. Not displayed means out of the layout and out of the
// accessibility tree.
export const BANNER_CLASS_NAME = "hidden md:block";

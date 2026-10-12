export const NAME_CLASS_NAME = "min-w-0 text-base leading-5 font-bold";

// A chip with a short name shows it while the room for its text is narrower
// than 240px - what a typical pair of names needs ("Eurosceptycyzm /
// Federacjonizm" takes 238px). The room is a fixed width and nothing is
// measured, so two chips of the same width always show the same form.
export const NAME_SWITCH_CLASS_NAME = "@max-[240px]:sr-only";
export const SHORT_NAME_SWITCH_CLASS_NAME = "hidden @max-[240px]:block";

// The label is shown from the wide breakpoint up; on a narrow screen the
// button is the icon alone. CSS decides, so the markup is the same on both.
export const START_TEXT_CLASS_NAME = "hidden md:inline";

// The button grows from the round icon button into a pill with the label.
export const START_TEXT_BUTTON_CLASS_NAME =
  "gap-3 p-0 text-base leading-none font-bold has-[>svg]:px-0 md:-my-0.5 md:h-12.75 md:w-auto md:px-4 md:has-[>svg]:px-4";

// Forced colours drop the fill, which would leave the icon floating: a
// transparent border is drawn in a system colour there and keeps the button's
// shape, without changing its size or look anywhere else.
export const FORCED_COLORS_BORDER_CLASS_NAME = "border border-transparent";

// The frames fill the button with the colour of the title on cards that show
// their title as text, and with the primary colour on cards with a logo.
export const LIGHT_BUTTON_CLASS_NAME =
  "bg-gi-light-primary hover:bg-gi-primary";

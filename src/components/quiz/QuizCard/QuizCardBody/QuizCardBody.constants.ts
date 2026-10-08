// Everything about the body that depends on the width of the screen is CSS,
// so the server and the browser render the same markup.

// A collapsed body is a grid row of no height that is also invisible, so its
// content leaves the tab order and the accessibility tree without any
// attribute that would have to differ between the server and the browser.
export const BODY_OPEN_CLASS_NAME = "visible grid-rows-[1fr]";

export const BODY_COLLAPSED_CLASS_NAME = "invisible grid-rows-[0fr]";

// A card that is open on a wide screen shows its body there whatever its
// state.
export const BODY_OPEN_ON_WIDE_SCREEN_CLASS_NAME =
  "md:visible md:grid-rows-[1fr]";

// A bold span of the description is Roboto Bold whatever the weight around
// it: "bolder" on its own would turn a light text into a regular one.
export const DESCRIPTION_CLASS_NAME =
  "text-base leading-5.5 tracking-[-0.01em] wrap-break-word text-gi-primary [&_b]:font-bold [&_strong]:font-bold";

// The highlighted card sets the text after the bold lead in a lighter weight.
export const HIGHLIGHTED_DESCRIPTION_CLASS_NAME = "font-light";

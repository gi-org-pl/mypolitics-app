// A card that is always open on a wide screen has nothing to toggle there:
// the button leaves the layout, the tab order and the accessibility tree.
// CSS decides, so the markup is the same on the server and in the browser.
export const TOGGLE_HIDDEN_ON_WIDE_SCREEN_CLASS_NAME = "md:hidden";

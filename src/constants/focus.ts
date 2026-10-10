// Keyboard focus as an outline. The default outline is a faint 1 px grey, and
// Athena's Button draws focus as a half-transparent ring, which forced colours
// remove; an outline is always visible.
export const FOCUS_CLASS_NAME =
  "focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-gi-primary";

// Marks the element that takes the focus when the content of a questionnaire
// phase appears, where that is not the top of the content: the screen looks
// for it inside the new content. It has `tabIndex={-1}`, and a content has at
// most one.
export const PHASE_FOCUS_ATTRIBUTE = "data-phase-focus";

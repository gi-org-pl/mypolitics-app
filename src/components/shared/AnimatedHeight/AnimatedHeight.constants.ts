// How long a change of height takes, and how it eases: the 0.3 s tween of
// the legacy questionnaire.
export const HEIGHT_CHANGE_MS = 300;
export const HEIGHT_CHANGE_EASING = "ease-in-out";

// Two changes of height closer together than this are one movement that
// something inside is already animating - an explanation that opens, a box of
// its own further down. Such a movement is followed as it is, frame by frame,
// instead of being animated a second time and falling behind it.
export const HEIGHT_FOLLOW_WINDOW_MS = 100;

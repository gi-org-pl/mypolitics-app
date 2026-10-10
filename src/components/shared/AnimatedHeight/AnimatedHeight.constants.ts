// How long a change of height takes, and how it eases: the 0.3 s tween of
// the legacy questionnaire.
export const HEIGHT_CHANGE_MS = 300;
export const HEIGHT_CHANGE_EASING = "ease-in-out";

// A change smaller than this is not a movement: the box simply has the new
// height.
export const HEIGHT_CHANGE_MIN_PX = 1;

// The properties that move a height of their own, as an animation names
// them. While something inside the box animates one of them - an explanation
// that opens, another box of this kind further down - the box follows that
// movement as it is, frame by frame, instead of animating it a second time
// and falling behind it.
export const HEIGHT_PROPERTIES = [
  "height",
  "minHeight",
  "maxHeight",
  "blockSize",
  "minBlockSize",
  "maxBlockSize",
  "gridTemplateRows",
];

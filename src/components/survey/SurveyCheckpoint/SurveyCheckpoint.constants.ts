import {
  QUIET_BUTTON_CLASS_NAME,
  TALL_BUTTON_CLASS_NAME,
} from "@/constants/button";

// What stands between the panel and "Wyłącz checkpointy": the text, the
// options and "Dalej", each in a box that moves its height. The boxes touch:
// the gap of the frame is the padding above the options and above "Dalej",
// inside their boxes, so it opens and closes with them.
export const BODY_CLASS_NAME = "flex w-full min-w-0 flex-col";

// The options of a puzzle: stacked 8 px apart, the gap of the frame above.
export const OPTIONS_CLASS_NAME = "flex w-full min-w-0 flex-col gap-2 pt-4";

// The row of "Dalej": the gap of the frame above the button.
export const CONTINUE_ROW_CLASS_NAME = "w-full pt-4";

// "Dalej": the main button of a card - a white pill as wide as the frame.
export const CONTINUE_CLASS_NAME = `${TALL_BUTTON_CLASS_NAME} w-full bg-background text-gi-dark-gray`;

// "Wyłącz checkpointy": its label alone, as wide as the frame, so that its
// pressable area is the whole row.
export const OPT_OUT_CLASS_NAME = `${QUIET_BUTTON_CLASS_NAME} w-full text-gi-dark-gray`;

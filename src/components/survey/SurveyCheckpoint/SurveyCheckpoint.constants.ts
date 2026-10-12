import {
  QUIET_BUTTON_CLASS_NAME,
  TALL_BUTTON_CLASS_NAME,
} from "@/constants/button";

// What stands between the panel and the opt-out button: the text, the options
// and the continue button, each in a box that moves its height. The boxes
// touch: the gap of the frame is the padding above the options and above the
// continue button, inside their boxes, so it opens and closes with them.
export const BODY_CLASS_NAME = "flex w-full min-w-0 flex-col";

// The options of a puzzle: stacked 8 px apart, the gap of the frame above.
export const OPTIONS_CLASS_NAME = "flex w-full min-w-0 flex-col gap-2 pt-4";

// The row of the continue button: the gap of the frame above the button.
export const CONTINUE_ROW_CLASS_NAME = "w-full pt-4";

// The continue button, the main button of a card: a white pill as wide as
// the frame.
export const CONTINUE_CLASS_NAME = `${TALL_BUTTON_CLASS_NAME} w-full bg-background text-gi-dark-gray`;

// The opt-out button: its label alone, as wide as the frame, so that its
// pressable area is the whole row.
export const OPT_OUT_CLASS_NAME = `${QUIET_BUTTON_CLASS_NAME} w-full text-gi-dark-gray`;

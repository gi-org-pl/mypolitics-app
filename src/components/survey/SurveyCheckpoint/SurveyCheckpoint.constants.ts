import {
  QUIET_BUTTON_CLASS_NAME,
  TALL_BUTTON_CLASS_NAME,
} from "@/constants/button";

// What stands between the panel and "Wyłącz checkpointy": the text, the
// options and "Dalej", stacked with the gap of the frame.
export const BODY_CLASS_NAME = "flex w-full min-w-0 flex-col gap-4";

// "Dalej": the main button of a card - a white pill as wide as the frame.
export const CONTINUE_CLASS_NAME = `${TALL_BUTTON_CLASS_NAME} w-full bg-background text-gi-dark-gray`;

// "Wyłącz checkpointy": its label alone, as wide as the frame, so that its
// pressable area is the whole row.
export const OPT_OUT_CLASS_NAME = `${QUIET_BUTTON_CLASS_NAME} w-full text-gi-dark-gray`;

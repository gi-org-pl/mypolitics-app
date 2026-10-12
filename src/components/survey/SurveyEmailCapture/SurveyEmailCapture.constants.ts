import {
  QUIET_BUTTON_CLASS_NAME,
  TALL_BUTTON_CLASS_NAME,
} from "@/constants/button";

// The one button of the card is drawn in two ways. With a valid address it
// is the filled main button.
export const SUBMIT_CLASS_NAME = `${TALL_BUTTON_CLASS_NAME} self-center`;

// Without one it is "Pomiń": its label alone, in the colour the frame draws
// it in.
export const SKIP_CLASS_NAME = `${QUIET_BUTTON_CLASS_NAME} self-center text-gi-dark-gray`;

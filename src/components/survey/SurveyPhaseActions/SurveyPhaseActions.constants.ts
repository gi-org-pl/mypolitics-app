import {
  QUIET_BUTTON_CLASS_NAME,
  TALL_BUTTON_CLASS_NAME,
} from "@/constants/button";

// A main button that is off keeps its shape and loses its colour.
export const PRIMARY_CLASS_NAME = `${TALL_BUTTON_CLASS_NAME} data-[disabled=true]:bg-gi-dark-ash`;

// The label of "Pomiń" stands 16 px from the main button, and the pair is
// centred as the main button and that label: the side padding of the quiet
// button takes no room on the far side.
export const SKIP_CLASS_NAME = `${QUIET_BUTTON_CLASS_NAME} -mr-4`;

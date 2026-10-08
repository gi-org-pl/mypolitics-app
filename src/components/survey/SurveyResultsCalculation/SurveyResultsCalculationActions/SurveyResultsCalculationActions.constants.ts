import { TALL_BUTTON_CLASS_NAME } from "@/constants/button";
import { ICON_MASK_CLASS_NAME } from "@/constants/icon";

// A result action of the frame: the 48 px pill of a main button, in the
// colour of one that is off.
export const ACTION_CLASS_NAME = `${TALL_BUTTON_CLASS_NAME} data-[disabled=true]:bg-gi-dark-ash`;

// The download icon follows the colour of its label. Forced colours replace
// its fill, so it is given the system colour of a control that is off.
export const ACTION_ICON_CLASS_NAME = `${ICON_MASK_CLASS_NAME} h-4 w-3.75 mask-contain forced-colors:bg-[color:GrayText]`;

// An icon drawn as a mask over the text colour, so it follows the colour of
// its control. Add its size, a mask size and a forced-colours colour.
export const ICON_MASK_CLASS_NAME =
  "block shrink-0 bg-current mask-center mask-no-repeat";

// Forced colours replace a background that is not a system colour, which
// would leave the mask with nothing to show: name the system colour that the
// text of the control gets.
export const LINK_ICON_MASK_CLASS_NAME = `${ICON_MASK_CLASS_NAME} forced-colors:bg-[color:LinkText]`;

export const BUTTON_ICON_MASK_CLASS_NAME = `${ICON_MASK_CLASS_NAME} forced-colors:bg-[color:ButtonText]`;

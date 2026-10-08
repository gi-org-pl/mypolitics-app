export const NUMBER_ANIMATION_MS = 300;

export const ICON_CLASS_NAME =
  "block shrink-0 bg-current mask-contain mask-center mask-no-repeat";

// Forced colours replace a background that is not a system colour, which
// would leave the mask with nothing to show: name the system colour instead.
export const BUTTON_ICON_CLASS_NAME = `${ICON_CLASS_NAME} forced-colors:bg-[color:ButtonText] forced-colors:in-data-[disabled=true]:bg-[color:GrayText]`;

// Athena's Button draws focus as a half-transparent ring, which forced colours
// remove. An outline replaces it so that keyboard focus is always visible.
export const FOCUS_CLASS_NAME =
  "focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-gi-primary";

export const BUTTON_CLASS_NAME = `size-12 border-gi-dark-ash hover:bg-gi-primary/10 active:bg-gi-primary/10 data-[disabled=true]:border-gi-dark-ash data-[disabled=true]:text-gi-dark-ash ${FOCUS_CLASS_NAME}`;

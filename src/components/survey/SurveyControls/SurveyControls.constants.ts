import type { NumberRollDirection } from "./SurveyControls.types";

export const NUMBER_ANIMATION_MS = 300;

export const NUMBER_CLASS_NAME =
  "col-start-1 row-start-1 text-center transition-[translate,opacity,filter] ease-in-out motion-reduce:transition-none";

export const NUMBER_ENTER_CLASS_NAME: Record<NumberRollDirection, string> = {
  down: "starting:translate-y-2 starting:opacity-0 starting:blur-[2px]",
  up: "starting:-translate-y-2 starting:opacity-0 starting:blur-[2px]",
};

export const NUMBER_LEAVE_CLASS_NAME: Record<NumberRollDirection, string> = {
  down: "-translate-y-2 opacity-0 blur-[2px]",
  up: "translate-y-2 opacity-0 blur-[2px]",
};

const ICON_CLASS_NAME =
  "block shrink-0 bg-current mask-contain mask-center mask-no-repeat";

// Forced colours replace a background that is not a system colour, which
// would leave the mask with nothing to show: name the system colour instead.
export const BUTTON_ICON_CLASS_NAME = `${ICON_CLASS_NAME} forced-colors:bg-[color:ButtonText] forced-colors:in-data-[disabled=true]:bg-[color:GrayText]`;

export const PILL_ICON_CLASS_NAME = `${ICON_CLASS_NAME} forced-colors:bg-[color:CanvasText]`;

// Athena's Button draws focus as a half-transparent ring, which forced colours
// remove. An outline replaces it so that keyboard focus is always visible.
const FOCUS_CLASS_NAME =
  "focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-gi-primary";

export const BUTTON_CLASS_NAME = `size-12 border-gi-dark-ash hover:bg-gi-primary/10 active:bg-gi-primary/10 data-[disabled=true]:border-gi-dark-ash data-[disabled=true]:text-gi-dark-ash ${FOCUS_CLASS_NAME}`;

export const RESET_MODAL_CLASS_NAME = "mx-4 [&>div:last-child]:mt-4";

export const RESET_TITLE_CLASS_NAME = "text-lg leading-7 font-bold";

export const RESET_DESCRIPTION_CLASS_NAME = "block leading-5";

export const RESET_ACTION_CLASS_NAME = `text-base leading-[1.2] font-bold ${FOCUS_CLASS_NAME}`;

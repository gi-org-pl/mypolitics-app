import type { NumberRollDirection } from "./SurveyControls.types";

export const NUMBER_ANIMATION_MS = 300;

export const NUMBER_CLASS_NAME =
  "col-start-1 row-start-1 text-center transition-[translate,opacity,filter] ease-out motion-reduce:transition-none";

export const NUMBER_ENTER_CLASS_NAME: Record<NumberRollDirection, string> = {
  down: "starting:translate-y-2 starting:opacity-0 starting:blur-xs",
  up: "starting:-translate-y-2 starting:opacity-0 starting:blur-xs",
};

export const NUMBER_LEAVE_CLASS_NAME: Record<NumberRollDirection, string> = {
  down: "-translate-y-2 opacity-0 blur-xs",
  up: "translate-y-2 opacity-0 blur-xs",
};

export const ICON_CLASS_NAME =
  "block shrink-0 bg-current mask-contain mask-center mask-no-repeat";

export const BUTTON_CLASS_NAME =
  "size-12 border-gi-dark-ash hover:bg-gi-primary/10 active:bg-gi-primary/10 data-[disabled=true]:border-gi-dark-ash data-[disabled=true]:text-gi-dark-ash";

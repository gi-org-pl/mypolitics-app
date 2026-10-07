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

export const ICON_CLASS_NAME =
  "block shrink-0 bg-current mask-contain mask-center mask-no-repeat";

export const BUTTON_CLASS_NAME =
  "size-12 border-gi-dark-ash hover:bg-gi-primary/10 active:bg-gi-primary/10 data-[disabled=true]:border-gi-dark-ash data-[disabled=true]:text-gi-dark-ash";

export const RESET_MODAL_CLASS_NAME =
  "mx-4 [&_h2]:text-lg [&_h2]:leading-7 [&_h2]:font-bold [&_p]:leading-5 [&>div:last-child]:mt-4";

export const RESET_ACTION_CLASS_NAME = "text-base leading-[1.2] font-bold";

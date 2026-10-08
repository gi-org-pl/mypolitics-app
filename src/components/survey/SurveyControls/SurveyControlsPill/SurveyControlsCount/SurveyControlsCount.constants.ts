import { ICON_CLASS_NAME } from "../../SurveyControls.constants";
import type { NumberRollDirection } from "../../SurveyControls.types";

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

export const PILL_ICON_CLASS_NAME = `${ICON_CLASS_NAME} forced-colors:bg-[color:CanvasText]`;

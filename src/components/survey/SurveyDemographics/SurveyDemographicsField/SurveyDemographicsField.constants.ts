import type { DemographicsFieldWidth } from "../SurveyDemographics.types";

export const FIELD_CLASS_NAME =
  "h-auto bg-white p-4 text-base leading-[19px] ring-1 ring-gi-dark-ash ring-inset [&>svg]:w-3 [&>svg]:shrink-0";

export const FIELD_WIDTH_CLASS_NAME: Record<DemographicsFieldWidth, string> = {
  half: "col-span-1",
  full: "col-span-2",
};

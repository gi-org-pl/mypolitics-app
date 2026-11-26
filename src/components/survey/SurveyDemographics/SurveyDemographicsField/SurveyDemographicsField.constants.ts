import type { DemographicsFieldWidth } from "../SurveyDemographics.types";

// The name of a field, and the option chosen in it, wrap onto more lines
// instead of being cut: Athena's select keeps its text on one line.
export const FIELD_CLASS_NAME =
  "h-auto bg-white p-4 text-base leading-[19px] ring-1 ring-gi-dark-ash ring-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gi-primary [&>div]:whitespace-normal [&>div]:wrap-break-word [&>svg]:w-3 [&>svg]:shrink-0";

export const FIELD_WIDTH_CLASS_NAME: Record<DemographicsFieldWidth, string> = {
  half: "col-span-1",
  full: "col-span-2",
};

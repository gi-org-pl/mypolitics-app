import type { DemographicsOption } from "../../SurveyDemographics.types";

export const getSelectedOption = (
  options: DemographicsOption[],
  value?: string,
): DemographicsOption | undefined =>
  options.find((option) => option.value === value);

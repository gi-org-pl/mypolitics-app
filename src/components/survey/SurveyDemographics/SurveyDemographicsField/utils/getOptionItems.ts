import type { DemographicsOption } from "../../SurveyDemographics.types";
import type { DemographicsOptionItem } from "../SurveyDemographicsField.types";

export const getOptionItems = (
  options: DemographicsOption[],
  onChange: (value: string) => void,
): DemographicsOptionItem[] =>
  options.map((option) => ({
    label: option.label,
    onClick: () => onChange(option.value),
  }));

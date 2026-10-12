import type { DemographicsOption } from "../../SurveyDemographics.types";
import type { DemographicsOptionItem } from "../SurveyDemographicsField.types";

export const getOptionItems = (
  options: DemographicsOption[],
  onChange: (value: string) => void,
  value?: string,
): DemographicsOptionItem[] =>
  options.map((option) => ({
    label: option.label,
    isSelected: option.value === value,
    onClick: () => onChange(option.value),
  }));

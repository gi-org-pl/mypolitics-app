import { DEMOGRAPHICS_FIELDS } from "../SurveyDemographics.constants";
import type {
  DemographicsFieldId,
  DemographicsValues,
} from "../SurveyDemographics.types";

export const getNextValues = (
  values: DemographicsValues,
  fieldId: DemographicsFieldId,
  value: string,
): DemographicsValues => {
  const nextValues: DemographicsValues = {};

  for (const { id } of DEMOGRAPHICS_FIELDS) {
    const fieldValue = id === fieldId ? value : values[id];

    if (typeof fieldValue === "string") {
      nextValues[id] = fieldValue;
    }
  }

  return nextValues;
};

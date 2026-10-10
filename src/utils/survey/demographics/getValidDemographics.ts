import {
  DEMOGRAPHICS_FIELD_IDS,
  DEMOGRAPHICS_VALUES,
} from "@/constants/survey";
import type { DemographicsValues } from "@/types/survey";
import { isOneOf } from "@/utils/array/isOneOf";

// Only the four fields, and only values of their lists. Anything else leaves
// its field empty.
export const getValidDemographics = (
  values: Record<string, unknown>,
): DemographicsValues => {
  const validValues: DemographicsValues = {};

  for (const fieldId of DEMOGRAPHICS_FIELD_IDS) {
    const value = values[fieldId];

    if (isOneOf(DEMOGRAPHICS_VALUES[fieldId], value)) {
      validValues[fieldId] = value;
    }
  }

  return validValues;
};

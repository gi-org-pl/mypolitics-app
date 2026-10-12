import {
  DEMOGRAPHICS_EDUCATION_LEVELS,
  DEMOGRAPHICS_GENDERS,
  DEMOGRAPHICS_RESIDENCE_AREA_SIZES,
  DEMOGRAPHICS_VALUES,
} from "@/constants/survey";
import type {
  DemographicsValues,
  ResultInputDemographics,
} from "@/types/survey";
import { isOneOf } from "@/utils/array/isOneOf";

// The demographics as the API takes them: all four fields, each with a value
// of its list, or nothing. They are never sent in part.
export const toResultDemographics = (
  values: DemographicsValues,
): ResultInputDemographics | undefined => {
  const { age, gender, residenceAreaSize, education } = values;

  return isOneOf(DEMOGRAPHICS_VALUES.age, age) &&
    isOneOf(DEMOGRAPHICS_GENDERS, gender) &&
    isOneOf(DEMOGRAPHICS_RESIDENCE_AREA_SIZES, residenceAreaSize) &&
    isOneOf(DEMOGRAPHICS_EDUCATION_LEVELS, education)
    ? { gender, age: Number(age), residenceAreaSize, education }
    : undefined;
};

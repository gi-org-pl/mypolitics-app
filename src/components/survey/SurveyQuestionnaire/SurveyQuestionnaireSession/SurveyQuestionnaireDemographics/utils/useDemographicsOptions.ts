import { useLingui } from "@lingui/react";
import { useMemo } from "react";

import type { SurveyDemographicsProps } from "@/components/survey/SurveyDemographics/SurveyDemographics.types";
import {
  DEMOGRAPHICS_EDUCATION_LEVELS,
  DEMOGRAPHICS_GENDERS,
  DEMOGRAPHICS_RESIDENCE_AREA_SIZES,
  DEMOGRAPHICS_VALUES,
} from "@/constants/survey";

import {
  EDUCATION_LABELS,
  GENDER_LABELS,
  RESIDENCE_AREA_SIZE_LABELS,
} from "../SurveyQuestionnaireDemographics.constants";

// The four lists of the demographics card: the values and their order are the
// session's, the labels are in the language of the app. The lists stay the
// same objects until the language changes.
export const useDemographicsOptions =
  (): SurveyDemographicsProps["options"] => {
    const { i18n } = useLingui();
    const { locale } = i18n;

    // `i18n` stays the same object when the language changes, so the language
    // itself is what the lists depend on.
    return useMemo(
      () => ({
        age: DEMOGRAPHICS_VALUES.age.map((value) => ({ value, label: value })),
        gender: DEMOGRAPHICS_GENDERS.map((value) => ({
          value,
          label: i18n._(GENDER_LABELS[value]),
        })),
        residenceAreaSize: DEMOGRAPHICS_RESIDENCE_AREA_SIZES.map((value) => ({
          value,
          label: i18n._(RESIDENCE_AREA_SIZE_LABELS[value]),
        })),
        education: DEMOGRAPHICS_EDUCATION_LEVELS.map((value) => ({
          value,
          label: i18n._(EDUCATION_LABELS[value]),
        })),
      }),
      [i18n, locale],
    );
  };

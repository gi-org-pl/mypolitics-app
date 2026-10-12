import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";

import type { DeclaredGender } from "@/types/orientation";
import type { EducationLevel, ResidenceAreaSize } from "@/types/survey";

// The labels of the options. The values and their order are
// `DEMOGRAPHICS_VALUES`; an age is labelled with its own number.
export const GENDER_LABELS: Record<DeclaredGender, MessageDescriptor> = {
  female: msg`Kobieta`,
  male: msg`Mężczyzna`,
  other: msg`Inna`,
  prefer_not_to_share: msg`Wolę nie podawać`,
};

export const RESIDENCE_AREA_SIZE_LABELS: Record<
  ResidenceAreaSize,
  MessageDescriptor
> = {
  village: msg`Wieś`,
  city_below_50k: msg`Miasto do 50 tys. mieszkańców`,
  city_below_200k: msg`Miasto od 50 do 200 tys. mieszkańców`,
  city_below_500k: msg`Miasto od 200 do 500 tys. mieszkańców`,
  city_over_500k: msg`Miasto powyżej 500 tys. mieszkańców`,
};

export const EDUCATION_LABELS: Record<EducationLevel, MessageDescriptor> = {
  primary: msg`Podstawowe`,
  basic_vocational: msg`Zasadnicze zawodowe`,
  secondary: msg`Średnie`,
  higher: msg`Wyższe`,
};

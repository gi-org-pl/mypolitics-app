import { msg } from "@lingui/core/macro";

import type {
  DemographicsField,
  DemographicsFieldWidth,
} from "./SurveyDemographics.types";

export const DEMOGRAPHICS_FIELDS: DemographicsField[] = [
  { id: "age", name: msg`Wiek`, width: "half" },
  { id: "gender", name: msg`Płeć`, width: "half" },
  {
    id: "residenceAreaSize",
    name: msg`Wielkość miejsca zamieszkania`,
    width: "full",
  },
  { id: "education", name: msg`Wykształcenie`, width: "full" },
];

export const FIELD_WIDTH_CLASS_NAME: Record<DemographicsFieldWidth, string> = {
  half: "col-span-1",
  full: "col-span-2",
};

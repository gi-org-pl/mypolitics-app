import { msg } from "@lingui/core/macro";

import type { DemographicsField } from "./SurveyDemographics.types";

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

import type { ActionList } from "@gi-org-pl/athena";
import type { ComponentProps } from "react";

import type {
  DemographicsFieldWidth,
  DemographicsOption,
} from "../SurveyDemographics.types";

export type DemographicsOptionItem = ComponentProps<
  typeof ActionList
>["items"][number];

export interface SurveyDemographicsFieldProps {
  name: string;
  width: DemographicsFieldWidth;
  options: DemographicsOption[];
  value?: string;
  isDisabled?: boolean;
  onChange: (value: string) => void;
}

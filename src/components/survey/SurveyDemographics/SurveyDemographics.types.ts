import type { MessageDescriptor } from "@lingui/core";

export type DemographicsFieldId =
  | "age"
  | "gender"
  | "residenceAreaSize"
  | "education";

export interface DemographicsOption {
  value: string;
  label: string;
}

export type DemographicsValues = Partial<Record<DemographicsFieldId, string>>;

export type DemographicsFieldWidth = "half" | "full";

export interface DemographicsField {
  id: DemographicsFieldId;
  name: MessageDescriptor;
  width: DemographicsFieldWidth;
}

export interface SurveyDemographicsProps {
  options: Record<DemographicsFieldId, DemographicsOption[]>;
  values: DemographicsValues;
  onChange: (values: DemographicsValues) => void;
  isDisabled?: boolean;
}

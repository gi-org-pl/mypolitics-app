import type { MessageDescriptor } from "@lingui/core";

export type Demographics = {
  age: number;
  gender: string;
  residenceAreaSize: string;
  education: string;
  region?: string;
};

export type DemographicsInput = {
  age: string | null;
  gender: string | null;
  residenceAreaSize: string | null;
  education: string | null;
  region: string;
};

export type SurveyDemographicsProps = {
  onSubmit: (data: DemographicsInput) => void;
  onSkip: () => void;
  isLoading?: boolean;
  initialModalOpen?: boolean;
  initialValues?: Partial<DemographicsInput>;
};

export type DemographicsFieldOption = {
  value: string;
  labelKey: MessageDescriptor;
};

export type DemographicsField = {
  control: string;
  labelKey: MessageDescriptor;
  full: boolean;
  options: DemographicsFieldOption[];
};

export type SurveyDemographicsContentProps = {
  value: DemographicsInput;
  handleChange: (control: string, value: string) => void;
  onLearnMoreClick: () => void;
};
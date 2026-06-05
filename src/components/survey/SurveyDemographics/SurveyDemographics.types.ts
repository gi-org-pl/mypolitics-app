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
};

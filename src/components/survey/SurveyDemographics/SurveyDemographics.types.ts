export type Demographics = {
  age: number;
  gender: string;
  residenceAreaSize: string;
  education: string;
  region?: string;
};

// Internal nullable form state; not exported outside module
export type DemographicsInput = {
  age: number | null;
  gender: string | null;
  residenceAreaSize: string | null;
  education: string | null;
  region?: string;
};
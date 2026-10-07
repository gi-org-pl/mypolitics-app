export type OrientationType =
  | "ideology"
  | "party"
  | "identity"
  | "compass"
  | "person"
  | "other";

export interface OrientationForms {
  masculine?: string;
  feminine?: string;
}

export interface OrientationBase {
  id: string;
  type: OrientationType;
  color?: string;
  description?: string;
  fullDescription?: string;
  slogan?: string;
  websiteUrl?: string;
  isOfficial?: boolean;
  isHidden?: boolean;
  explanation?: string;
  linkedOrientationIds?: string[];
}

export interface QuizOrientation extends OrientationBase {
  name?: string;
  nameForms?: OrientationForms;
  imageUrl?: string;
  imageUrlForms?: OrientationForms;
}

export interface Orientation extends OrientationBase {
  name?: string;
  imageUrl?: string;
}

export type DeclaredGender =
  | "female"
  | "male"
  | "other"
  | "prefer_not_to_share";

export interface PersonInput {
  resultId: string;
  name?: string;
  imageUrl?: string;
  color?: string;
}

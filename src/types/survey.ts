import type { DeclaredGender, QuizOrientation } from "@/types/orientation";

export type SurveyQuestionAnswerType =
  | "agree-or-disagree"
  | "one-of-many"
  | "other"; // missing or unknown

export interface SurveyPossibleAnswer {
  id: string; // what an answer is recorded and sent as
  text: string;
  weight: number; // 0 when missing or not a number
  orientationIds: string[]; // only orientations the quiz has
}

export interface SurveyQuestion {
  id: string;
  categoryId?: string; // absent when the quiz has no such category
  text: string;
  explanation?: string;
  answerType: SurveyQuestionAnswerType;
  possibleAnswers: SurveyPossibleAnswer[]; // in the API's order, at least one
}

export interface SurveyCategory {
  id: string;
  name?: string;
  weight: number; // 0 when missing or not a number
  isHidden: boolean;
}

export interface SurveyAxis {
  id: string;
  name?: string;
  type: string; // "axis", "compass_x_axis", "compass_y_axis" or anything else, as sent
  description?: string;
  positiveOrientationIds: string[]; // only orientations the quiz has
  negativeOrientationIds: string[]; // only orientations the quiz has
  categoryName?: string;
  isMain: boolean;
}

export interface Survey {
  id: string; // the identifier the quiz was asked for by
  name?: string;
  isOfficial: boolean;
  averageFinishTime?: number; // minutes for the whole quiz
  algorithm?: string;
  defaultLanguage?: string;
  supportedLanguages: string[];
  orientations: QuizOrientation[];
  categories: SurveyCategory[]; // in the API's order
  axes: SurveyAxis[]; // in the API's order
  questions: SurveyQuestion[]; // in the API's order, at least one
}

// How reading a quiz ended. An enum - see ApiFailureKind in types/api.ts
// for why it is a constant with a type of the same name.
export const SurveyLoadStatus = {
  Ready: "ready",
  NotFound: "not-found", // no such quiz, or no question of it can be asked
  Failed: "failed", // no reply, a refusal, or a reply that is not a quiz
} as const;

export type SurveyLoadStatus =
  (typeof SurveyLoadStatus)[keyof typeof SurveyLoadStatus];

export type SurveyLoadResult =
  | { status: typeof SurveyLoadStatus.Ready; survey: Survey }
  | { status: typeof SurveyLoadStatus.NotFound }
  | { status: typeof SurveyLoadStatus.Failed };

export type ResidenceAreaSize =
  | "village"
  | "city_below_50k"
  | "city_below_200k"
  | "city_below_500k"
  | "city_over_500k";

export type EducationLevel =
  | "primary"
  | "basic_vocational"
  | "secondary"
  | "higher";

export interface ResultInputDemographics {
  gender: DeclaredGender;
  age: number;
  residenceAreaSize: ResidenceAreaSize;
  education: EducationLevel;
}

export interface ResultInputAnswer {
  questionId: string;
  answerId: string;
}

export interface ResultInput {
  surveyId: string;
  sessionId: string; // becomes the identifier of the result
  prioritizedCategories: string[]; // category identifiers
  demographics?: ResultInputDemographics; // all four or left out
  answers: ResultInputAnswer[];
}

// How handing the answers in ended. An enum, like SurveyLoadStatus.
export const CreateResultOutcome = {
  Stored: "stored", // created, or a result with this identifier already exists
  Refused: "refused", // any other reply of the API
  Unreachable: "unreachable", // no connection, or no reply in time
} as const;

export type CreateResultOutcome =
  (typeof CreateResultOutcome)[keyof typeof CreateResultOutcome];

export interface SurveyResult {
  id: string; // the identifier the result was asked for by
  isCalculated: boolean;
}

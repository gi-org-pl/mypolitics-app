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

export type SurveyPhase =
  | "category-select"
  | "questions"
  | "checkpoints"
  | "demographics"
  | "email-capture"
  | "results-calculation"
  | "short-results"; // the results module's phase: part of the contract, never entered here

export interface SurveyAnswerEntry {
  questionId: string;
  answerId?: string; // absent = the question was skipped
}

// The five kinds a question can produce. Each is also a valid
// `SurveyAnswerType` of the answer button.
export type SurveyAnswerKind =
  | "strongly-agree"
  | "agree"
  | "disagree"
  | "strongly-disagree"
  | "custom";

export interface SurveyAnswerToDraw {
  id: string; // identifier of the possible answer
  label: string;
  kind: SurveyAnswerKind;
}

export type DemographicsFieldId =
  | "age"
  | "gender"
  | "residenceAreaSize"
  | "education";

export type DemographicsValues = Partial<Record<DemographicsFieldId, string>>;

export interface SurveyEmail {
  address: string;
  hasConsent: boolean;
}

export type SurveyResultState =
  | "not-sent"
  | "sending"
  | "created"
  | "calculated"
  | "failed";

export interface SurveyTimeSample {
  questionId: string;
  seconds: number; // how long that done question was on screen
}

export interface SurveyCheckpointRecord {
  cardsShown: unknown[]; // the cards put on screen, oldest first. Their shape is survey-checkpoint-engine's
  timeSamples: SurveyTimeSample[]; // at most one per done question; a question that was not timed has none
}

export interface SurveySession {
  id: string; // random UUID v4: the session, the seed of every seeded draw, and the result identifier
  surveyId: string;
  entries: SurveyAnswerEntry[]; // one per done question: always the first questions of the quiz, in order, no gap
  topicIds: string[]; // prioritised categories, in the order picked
  areTopicsConfirmed: boolean;
  phase: SurveyPhase;
  areCheckpointsOff: boolean;
  demographics: DemographicsValues;
  areDemographicsGiven: boolean;
  checkpointRecord: SurveyCheckpointRecord;
  email: SurveyEmail | null; // memory only - never stored
  resultState: SurveyResultState; // memory only - never stored
}

// What is written to the storage of the tab.
export type StoredSurveySession = Omit<SurveySession, "email" | "resultState">;

// A session whose parts are of the right kind but whose content is not checked
// against the quiz yet: what storage held, or a session that fitted an earlier
// reading of the quiz. A `SurveySession` is always one of these.
export interface UnfittedSurveySession
  extends Omit<
    SurveySession,
    "entries" | "topicIds" | "phase" | "demographics" | "checkpointRecord"
  > {
  entries: readonly (SurveyAnswerEntry | undefined)[]; // `undefined` = an entry that could not be read
  topicIds: readonly unknown[];
  phase?: SurveyPhase;
  demographics: Record<string, unknown>;
  checkpointRecord: {
    cardsShown: unknown[];
    timeSamples: readonly (SurveyTimeSample | undefined)[];
  };
}

export interface SurveySessionConfig {
  isEmailSendingSetUp: boolean;
}

export interface SurveyProgress {
  done: number; // answered + skipped
  all: number; // questions of the quiz
}

export type SurveyVisibleCategory = SurveyCategory & { name: string };

export interface SurveySessionApi {
  session: SurveySession;
  setTopics: (topicIds: string[]) => void;
  confirmTopics: () => void; // "Idziemy dalej"
  skipTopics: () => void; // "Pomiń" on category select
  answer: (answerId: string, seconds?: number) => void;
  skip: (seconds?: number) => void; // "Pomiń" under a question
  back: () => void;
  showCheckpoint: (card: unknown) => void;
  closeCheckpoint: () => void; // "Dalej"
  turnCheckpointsOff: () => void; // "Wyłącz checkpointy"
  setDemographics: (values: DemographicsValues) => void;
  leaveDemographics: (isGiven: boolean) => void; // true = "Zobacz wyniki", false = "Pomiń"
  setEmail: (email: SurveyEmail | null) => void;
  leaveEmailCapture: (isGiven: boolean) => void; // true = "Wyślij i zobacz wyniki", false = "Pomiń"
  setResultState: (resultState: SurveyResultState) => void;
  reset: () => void;
  leave: () => void; // the taker is sent to the results: the stored record is removed
  startOver: () => void; // a brand-new session, nothing carried over
}

export type SurveySessionActions = Omit<SurveySessionApi, "session">;

// What an event makes of a session. It returns the very session it was handed
// when the event does not apply at that moment.
export type SurveySessionAction<Arguments extends unknown[] = []> = (
  survey: Survey,
  session: SurveySession,
  ...actionArguments: Arguments
) => SurveySession;

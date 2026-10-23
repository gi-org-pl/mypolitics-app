import type { Orientation } from "@/types/orientation";
import type { QuizResult } from "@/types/results";
import type { SurveyPossibleAnswer, SurveyQuestion } from "@/types/survey";

// What kind the other side of a comparison is. An enum, written as a constant
// with a type of the same name - see ApiFailureKind in types/api.ts.
export const ComparisonMode = {
  Friend: "friend", // another result of the same quiz, known by its identifier
  Orientation: "orientation", // an orientation of the quiz
} as const;

export type ComparisonMode =
  (typeof ComparisonMode)[keyof typeof ComparisonMode];

// A friend as the other side: the person they are drawn as, and their result.
export interface FriendSide {
  mode: typeof ComparisonMode.Friend;
  orientation: Orientation; // a person orientation whose identifier is the friend's result identifier
  result: QuizResult;
}

// An orientation of the quiz as the other side. It has answers and no result.
export interface OrientationSide {
  mode: typeof ComparisonMode.Orientation;
  orientation: Orientation;
}

// The other side of a comparison. There is one at a time.
export type OtherSide = FriendSide | OrientationSide;

// How the two sides stand on one question. An enum, like ComparisonMode.
export const Agreement = {
  Agree: "agree",
  Disagree: "disagree",
  Neither: "neither", // one side has nothing to compare
} as const;

export type Agreement = (typeof Agreement)[keyof typeof Agreement];

// A question of the quiz with what each side answers it, and how they stand.
export interface ComparedQuestion {
  question: SurveyQuestion;
  answer?: SurveyPossibleAnswer; // the taker's. Absent = the taker did not answer
  otherAnswers: SurveyPossibleAnswer[]; // the other side's: the one a friend chose, or every one that lists the orientation
  agreement: Agreement;
}

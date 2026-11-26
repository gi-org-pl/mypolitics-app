import type { ComparisonMode, OtherSide } from "@/types/comparison";
import type { Orientation } from "@/types/orientation";
import type { ResolvedModule } from "@/types/results";

import type { ReadyResults } from "../../ResultsScreen.types";

// The side of the taker: the quiz, the result with its identifier, and what
// it was resolved to. The same as the screen draws "Your results" from.
export type ResultsComparisonProps = Pick<
  ReadyResults,
  "survey" | "result" | "resolved"
>;

// The states of a comparison, as the spec lists them. An enum, written as a
// constant with a type of the same name - see ApiFailureKind in types/api.ts.
export const ComparisonStatus = {
  Choosing: "choosing", // no comparison runs
  Fetching: "fetching", // the result of a friend is on the way
  Refused: "refused", // the result of a friend cannot be used
  Comparing: "comparing", // a comparison runs
} as const;

export type ComparisonStatus =
  (typeof ComparisonStatus)[keyof typeof ComparisonStatus];

// Why the result of a friend cannot be used. An enum, like ComparisonStatus.
export const FriendRefusal = {
  Own: "own", // it is the identifier of the taker
  OtherSurvey: "other-survey", // it was handed in for another survey
  Unreadable: "unreadable", // it does not exist, is not calculated, or cannot be read
} as const;

export type FriendRefusal = (typeof FriendRefusal)[keyof typeof FriendRefusal];

// What a running comparison can show under the agreement bar. The value of
// a view is also the value of its tab, so it differs from the value of every
// other tab of the screen.
export const ComparisonView = {
  Results: "compared-results", // the modules of the taker with the other side laid over them
  Questions: "compared-questions", // the questions with the answers of both sides
} as const;

export type ComparisonView =
  (typeof ComparisonView)[keyof typeof ComparisonView];

interface ChoiceState {
  mode: ComparisonMode; // the mode shown; the one last used once a comparison ended
  friendId: string; // the text of the field of the friend, as typed
}

export interface ChoosingState extends ChoiceState {
  status: typeof ComparisonStatus.Choosing;
}

export interface FetchingState extends ChoiceState {
  status: typeof ComparisonStatus.Fetching;
  mode: typeof ComparisonMode.Friend;
  requestedId: string; // the identifier the result is asked for by
}

export interface RefusedState extends ChoiceState {
  status: typeof ComparisonStatus.Refused;
  mode: typeof ComparisonMode.Friend;
  refusal: FriendRefusal;
}

export interface ComparingState {
  status: typeof ComparisonStatus.Comparing;
  other: OtherSide; // who the taker is compared with; its mode is the mode of the comparison
  score?: number; // the agreement score, 0-100. Absent = no question agrees or disagrees
  modules?: ResolvedModule[]; // the result of a friend, resolved as the modules of the taker are. Absent for an orientation
  views: ComparisonView[]; // what this comparison can show, in the order of the switch
  view?: ComparisonView; // the view shown. Absent = this comparison has no view
}

// One state at a time: what the tab draws follows from it alone.
export type ComparisonState =
  | ChoosingState
  | FetchingState
  | RefusedState
  | ComparingState;

// The states the mode selector is drawn in: every one but comparing.
export type ComparisonChoiceState = Exclude<ComparisonState, ComparingState>;

// What the taker can do. Each does nothing in a state that does not allow it.
export interface ComparisonActions {
  chooseMode: (mode: ComparisonMode) => void;
  enterFriendId: (text: string) => void; // the field of the friend changed
  pickOrientation: (orientationId: string) => void;
  chooseView: (view: ComparisonView) => void;
  end: () => void; // the control that ends the comparison
}

export interface ResultsComparisonControls extends ComparisonActions {
  state: ComparisonState;
  orientations: Orientation[]; // the offered orientations. None = the orientation mode is not offered
}

// What a comparison is worked out from: the side of the taker.
export type ComparisonContext = ResultsComparisonProps;

// What every view of a running comparison is given. The content of a view is
// a component that takes exactly this.
export interface ComparisonViewProps extends ResultsComparisonProps {
  comparison: ComparingState;
}

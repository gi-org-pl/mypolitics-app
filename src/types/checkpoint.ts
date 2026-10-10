import type { MessageDescriptor } from "@lingui/core";
import type { ComponentType } from "react";

import type { AxisEntry } from "@/types/axis";
import type { Orientation } from "@/types/orientation";
import type {
  NolanLevel,
  NolanQuadrantKey,
  ResultEntry,
} from "@/types/results";
import type {
  Survey,
  SurveyAnswerEntry,
  SurveyAxis,
  SurveyCheckpointRecord,
  SurveyPossibleAnswer,
  SurveyQuestion,
  SurveySession,
} from "@/types/survey";

// The part of the session the running state is computed from. A whole `SurveySession` can be passed as it is.
//   entries                      - the done questions, in order: `answerId` absent = skipped
//   prioritizedCategoryIds       - the categories the taker prioritised; [] when none
//   checkpointRecord.timeSamples - `SurveyTimeSample[]`: how long each done question was on screen
// `checkpointRecord.cardsShown` is not read here.
export type RunningStateSession = Pick<
  SurveySession,
  "entries" | "prioritizedCategoryIds" | "checkpointRecord"
>;

// Inputs that have no source today. Each is simply empty until one exists.
export interface RunningStateSources {
  traitIds?: string[]; // the orientations the quiz uses as traits. No survey sends them: absent = []
}

export interface RunningScore {
  points: number; // what the taker's answers gave the orientation so far
  maximum: number; // the most the done questions could have given it
  value?: number; // points / maximum x 100, exact, 0-100. Absent while maximum is 0
}

export interface RunningProgress {
  all: number; // questions in the quiz
  done: number; // answered + skipped. This is the number of the boundary
  answered: number;
  skipped: number;
  left: number; // all - done
  share: number; // done / all, 0-1
  midpointBoundary: number; // the first boundary at which share is one half or more: 51 of 102, 5 of 9
}

export interface RunningTiming {
  timedQuestions: number; // done questions that have a usable time sample
  averagePace?: number; // seconds per question: the mean of the samples, each counted as 60 at most. Absent with no sample
  minutesLeft?: number; // whole minutes, 1 or more. Absent when it cannot be worked out
}

interface RunningAxisBase {
  id: string; // the axis identifier
  answered: number; // answered questions that feed the axis
  lean?: number; // points, from the exact values. Absent while a value it needs is absent
}

// One orientation on each side, both fed by at least one question of the quiz.
export interface RunningTwoSidedAxis extends RunningAxisBase {
  kind: "two-sided";
  start: AxisEntry; // the negative side and its value
  end: AxisEntry; // the positive side and its value
  leadingSide?: "start" | "end"; // the side with the higher value. Absent without a lean, and at a lean of 0
}

// One fed orientation; the other side is empty or holds an orientation no question feeds.
export interface RunningSingleAxis extends RunningAxisBase {
  kind: "single";
  entry: AxisEntry; // the fed orientation and its value
}

export type RunningAxis = RunningTwoSidedAxis | RunningSingleAxis;

// A position on the compass, by the Nolan chart's rule.
export interface CompassPoint {
  x: number; // -1 to 1: the horizontal axis, negative side at -1
  y: number; // -1 to 1: the vertical axis, negative side at -1
  level: NolanLevel; // centre, moderate or extreme
  quadrant: NolanQuadrantKey;
  done: number; // the boundary it was reached at
}

export interface RunningCompass {
  trail: CompassPoint[]; // one point per answered question, from the first that has a position. The last one is where the taker stands now
  quadrantsVisited: NolanQuadrantKey[]; // in the order they were first visited
}

export interface RunningState {
  progress: RunningProgress;
  timing: RunningTiming;
  scores: Record<string, RunningScore>; // by orientation identifier, one per orientation of the quiz
  axes: RunningAxis[]; // the axes a card can speak about, in the quiz's order
  archetypes: ResultEntry[]; // the named positions with their closeness, closest first
  unlockedTraits: Orientation[]; // in the quiz's order. Always [] today
  compass: RunningCompass | null; // null = the quiz has no compass
}

// What follows is not part of the state: it is what the functions of
// `src/utils/running-state/` hand to each other.

// A question the taker has passed, with the answer picked.
export interface DoneQuestion {
  question: SurveyQuestion;
  answer?: SurveyPossibleAnswer; // absent = skipped
}

// Points and maximum before a value is made of them: what one question adds,
// or a sum on the way.
export type ScoreTotal = Pick<RunningScore, "points" | "maximum">;

// The two axes of a compass. Each lists only orientations the quiz has, each
// once, and has at least one on either side.
export interface CompassAxes {
  horizontal: SurveyAxis; // `compass_x_axis`
  vertical: SurveyAxis; // `compass_y_axis`
}

// The checkpoint engine: the cards, the record of the cards shown, the copy
// pools, and what the engine is asked with.

// In priority order, 1 = highest. Every type except "halfway" is personal.
export type CheckpointType =
  | "stats" // 1 - stats chart
  | "new-trait" // 2
  | "position-puzzle" // 3 - double axis puzzle
  | "nolan-path" // 4 - Nolan chart path
  | "axis-closeness" // 5
  | "axis-puzzle" // 6 - single axis puzzle
  | "halfway"; // 7 - halfway through, the only generic type

// One pool per card and state. Fourteen.
export type CheckpointPoolId =
  | "halfway"
  | "axis-closeness-single"
  | "axis-closeness-double"
  | "new-trait"
  | "nolan-path-partial" // two or three quadrants
  | "nolan-path-full" // four quadrants
  | "stats-for"
  | "stats-against"
  | "axis-puzzle-ask"
  | "axis-puzzle-hit"
  | "axis-puzzle-miss"
  | "position-puzzle-ask"
  | "position-puzzle-hit"
  | "position-puzzle-miss";

// A drawn line: which line of which pool, by its position in the pool. Language-independent.
export interface CheckpointLine {
  pool: CheckpointPoolId;
  index: number;
}

// A line as written in the pools: a lead-in and a statement, always drawn together.
export interface CheckpointCopyLine {
  leadIn: MessageDescriptor; // no slots
  statement: MessageDescriptor; // slots as ICU placeholders, such as {minutes}
}

export type CheckpointPools = Record<CheckpointPoolId, CheckpointCopyLine[]>;

// A line in the active language, slots filled. Ready for the card frame.
export interface CheckpointText {
  leadIn: string;
  statement: string;
}

export type CheckpointSlots = Record<string, string | number>;

export type CheckpointOutcome = "hit" | "miss";

// What every card carries. A card is frozen when it fires: nothing in it changes with later answers.
interface CheckpointCardBase {
  boundary: number; // the number of done questions when it fired
  line: CheckpointLine; // the line drawn when it fired. For a puzzle: its ask line
}

export interface StatsCheckpointCard extends CheckpointCardBase {
  type: "stats";
  questionId: string; // the question just answered
  thesis: string; // its text, as written
  side: "for" | "against"; // the taker's side
  counts: { for: number; against: number; noAnswer: number }; // the three slices of the pie
  percent: number; // the share of the taker's side: a whole number, 1 to 10
}

export interface NewTraitCheckpointCard extends CheckpointCardBase {
  type: "new-trait";
  trait: Orientation; // the trait announced: name, colour, image
}

export interface PositionPuzzleCheckpointCard extends CheckpointCardBase {
  type: "position-puzzle";
  leader: Orientation; // the closest archetype - the correct option
  closeness: number; // its closeness when the card fired, 50 to 100: the length of the bar
  options: Orientation[]; // the three rows in the order they are shown: the leader and two distractors
}

export interface NolanPathCheckpointCard extends CheckpointCardBase {
  type: "nolan-path";
  variant: "partial" | "full"; // two or three quadrants | four quadrants
  count: 2 | 3 | 4; // quadrants visited in the whole run. 4 exactly when the variant is "full"
  trail: CompassPoint[]; // the part of the route this card draws, in order. Its last point is where the taker stands
  isSecondPath: boolean; // true = the four-quadrant card after a partial one: the trail starts where that card left off
}

interface AxisClosenessCheckpointCardBase extends CheckpointCardBase {
  type: "axis-closeness";
  axisId: string;
}

export interface AxisClosenessSingleCheckpointCard
  extends AxisClosenessCheckpointCardBase {
  variant: "single";
  entry: AxisEntry; // the orientation and its value when the card fired, 70 or more
}

export interface AxisClosenessDoubleCheckpointCard
  extends AxisClosenessCheckpointCardBase {
  variant: "double";
  start: AxisEntry; // the negative side and its value
  end: AxisEntry; // the positive side and its value
  leadingSide: "start" | "end"; // the side the title and the statement name
}

export type AxisClosenessCheckpointCard =
  | AxisClosenessSingleCheckpointCard
  | AxisClosenessDoubleCheckpointCard;

export interface AxisPuzzleCheckpointCard extends CheckpointCardBase {
  type: "axis-puzzle";
  axisId: string;
  start: AxisEntry; // the start pole and its value when the card fired
  end: AxisEntry; // the end pole and its value
  leadingSide: "start" | "end"; // the correct option
}

export interface HalfwayCheckpointCard extends CheckpointCardBase {
  type: "halfway";
  percent: number; // progress at the boundary, a whole percent rounded down, never below 50
  minutes: number; // time left, whole minutes, 1 to 99
}

export type CheckpointCard =
  | StatsCheckpointCard
  | NewTraitCheckpointCard
  | PositionPuzzleCheckpointCard
  | NolanPathCheckpointCard
  | AxisClosenessCheckpointCard
  | AxisPuzzleCheckpointCard
  | HalfwayCheckpointCard;

// One item of the session's `cardsShown`: a card that was put on screen, and the reveal lines a puzzle drew on it.
// This is what the screen hands to `showCheckpoint` of survey-session: `session.showCheckpoint({ card })`.
export interface CheckpointShownCard {
  card: CheckpointCard;
  revealLines?: Partial<Record<CheckpointOutcome, CheckpointLine>>;
}

// `SurveyCheckpointRecord` of survey-session with `cardsShown` narrowed from `unknown[]` to the cards of this task.
// It is the same record, not a second one: survey-session stores it, resets it and restores it, and `timeSamples`
// (`SurveyTimeSample[]`) is inherited unchanged. A stored record becomes a `CheckpointRecord` only through
// `readCheckpointRecord`, which checks its cards. The record is the only memory the engine has.
export interface CheckpointRecord extends SurveyCheckpointRecord {
  cardsShown: CheckpointShownCard[]; // oldest first. The last one is the card that is up, when one is
}

// What every card component receives. A card component reads nothing but
// these: everything it draws is in `card`.
export interface CheckpointCardProps<
  Type extends CheckpointType = CheckpointType,
> {
  card: Extract<CheckpointCard, { type: Type }>; // its own member of the union, frozen
  onReveal: (outcome: CheckpointOutcome) => CheckpointLine | undefined; // a puzzle calls it on the guess and gets its hit or miss line
  onContinue: () => void; // pass to the frame unchanged
  onOptOut: () => void; // pass to the frame unchanged
}

// The card component of each type that has one. A type with no entry is never
// handed to the engine, so it is never selected and never shown.
export type CheckpointCardRegistry = {
  [Type in CheckpointType]?: ComponentType<CheckpointCardProps<Type>>;
};

// How takers answered one question. The source reads and checks the response; the engine does the adding up.
export interface CheckpointAnswerCounts {
  resultsCounted: number; // results in which the question was shown
  chosen: Record<string, number>; // by possible answer identifier: results that chose it
}

export type CheckpointAggregates = Record<string, CheckpointAnswerCounts>; // by question identifier

export interface CheckpointEngineInput {
  survey: Survey;
  entries: SurveyAnswerEntry[]; // `session.entries`. The last one is the question done at this boundary
  state: RunningState | null; // `getRunningState(survey, session)` for the same session
  record: CheckpointRecord; // `readCheckpointRecord(session.checkpointRecord)`
  seed: string; // `session.id`
  isOptedOut: boolean; // `session.areCheckpointsOff`
  enabledTypes: readonly CheckpointType[]; // the types that have a card component. Any other type is never a candidate
  aggregates?: CheckpointAggregates; // absent = no source, or not loaded yet
}

// What follows is not part of the engine's contract: it is what the functions
// of `src/utils/checkpoint/` hand to each other.

// What a card type is asked with at a boundary whose slot is open: the
// engine's input, with a state that exists.
export interface CheckpointTriggerInput
  extends Pick<
    CheckpointEngineInput,
    "survey" | "entries" | "record" | "seed" | "aggregates"
  > {
  state: RunningState;
}

type WithoutLine<Card> = Card extends unknown ? Omit<Card, "line"> : never;

// A card that passed its trigger and its gate and has its values, before its
// line is drawn. Every `CheckpointCard` is one of these too.
export type CheckpointCandidate = WithoutLine<CheckpointCard>;

// The three slices of the pie of one question, and the takers who answered it.
export interface CheckpointQuestionCounts {
  for: number;
  against: number;
  noAnswer: number;
  sample: number; // for + against
}

// An axis that leans clearly enough for a card. A two-sided one has a leading
// side.
export type LeaningAxis =
  | (RunningSingleAxis & { lean: number })
  | (RunningTwoSidedAxis & { lean: number; leadingSide: "start" | "end" });

// Anything that names the orientations of an axis: an axis of the running
// state, or an axis card.
export type CheckpointAxisSides =
  | { entry: AxisEntry }
  | { start: AxisEntry; end: AxisEntry };

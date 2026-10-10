import type { AxisEntry } from "@/types/axis";
import type { Orientation } from "@/types/orientation";
import type {
  NolanLevel,
  NolanQuadrantKey,
  ResultEntry,
} from "@/types/results";
import type {
  SurveyAxis,
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

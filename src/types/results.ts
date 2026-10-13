import type { ScoreTotal } from "@/types/checkpoint";
import type { DeclaredGender, Orientation } from "@/types/orientation";
import type { ResultInputAnswer, Survey, SurveyAxis } from "@/types/survey";
import type { TranslatedText } from "@/types/text";

export interface ResultEntry {
  orientation: Orientation;
  value?: number;
}

export interface RankedComparison {
  orientation: Orientation;
  values: Record<string, number>;
}

export type NolanLevel = "centre" | "moderate" | "extreme";

export type NolanPoleSide = "start" | "end";

export type NolanQuadrantKey =
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight";

export interface NolanAxisValues {
  start?: number;
  end?: number;
}

export interface NolanPosition {
  x: number;
  y: number;
  r: number;
  level: NolanLevel;
  quadrant: NolanQuadrantKey;
  poles: { horizontal: NolanPoleSide; vertical: NolanPoleSide };
}

export type ResultModuleType =
  | "header"
  | "single_axis"
  | "double_axis"
  | "multi_axis"
  | "horizontal_bar"
  | "nolan_chart"
  | "archetype"
  | "traits";

export type ResultModuleColumn = "start" | "end";

export type ResultModuleSelection = "all" | "linked_to_leader";

export type ResultModuleGrouping = "none" | "category";

// One record for every module type. A type reads the fields the spec lists for
// it and ignores the rest.
export interface ResultModule {
  id: string;
  type: ResultModuleType; // as sent
  position: number;
  column: ResultModuleColumn;
  title?: string;
  description?: string;
  orientationIds: string[]; // only orientations the quiz has, each once, in the author's order
  axisIds: string[]; // only axes the quiz has, each once, in the author's order
  selection: ResultModuleSelection;
  groupBy: ResultModuleGrouping;
  marker: number | false; // 0-100. false = no reference line
  visibleRows: number; // a whole number, 1 or more
  labels: Record<string, string>; // by slot; only the slots of the record's type
  colors: Record<string, string>; // by slot; only the slots of the record's type
}

// A record of a list the app keeps for a quiz the API sends none for: what the
// API would send, except that a text is held per language.
export interface OwnResultModule
  extends Partial<
    Omit<ResultModule, "title" | "description" | "marker" | "labels">
  > {
  id: string;
  type: ResultModuleType;
  position: number;
  title?: TranslatedText;
  description?: TranslatedText;
  marker?: number | null; // null = no reference line
  labels?: Record<string, TranslatedText>; // by slot
}

// The slots a module type has: the names its labels and its colours go by.
export interface ResultModuleSlots {
  labels: readonly string[];
  colors: readonly string[];
}

// A result as its modules are resolved from it.

// An answer of a result: the question and the possible answer chosen for it.
export type ResultAnswer = ResultInputAnswer;

// What a result brings: for each orientation its points and its maximum, as
// the back-end calculated them, and the answers given.
export interface QuizResult {
  scores: Record<string, ScoreTotal>; // by orientation identifier
  answers: ResultAnswer[];
}

// An axis with its two poles: the negative side as the start entry, the
// positive side as the end entry.
export interface ResolvedAxis {
  id: string;
  name?: string;
  start: ResultEntry;
  end: ResultEntry;
}

export interface ResolvedAxisGroup {
  name?: string; // absent = the group has no name
  axes: ResolvedAxis[];
}

export interface ResolvedRankedEntry extends ResultEntry {
  isOfficial: boolean;
}

export interface ResolvedCategory {
  id: string;
  name?: string;
  entries: ResolvedRankedEntry[]; // each with its value inside the category
}

// What a module type is given. A horizontal bar has entries, or categories
// when its record groups by category.
export type ResolvedModuleContent =
  | { type: "single_axis"; entry: ResultEntry; marker: number | false }
  | { type: "double_axis"; axis: ResolvedAxis; marker: number | false }
  | {
      type: "multi_axis";
      groups: ResolvedAxisGroup[];
      marker: number | false;
    }
  | {
      type: "horizontal_bar";
      entries: ResolvedRankedEntry[];
      visibleRows: number;
    }
  | {
      type: "horizontal_bar";
      categories: ResolvedCategory[];
      visibleRows: number;
    }
  | {
      type: "nolan_chart";
      horizontal: ResolvedAxis;
      vertical: ResolvedAxis;
      labels: Record<string, string>; // by slot, as read
      colors: Record<string, string>; // by slot, as read
    }
  | { type: "archetype"; entries: ResultEntry[] }
  | { type: "traits"; traits: Orientation[]; earnedIds: string[] };

interface ResolvedModuleBase {
  id: string;
  position: number;
  column: ResultModuleColumn;
  title?: string;
  description?: string;
}

export type ResolvedModule = ResolvedModuleBase & ResolvedModuleContent;

export interface ResolvedHeader {
  orientation?: Orientation; // the highest of the header record's orientations. Absent = no match
  confidence?: number; // its value
  linkLabel?: string;
}

export interface ResolvedResult {
  leader?: ResultEntry; // absent = nobody leads, or the highest is below a partial match
  header?: ResolvedHeader; // absent = the quiz has no header record
  modules: ResolvedModule[]; // only the ones that can be drawn, in the order they are drawn
}

// What follows is not part of a resolved result: it is what the functions of
// `src/utils/result-modules/` hand to each other.

// What a record is resolved against: the quiz, the result, and whose result
// it is.
export interface ResolutionContext {
  survey: Survey;
  result: QuizResult;
  gender?: DeclaredGender; // chooses the form of a name and an image
  leader?: ResultEntry;
}

// Axes of the quiz that stand together, before their sides are resolved.
export interface SurveyAxisGroup {
  name?: string;
  axes: SurveyAxis[];
}

// The types that stand among the modules. The header is resolved on its own.
export type DrawnModuleType = Exclude<ResultModuleType, "header">;

// What a module of one type is given, or nothing when its record cannot be
// drawn.
export type ModuleResolver<Type extends DrawnModuleType = DrawnModuleType> = (
  record: ResultModule,
  context: ResolutionContext,
) => Extract<ResolvedModuleContent, { type: Type }> | undefined;

import type {
  RESULT_MODULE_PARAM_DEFINITIONS,
  RESULT_MODULE_PARAMS,
} from "@/constants/results";
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

// A parameter of a record as it is saved: a number, a text, yes or no,
// nothing, or a list of those.
export type ResultModuleParamScalar = string | number | boolean | null;

export type ResultModuleParamValue =
  | ResultModuleParamScalar
  | ResultModuleParamScalar[];

// One record for every module type. Its fields are what every module has;
// everything a type can be set to is a parameter, a label or a colour, by
// name.
export interface ResultModule {
  id: string;
  type: ResultModuleType; // as sent
  position: number;
  column: ResultModuleColumn;
  title?: string;
  description?: string;
  orientationIds: string[]; // only orientations the quiz has, each once, in the author's order
  axisIds: string[]; // only axes the quiz has, each once, in the author's order
  params: Record<string, ResultModuleParamValue>; // by name, as saved: the names are not interpreted here
  labels: Record<string, string>; // by slot; only the slots of the record's type
  colors: Record<string, string>; // by slot; only the slots of the record's type
}

// A record known to be of one type.
export type ResultModuleOf<Type extends ResultModuleType> = ResultModule & {
  type: Type;
};

// A record of a list the app keeps for a quiz the API sends none for: what the
// API would send, except that a text is held per language.
export interface OwnResultModule
  extends Partial<Omit<ResultModule, "title" | "description" | "labels">> {
  id: string;
  type: ResultModuleType;
  position: number;
  title?: TranslatedText;
  description?: TranslatedText;
  labels?: Record<string, TranslatedText>; // by slot
}

// The parameters of a record: what a name may hold is a definition, and a
// definition is of a kind.

// What a definition of each kind says: what the name may hold, and what it is
// when it is left out or holds anything else.
export interface ResultModuleParamRules {
  // One of a set of values.
  choice: { values: readonly string[]; fallback: string };
  // A number within bounds. `nullable` says whether the author may set it to
  // nothing, which is read as `false`.
  number: {
    min: number;
    max: number;
    whole: boolean;
    nullable: boolean;
    fallback: number;
  };
}

export type ResultModuleParamKind = keyof ResultModuleParamRules;

export type ResultModuleParamDefinition<
  Kind extends ResultModuleParamKind = ResultModuleParamKind,
> = { [Each in Kind]: { kind: Each } & ResultModuleParamRules[Each] }[Kind];

// What a saved value is read as, by the kind of its definition.
interface ResultModuleParamReadings<
  Definition extends ResultModuleParamDefinition = ResultModuleParamDefinition,
> {
  choice: Definition extends { values: readonly (infer Value)[] }
    ? Value
    : never;
  number: Definition extends { nullable: false } ? number : number | false;
}

// Reads a saved value by a definition of one kind. The value is absent when
// the record leaves the name out.
export type ResultModuleParamReader<Kind extends ResultModuleParamKind> = (
  definition: ResultModuleParamDefinition<Kind>,
  value?: ResultModuleParamValue,
) => ResultModuleParamReadings[Kind];

type ResultModuleParamDefinitions = typeof RESULT_MODULE_PARAM_DEFINITIONS;

export type ResultModuleParamName = keyof ResultModuleParamDefinitions;

// Every parameter the app knows, as the app works with it. Derived from the
// definitions: an entry there is a name here.
export type ResultModuleParams = {
  [Name in ResultModuleParamName]: ResultModuleParamReadings<
    ResultModuleParamDefinitions[Name]
  >[ResultModuleParamDefinitions[Name]["kind"]];
};

// The parameters a module type reads, and no other. Derived from the table of
// parameters by type, one type at a time, so that a record whose type is not
// known has no parameter that can be asked for.
export type ResultModuleParamsOf<Type extends ResultModuleType> =
  Type extends ResultModuleType
    ? Pick<ResultModuleParams, (typeof RESULT_MODULE_PARAMS)[Type][number]>
    : never;

export type ResultModuleSelection = ResultModuleParams["selection"];

export type ResultModuleGrouping = ResultModuleParams["groupBy"];

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
// drawn. The record is of that type, so a resolver can ask for the parameters
// of its type and for no other.
export type ModuleResolver<Type extends ResultModuleType = ResultModuleType> = (
  record: ResultModuleOf<Type>,
  context: ResolutionContext,
) => Extract<ResolvedModuleContent, { type: Type }> | undefined;

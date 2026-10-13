import type {
  RESULT_MODULE_KEYS,
  RESULT_MODULE_VALUE_DEFINITIONS,
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

// A value of a record as it is saved: a string or a whole number.
export type ResultModuleValue = string | number;

// One record for every module type. Its fields are what the back-end has a
// use for; everything else about the module - its title, its description, its
// settings, its labels and its colours - is a value by key.
export interface ResultModule {
  id: string;
  type: ResultModuleType; // as sent
  position: number;
  column: ResultModuleColumn;
  orientationIds: string[]; // only orientations the quiz has, each once, in the author's order
  axisIds: string[]; // only axes the quiz has, each once, in the author's order
  values: Record<string, ResultModuleValue>; // by key, as saved: the keys are not interpreted here
}

// A record known to be of one type.
export type ResultModuleOf<Type extends ResultModuleType> = ResultModule & {
  type: Type;
};

// A pair of a key and a value, as a list of the app holds it: what the API
// would send, except that a text is held per language.
export interface OwnResultModulePair {
  key: string;
  value: ResultModuleValue | TranslatedText;
}

// A record of a list the app keeps for a quiz the API sends none for: what the
// API would send, its values as a list of pairs.
export interface OwnResultModule extends Partial<Omit<ResultModule, "values">> {
  id: string;
  type: ResultModuleType;
  position: number;
  values: OwnResultModulePair[];
}

// The values of a record: what a key may hold is a definition, and a
// definition is of a kind.

// What a definition of each kind says beyond its kind. A definition is a
// description and holds everything a quiz editor needs to offer a control for
// its key: the kind chooses the control, the rest are its bounds or its
// choices, and `fallback` is what the key is when it is left out or holds
// anything else. A kind with no fallback has none: its key is then absent.
export interface ResultModuleValueRules {
  // A text, the same in every language.
  text: Record<never, never>;
  // A text the author writes in each language of the quiz. The API sends it
  // in one language, so it is read like a text.
  localizedText: Record<never, never>;
  // A whole number within bounds. `off` is optional: the word that stands for
  // "off" where a key has one, and what the app reads it as.
  number: {
    min: number;
    max: number;
    off?: { word: string; reads: false };
    fallback: number;
  };
  // One of a list of choices.
  choice: { choices: readonly string[]; fallback: string };
  // A colour that passes the app's colour check.
  color: Record<never, never>;
}

export type ResultModuleValueKind = keyof ResultModuleValueRules;

export type ResultModuleValueDefinition<
  Kind extends ResultModuleValueKind = ResultModuleValueKind,
> = { [Each in Kind]: { kind: Each } & ResultModuleValueRules[Each] }[Kind];

// What a saved value is read as, by the kind of its definition.
interface ResultModuleValueReadings<
  Definition extends ResultModuleValueDefinition = ResultModuleValueDefinition,
> {
  text: string | undefined;
  localizedText: string | undefined;
  number: Definition extends { kind: "number" }
    ? "off" extends keyof Definition
      ? number | false
      : number
    : never;
  choice: Definition extends { choices: readonly (infer Choice)[] }
    ? Choice
    : never;
  color: string | undefined;
}

// Reads a saved value by a definition of one kind. The value is absent when
// the record leaves the key out.
export type ResultModuleValueReader<Kind extends ResultModuleValueKind> = (
  definition: ResultModuleValueDefinition<Kind>,
  value?: ResultModuleValue,
) => ResultModuleValueReadings[Kind];

type ResultModuleValueDefinitions = typeof RESULT_MODULE_VALUE_DEFINITIONS;

export type ResultModuleKey = keyof ResultModuleValueDefinitions;

// Every key the app knows, as the app works with its value. Derived from the
// definitions: an entry there is a key here.
export type ResultModuleValues = {
  [Key in ResultModuleKey]: ResultModuleValueReadings<
    ResultModuleValueDefinitions[Key]
  >[ResultModuleValueDefinitions[Key]["kind"]];
};

// The keys a module type reads, and no other. Derived from the table of keys
// by type, one type at a time, so that a record whose type is not known has
// only the keys every type reads.
export type ResultModuleValuesOf<Type extends ResultModuleType> =
  Type extends ResultModuleType
    ? Pick<ResultModuleValues, (typeof RESULT_MODULE_KEYS)[Type][number]>
    : never;

export type ResultModuleSelection = ResultModuleValues["selection"];

export type ResultModuleGrouping = ResultModuleValues["groupBy"];

export type ResultModuleLowMatch = ResultModuleValues["lowMatch"];

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
      entries: ResolvedRankedEntry[]; // none = the selection left nothing, and the record has a text for that
      visibleRows: number;
      emptyLabel?: string;
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
  | {
      type: "archetype";
      entries: ResultEntry[];
      lowMatch: ResultModuleLowMatch;
    }
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
  lowMatch: ResultModuleLowMatch; // what the header does with it below a partial match
  lowMatchLabel?: string; // what it says under one it names all the same
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
// drawn. The record is of that type, so a resolver can ask for the keys of
// its type and for no other.
export type ModuleResolver<Type extends ResultModuleType = ResultModuleType> = (
  record: ResultModuleOf<Type>,
  context: ResolutionContext,
) => Extract<ResolvedModuleContent, { type: Type }> | undefined;

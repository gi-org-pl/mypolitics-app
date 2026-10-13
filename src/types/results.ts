import type { Orientation } from "@/types/orientation";

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

// The slots a module type has: the names its labels and its colours go by.
export interface ResultModuleSlots {
  labels: readonly string[];
  colors: readonly string[];
}

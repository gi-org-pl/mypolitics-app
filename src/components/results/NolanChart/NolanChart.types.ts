import type { AxisOrientation } from "@/types/axis";
import type { ResultEntry } from "@/types/results";

export type NolanLevel = "centre" | "moderate" | "extreme";

export type NolanPoleSide = "start" | "end";

export type NolanQuadrantKey =
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight";

export interface NolanLevelNames {
  moderate?: string;
  extreme?: string;
}

export interface NolanQuadrantNames extends NolanLevelNames {
  moderateShort?: string;
  extremeShort?: string;
}

export interface NolanPole {
  entry: ResultEntry;
  names?: NolanLevelNames;
}

export interface NolanAxis {
  name: string;
  start: NolanPole;
  end: NolanPole;
}

export interface NolanQuadrant {
  color?: string;
  names?: NolanQuadrantNames;
}

export type NolanQuadrants = Record<NolanQuadrantKey, NolanQuadrant>;

export interface NolanAxisValues {
  start?: number;
  end?: number;
}

export interface NolanComparison {
  party: AxisOrientation;
  horizontal: NolanAxisValues;
  vertical: NolanAxisValues;
}

export interface NolanAxisLevel {
  level: NolanLevel;
  pole: NolanPoleSide;
}

export interface NolanPosition {
  x: number;
  y: number;
  r: number;
  level: NolanLevel;
  quadrant: NolanQuadrantKey;
  poles: { horizontal: NolanPoleSide; vertical: NolanPoleSide };
}

export interface NolanName {
  name: string;
  shortName: string;
}

export interface NolanTitle extends NolanName {
  look: "plain" | "moderate" | "extreme";
  color?: string;
}

export interface NolanChartProps {
  horizontal: NolanAxis;
  vertical: NolanAxis;
  quadrants: NolanQuadrants;
  centreName?: string;
  comparison?: NolanComparison;
  onStatsClick?: () => void;
  onInfoClick?: () => void;
}

import type { Orientation } from "@/types/orientation";
import type {
  NolanAxisValues,
  NolanLevel,
  NolanPoleSide,
  NolanQuadrantKey,
  ResultEntry,
} from "@/types/results";

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

export interface NolanComparison {
  orientation: Orientation;
  horizontal: NolanAxisValues;
  vertical: NolanAxisValues;
}

export interface NolanAxisLevel {
  level: NolanLevel;
  pole: NolanPoleSide;
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

import type { Orientation } from "@/types/orientation";

export interface AxisEntry {
  orientation: Orientation;
  value?: number;
}

export interface AxisLayoutInput {
  start?: AxisEntry;
  end?: AxisEntry;
  comparison?: AxisEntry;
  marker?: number | false;
  showValues?: boolean; // default true. false = no number is drawn on or next to any fill
}

export type AxisMode = "empty" | "one-sided" | "double-sided";

export type AxisValuePlacement = "inside" | "outside" | "hidden";

export interface AxisSideLayout {
  name: string;
  imageUrl?: string;
  color?: string;
  hasValue: boolean;
  value: number;
  displayValue: number;
  width: number;
  valuePlacement: AxisValuePlacement;
}

export interface AxisBand {
  from: number;
  to: number;
}

export interface AxisComparisonLayout {
  name: string;
  imageUrl?: string;
  color?: string;
  value: number;
  displayValue: number;
  position: number;
  band: AxisBand | null;
}

export interface AxisLayout {
  mode: AxisMode;
  start: AxisSideLayout | null;
  end: AxisSideLayout | null;
  marker: number | null;
  comparison: AxisComparisonLayout | null;
}

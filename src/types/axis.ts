export interface AxisOrientation {
  id: string;
  name: string;
  imageUrl?: string;
  color?: string;
}

export interface AxisEntry {
  orientation: AxisOrientation;
  value?: number;
}

export interface AxisLayoutInput {
  start?: AxisEntry;
  end?: AxisEntry;
  comparison?: AxisEntry;
  marker?: number | false;
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

import type { AxisOrientation } from "@/types/axis";

export interface ResultEntry {
  orientation: AxisOrientation;
  value?: number;
}

export interface RankedComparison {
  party: AxisOrientation;
  values: Record<string, number>;
}

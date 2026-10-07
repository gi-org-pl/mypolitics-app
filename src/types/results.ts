import type { Orientation } from "@/types/orientation";

export interface ResultEntry {
  orientation: Orientation;
  value?: number;
}

export interface RankedComparison {
  orientation: Orientation;
  values: Record<string, number>;
}

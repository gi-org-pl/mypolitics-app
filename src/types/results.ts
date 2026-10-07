import type { AxisOrientation } from "@/components/shared/UniversalAxis/UniversalAxis.types";

export interface RankedComparison {
  party: AxisOrientation;
  values: Record<string, number>;
}

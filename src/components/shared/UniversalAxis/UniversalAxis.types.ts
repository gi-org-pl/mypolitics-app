import type { AxisLayoutInput } from "@/types/axis";

export interface UniversalAxisProps extends AxisLayoutInput {
  showLabels?: boolean;
  description?: string; // replaces the description the bar writes for itself. Passed translated. Blank = the bar's own
}

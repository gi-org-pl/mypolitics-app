import { DEFAULT_MARKER_POSITION } from "@/constants/axis";
import type { AxisEntry, AxisLayoutInput } from "@/types/axis";
import { getAxisLayout } from "@/utils/axis/getAxisLayout";

export const isAxisEmphasised = (
  entry: AxisEntry,
  marker?: AxisLayoutInput["marker"],
): boolean => {
  const layout = getAxisLayout({ start: entry, marker });
  const emphasisLine = layout.marker ?? DEFAULT_MARKER_POSITION;

  return layout.start?.hasValue === true && layout.start.value >= emphasisLine;
};

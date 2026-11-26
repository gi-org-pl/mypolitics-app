import type { NolanAxis } from "@/components/results/NolanChart/NolanChart.types";
import type { ResolvedAxis } from "@/types/results";

import type { NolanAxisDirection } from "../ModuleDrawing.types";

// An axis of the map: its name, and its two poles, each with the names of a
// lean towards it. Those names are the labels of the record, by slot:
// "<direction><Start|End><Moderate|Extreme>". A slot that is missing leaves
// the map to its own wording.
export const toNolanAxis = (
  { name, start, end }: ResolvedAxis,
  direction: NolanAxisDirection,
  labels: Record<string, string>,
): NolanAxis => ({
  name: name ?? "",
  start: {
    entry: start,
    names: {
      moderate: labels[`${direction}StartModerate`],
      extreme: labels[`${direction}StartExtreme`],
    },
  },
  end: {
    entry: end,
    names: {
      moderate: labels[`${direction}EndModerate`],
      extreme: labels[`${direction}EndExtreme`],
    },
  },
});

import { getSafeColor } from "@/utils/color/getSafeColor";

import type { AxisGroup } from "../MultiAxisChart.types";
import { withPoleColor } from "./withPoleColor";

// A group in its colours: a pole that has no colour of its own takes the
// colour of the same pole of the group's headline axis, so the narrower axes
// behind a headline read as one group with it. A pole with a colour keeps it,
// and where the headline has none the pole stays without one. Quizzes in use
// give a colour only to the two ideologies of each category's main axis.
export const withGroupColors = (group: AxisGroup): AxisGroup => {
  const [headline, ...otherAxes] = group.axes;
  const startColor = getSafeColor(headline?.start?.orientation?.color);
  const endColor = getSafeColor(headline?.end?.orientation?.color);

  return {
    ...group,
    axes: [
      headline,
      ...otherAxes.map((axis) => ({
        ...axis,
        start: withPoleColor(axis.start, startColor),
        end: withPoleColor(axis.end, endColor),
      })),
    ],
  };
};

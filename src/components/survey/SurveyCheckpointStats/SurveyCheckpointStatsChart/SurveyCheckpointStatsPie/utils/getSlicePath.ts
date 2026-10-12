import type { StatsSlice } from "../../../SurveyCheckpointStats.types";
import { PIE_RADIUS, PIE_SIZE } from "../SurveyCheckpointStatsPie.constants";

const FULL_TURN = 2 * Math.PI;
const HALF = 0.5;
const DECIMALS = 2;

// The shape of a slice as an SVG path: from the centre to the edge at the
// share the slice starts at, along the edge clockwise to the share it ends
// at, and back. A share of 0 is the top of the circle. A slice that is the
// whole circle has no way back to the centre: it is the circle itself, drawn
// as two half turns.
export const getSlicePath = ({
  from,
  to,
}: Pick<StatsSlice, "from" | "to">): string => {
  const radius = PIE_RADIUS;

  if (to - from >= 1) {
    return `M ${radius} 0 A ${radius} ${radius} 0 1 1 ${radius} ${PIE_SIZE} A ${radius} ${radius} 0 1 1 ${radius} 0 Z`;
  }

  const [start, end] = [from, to].map((share) => {
    const angle = share * FULL_TURN;
    const x = radius + radius * Math.sin(angle);
    const y = radius - radius * Math.cos(angle);

    return `${Number(x.toFixed(DECIMALS))} ${Number(y.toFixed(DECIMALS))}`;
  });
  const isLargeArc = to - from > HALF ? 1 : 0;

  return `M ${radius} ${radius} L ${start} A ${radius} ${radius} 0 ${isLargeArc} 1 ${end} Z`;
};

import { MAX_AXIS_VALUE } from "@/constants/axis";
import type { ScoreTotal } from "@/types/checkpoint";

// Points as a share of the maximum, 0 to 100, never rounded. There is no
// value while the maximum is zero.
export const getScoreValue = ({
  points,
  maximum,
}: ScoreTotal): number | undefined =>
  maximum > 0 ? (points / maximum) * MAX_AXIS_VALUE : undefined;

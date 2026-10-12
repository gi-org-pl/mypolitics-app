import { STATS_SLICE_COLOR_CLASS_NAMES } from "../../SurveyCheckpointStats.constants";
import {
  PIE_GAP_WIDTH,
  PIE_VIEW_BOX,
} from "./SurveyCheckpointStatsPie.constants";
import type { SurveyCheckpointStatsPieProps } from "./SurveyCheckpointStatsPie.types";
import { getSlicePath } from "./utils/getSlicePath";

// The pie: one shape per slice, clockwise from the top in the order given,
// set apart by a thin line in the colour of the panel. It is one image with a
// description in words, and nothing in it can be focused or pressed. It
// carries no number and marks no slice: which side is the taker's is said by
// the statement, never by colour.
export const SurveyCheckpointStatsPie = ({
  slices,
  description,
}: SurveyCheckpointStatsPieProps) => (
  <svg
    role="img"
    aria-label={description}
    viewBox={PIE_VIEW_BOX}
    strokeWidth={PIE_GAP_WIDTH}
    strokeLinejoin="round"
    className="size-24 shrink-0 stroke-background"
  >
    {slices.map((slice) => (
      <path
        key={slice.id}
        d={getSlicePath(slice)}
        className={`fill-current ${STATS_SLICE_COLOR_CLASS_NAMES[slice.id]}`}
      />
    ))}
  </svg>
);

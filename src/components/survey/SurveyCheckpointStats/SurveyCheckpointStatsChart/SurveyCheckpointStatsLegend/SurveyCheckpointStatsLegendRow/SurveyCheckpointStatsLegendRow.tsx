import { STATS_SLICE_COLOR_CLASS_NAMES } from "../../../SurveyCheckpointStats.constants";
import type { SurveyCheckpointStatsLegendRowProps } from "./SurveyCheckpointStatsLegendRow.types";

// One row of the legend: a dot in the colour of its slice and the name of the
// slice. The dot is decoration; the name carries the meaning. A name that
// does not fit on one line wraps and is never cut.
export const SurveyCheckpointStatsLegendRow = ({
  id,
  name,
}: SurveyCheckpointStatsLegendRowProps) => (
  <li className="flex min-w-0 items-center gap-2">
    <span
      aria-hidden="true"
      className={`size-4 shrink-0 rounded-full bg-current ${STATS_SLICE_COLOR_CLASS_NAMES[id]}`}
    />
    <span className="min-w-0 text-base leading-none font-bold wrap-break-word text-gi-primary">
      {name}
    </span>
  </li>
);

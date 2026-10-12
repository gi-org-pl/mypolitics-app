import { useLingui } from "@lingui/react/macro";

import type { StatsSliceNames } from "../SurveyCheckpointStats.types";

// The names of the three slices in the active language.
export const useStatsSliceNames = (): StatsSliceNames => {
  const { t } = useLingui();

  return {
    for: t`Za`,
    against: t`Przeciw`,
    noAnswer: t`Brak odpowiedzi`,
  };
};

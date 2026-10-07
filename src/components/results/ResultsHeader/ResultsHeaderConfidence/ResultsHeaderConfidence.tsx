import { useLingui } from "@lingui/react/macro";

import { BAND_CLASS_NAME } from "../ResultsHeader.constants";
import type { ResultsHeaderBand } from "../ResultsHeader.types";

interface ResultsHeaderConfidenceProps {
  confidence: number;
  band: ResultsHeaderBand;
}

export const ResultsHeaderConfidence = ({
  confidence,
  band,
}: ResultsHeaderConfidenceProps) => {
  const { t } = useLingui();
  const value = Math.round(confidence);

  return (
    <p
      data-testid="results-header-confidence"
      className={`text-sm leading-[1.5] font-bold ${BAND_CLASS_NAME[band]}`}
    >
      {t`${value}% pewności`}
    </p>
  );
};

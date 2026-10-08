import { ProgressBar } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";

import { BAR_CLASS_NAME } from "./SurveySaturatedProgressBar.constants";
import type { SurveySaturatedProgressBarProps } from "./SurveySaturatedProgressBar.types";
import { getProgressPercent } from "./utils/getProgressPercent";
import { getSaturatedPercentValue } from "./utils/getSaturatedPercentValue";
import { useValueFlash } from "./utils/useValueFlash";

export function SurveySaturatedProgressBar({
  value,
  maxValue,
}: SurveySaturatedProgressBarProps) {
  const { t } = useLingui();
  const shownValue = getSaturatedPercentValue(
    getProgressPercent(value, maxValue),
  );
  const isFlashing = useValueFlash(shownValue);

  return (
    <div
      className={`w-full transition-opacity motion-reduce:transition-none ${
        isFlashing ? "motion-safe:opacity-75" : "opacity-100"
      }`}
    >
      <ProgressBar
        size="small"
        variant="default"
        value={shownValue}
        aria-label={t`Postęp quizu`}
        aria-valuenow={Math.round(shownValue)}
        className={BAR_CLASS_NAME}
      />
    </div>
  );
}

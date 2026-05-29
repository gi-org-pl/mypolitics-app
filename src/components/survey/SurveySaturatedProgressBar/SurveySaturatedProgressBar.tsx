import { ProgressBar } from "@gi/athena";
import { useLayoutEffect, useState } from "react";
import { BAR_ANIMATION_MS } from "./SurveySaturatedProgressBar.constants";
import type { SurveySaturatedProgressBarProps } from "./SurveySaturatedProgressBar.types";
import { getSaturatedPercentValue } from "./utils/getSaturatedPercentValue";

export function SurveySaturatedProgressBar({
  value,
  maxValue,
}: SurveySaturatedProgressBarProps) {
  const [flash, setFlash] = useState(false);

  const rawPercent = maxValue === 0 ? 0 : (value / maxValue) * 100; // if else
  const saturatedPercentValue = getSaturatedPercentValue(rawPercent);

  useLayoutEffect(() => {
    setFlash(true);

    const timeout = setTimeout(() => {
      setFlash(false);
    }, BAR_ANIMATION_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, [saturatedPercentValue]);

  return (
    <div
      className={
        flash
          ? "opacity-75 transition-opacity"
          : "opacity-100 transition-opacity"
      }
    >
      <ProgressBar
        size="regular"
        value={saturatedPercentValue}
        variant="default"
      />
    </div>
  );
}

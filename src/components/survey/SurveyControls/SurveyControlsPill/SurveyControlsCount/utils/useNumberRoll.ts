import { useEffect, useState } from "react";

import { NUMBER_ANIMATION_MS } from "../../../SurveyControls.constants";
import type { NumberRoll } from "../../../SurveyControls.types";

export const useNumberRoll = (value: number): NumberRoll => {
  const [roll, setRoll] = useState<NumberRoll>({ value, direction: "down" });

  if (!Object.is(roll.value, value)) {
    setRoll({
      value,
      previousValue: roll.value,
      direction: value < roll.value ? "down" : "up",
    });
  }

  useEffect(() => {
    if (roll.previousValue === undefined) {
      return;
    }

    const timer = setTimeout(() => {
      setRoll({ value: roll.value, direction: roll.direction });
    }, NUMBER_ANIMATION_MS);

    return () => clearTimeout(timer);
  }, [roll]);

  return roll;
};

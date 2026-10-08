import { useEffect, useState } from "react";

import { BAR_ANIMATION_MS } from "../SurveySaturatedProgressBar.constants";

// Whether the bar is flashing: on from a change of the value for the length
// of one flash, counted from the last change. The first value is not a
// change, so a bar that appears does not flash.
export const useValueFlash = (value: number): boolean => {
  const [flash, setFlash] = useState({ value, isOn: false });

  if (!Object.is(flash.value, value)) {
    setFlash({ value, isOn: true });
  }

  useEffect(() => {
    if (!flash.isOn) return;

    const timeout = setTimeout(
      () => setFlash({ value: flash.value, isOn: false }),
      BAR_ANIMATION_MS,
    );

    return () => clearTimeout(timeout);
  }, [flash]);

  return flash.isOn;
};

import { useEffect, useRef, useState } from "react";
import { NUMBER_ANIMATION_MS } from "../SurveyControls.constants";

/**
 * Returns `isAnimating` — true for NUMBER_ANIMATION_MS after `value` changes.
 * Use it to apply a CSS flash/tick class on the animated element.
 */
export function useAnimatedNumber(value: number): boolean {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef<number>(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevValueRef.current === value) return;
    prevValueRef.current = value;

    setIsAnimating(true);

    timerRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, NUMBER_ANIMATION_MS);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return isAnimating;
}

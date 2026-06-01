import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NUMBER_ANIMATION_MS } from "../SurveyControls.constants";
import { useAnimatedNumber } from "./useAnimatedNumber";

describe("useAnimatedNumber()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("when value changes", () => {
    it("triggers the animation flag for NUMBER_ANIMATION_MS milliseconds", () => {
      const { result, rerender } = renderHook(
        ({ value }) => useAnimatedNumber(value),
        { initialProps: { value: 5 } },
      );

      expect(result.current).toBe(false);

      act(() => {
        rerender({ value: 4 });
      });

      expect(result.current).toBe(true);
    });

    it("clears the animation flag after the timeout", () => {
      const { result, rerender } = renderHook(
        ({ value }) => useAnimatedNumber(value),
        { initialProps: { value: 5 } },
      );

      act(() => {
        rerender({ value: 4 });
      });

      expect(result.current).toBe(true);

      act(() => {
        vi.advanceTimersByTime(NUMBER_ANIMATION_MS);
      });

      expect(result.current).toBe(false);
    });

    it("cancels the timeout on unmount (no state update after unmount)", () => {
      const { result, rerender, unmount } = renderHook(
        ({ value }) => useAnimatedNumber(value),
        { initialProps: { value: 5 } },
      );

      act(() => {
        rerender({ value: 4 });
      });

      expect(result.current).toBe(true);

      // Unmount before the timer fires — should not throw "setState on unmounted"
      unmount();

      // Advancing time should not cause errors
      expect(() => {
        act(() => {
          vi.advanceTimersByTime(NUMBER_ANIMATION_MS);
        });
      }).not.toThrow();
    });
  });

  describe("when value does not change", () => {
    it("does not trigger the animation flag", () => {
      const { result, rerender } = renderHook(
        ({ value }) => useAnimatedNumber(value),
        { initialProps: { value: 5 } },
      );

      act(() => {
        rerender({ value: 5 }); // same value
      });

      expect(result.current).toBe(false);
    });
  });
});

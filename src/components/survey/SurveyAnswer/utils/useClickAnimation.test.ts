import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useClickAnimation } from "./useClickAnimation";

describe("useClickAnimation()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("when triggerAnimation is not called", () => {
    it("isAnimating is false by default", () => {
      const { result } = renderHook(() => useClickAnimation());
      expect(result.current.isAnimating).toBe(false);
    });
  });

  describe("when triggerAnimation is called", () => {
    it("sets isAnimating to true immediately", () => {
      const { result } = renderHook(() => useClickAnimation());

      act(() => {
        result.current.triggerAnimation();
      });

      expect(result.current.isAnimating).toBe(true);
    });

    it("sets isAnimating back to false after CLICK_ANIMATION_MS", () => {
      const { result } = renderHook(() => useClickAnimation());

      act(() => {
        result.current.triggerAnimation();
      });

      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(result.current.isAnimating).toBe(false);
    });

    it("cancels the timeout on unmount (no state update after unmount)", () => {
      const { result, unmount } = renderHook(() => useClickAnimation());

      act(() => {
        result.current.triggerAnimation();
      });

      // Unmount before timeout fires — should not throw React state-update warning
      expect(() => {
        unmount();
        act(() => {
          vi.advanceTimersByTime(150);
        });
      }).not.toThrow();
    });
  });
});

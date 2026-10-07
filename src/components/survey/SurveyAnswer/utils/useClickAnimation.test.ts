import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CLICK_ANIMATION_MS } from "../SurveyAnswer.constants";
import { useClickAnimation } from "./useClickAnimation";

describe("useClickAnimation()", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        "setTimeout",
        "clearTimeout",
        "requestAnimationFrame",
        "cancelAnimationFrame",
      ],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("when triggerAnimation is not called", () => {
    it("animationPhase is false by default", () => {
      const { result } = renderHook(() => useClickAnimation());
      expect(result.current.animationPhase).toBe(false);
    });

    it("returns buttonRef and iconRef as refs", () => {
      const { result } = renderHook(() => useClickAnimation());
      expect(result.current.buttonRef).toBeDefined();
      expect(result.current.iconRef).toBeDefined();
    });

    it("returns initial style with zero size and centered origin", () => {
      const { result } = renderHook(() => useClickAnimation());
      expect(result.current.style["--cx"]).toBe("50%");
      expect(result.current.style["--cy"]).toBe("50%");
      expect(result.current.style["--size"]).toBe("0px");
    });
  });

  describe("when triggerAnimation is called", () => {
    it("sets animationPhase to 'expanding' after a rAF tick", async () => {
      const { result } = renderHook(() => useClickAnimation());

      act(() => {
        result.current.triggerAnimation();
      });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.animationPhase).toBe("expanding");
    });
  });

  describe("when handleRippleTransitionEnd is called during 'expanding' phase", () => {
    it("transitions animationPhase to 'fading'", async () => {
      const { result } = renderHook(() => useClickAnimation());

      act(() => {
        result.current.triggerAnimation();
      });
      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.handleRippleTransitionEnd();
      });

      act(() => {
        vi.advanceTimersByTime(CLICK_ANIMATION_MS);
      });

      expect(result.current.animationPhase).toBe("fading");
    });

    it("sets animationPhase back to false after RIPPLE_FADE_MS", async () => {
      const { result } = renderHook(() => useClickAnimation());

      act(() => {
        result.current.triggerAnimation();
      });

      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.handleRippleTransitionEnd();
      });

      act(() => {
        vi.runAllTimers();
      });

      expect(result.current.animationPhase).toBe(false);
    });
  });

  describe("when handleRippleTransitionEnd is called outside 'expanding' phase", () => {
    it("does not change animationPhase when phase is false", () => {
      const { result } = renderHook(() => useClickAnimation());

      act(() => {
        result.current.handleRippleTransitionEnd();
      });

      expect(result.current.animationPhase).toBe(false);
    });
  });

  describe("cleanup on unmount", () => {
    it("does not throw when unmounted during fading timeout", async () => {
      const { result, unmount } = renderHook(() => useClickAnimation());

      act(() => {
        result.current.triggerAnimation();
      });

      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.handleRippleTransitionEnd();
      });

      expect(() => {
        unmount();
        act(() => {
          vi.runAllTimers();
        });
      }).not.toThrow();
    });
  });
});

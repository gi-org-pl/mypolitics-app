import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LOGO_ANIMATION_MS, LOGO_REST_PIECES } from "../HeaderLogo.constants";
import { getLogoFrame } from "./getLogoFrame";
import { useLogoAnimation } from "./useLogoAnimation";

const FRAME_MS = 16;

type Props = { playId?: string };

const stubReducedMotion = (matches: boolean) => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches })),
  );
};

const advance = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

const renderAnimation = (playId?: string) =>
  renderHook(({ playId: id }: Props) => useLogoAnimation(id), {
    initialProps: { playId } as Props,
  });

describe("useLogoAnimation()", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"],
    });
    stubReducedMotion(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe("given no visit to play", () => {
    it("leaves the pieces at rest", () => {
      const { result } = renderAnimation();

      advance(LOGO_ANIMATION_MS);

      expect(result.current).toEqual({
        pieces: LOGO_REST_PIECES,
        isPlaying: false,
      });
    });
  });

  describe("given a visit to play", () => {
    it("is at rest on the first render", () => {
      const { result } = renderAnimation("home");

      expect(result.current.pieces).toBe(LOGO_REST_PIECES);
    });

    it("draws the frames of the animation after mount", () => {
      const { result } = renderAnimation("home");

      advance(FRAME_MS);
      advance(500);

      expect(result.current.isPlaying).toBe(true);
      expect(result.current.pieces).not.toEqual(getLogoFrame(0));
    });

    it("ends on the pieces at rest, the very constants of the brand file", () => {
      const { result } = renderAnimation("home");

      advance(LOGO_ANIMATION_MS + 5 * FRAME_MS);

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.pieces).toBe(LOGO_REST_PIECES);
    });
  });

  describe("given a person who asked for reduced motion", () => {
    it("never moves", () => {
      stubReducedMotion(true);

      const { result } = renderAnimation("home");

      for (let elapsed = 0; elapsed < LOGO_ANIMATION_MS; elapsed += 100) {
        advance(100);
        expect(result.current.isPlaying).toBe(false);
      }
    });
  });

  describe("given other visits while the animation plays", () => {
    it("neither starts it again nor stops it", () => {
      const { result, rerender } = renderAnimation("home");

      advance(FRAME_MS);
      advance(1000);
      rerender({ playId: undefined });
      advance(100);
      expect(result.current.isPlaying).toBe(true);

      rerender({ playId: "quiz" });
      advance(LOGO_ANIMATION_MS - 1100 + 2 * FRAME_MS);

      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe("given a new visit after the animation ended", () => {
    it("plays it again", () => {
      const { result, rerender } = renderAnimation("home");

      advance(LOGO_ANIMATION_MS + 5 * FRAME_MS);
      rerender({ playId: undefined });
      rerender({ playId: "quiz" });
      advance(FRAME_MS);
      advance(300);

      expect(result.current.isPlaying).toBe(true);
    });
  });

  describe("when unmounted while playing", () => {
    it("stops asking for frames", () => {
      const { unmount } = renderAnimation("home");

      advance(FRAME_MS);
      unmount();

      expect(vi.getTimerCount()).toBe(0);
    });
  });
});

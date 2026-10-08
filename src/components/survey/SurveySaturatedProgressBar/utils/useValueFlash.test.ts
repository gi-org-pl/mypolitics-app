import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BAR_ANIMATION_MS } from "../SurveySaturatedProgressBar.constants";
import { useValueFlash } from "./useValueFlash";

const renderFlash = (value: number) =>
  renderHook(({ shownValue }) => useValueFlash(shownValue), {
    initialProps: { shownValue: value },
  });

describe("useValueFlash()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("on first render", () => {
    it("is off, and stays off", () => {
      const { result } = renderFlash(10);

      expect(result.current).toBe(false);

      act(() => vi.advanceTimersByTime(BAR_ANIMATION_MS));

      expect(result.current).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe("when the value changes", () => {
    it("is on at once and off after one flash", () => {
      const { result, rerender } = renderFlash(10);

      rerender({ shownValue: 20 });

      expect(result.current).toBe(true);

      act(() => vi.advanceTimersByTime(BAR_ANIMATION_MS - 1));

      expect(result.current).toBe(true);

      act(() => vi.advanceTimersByTime(1));

      expect(result.current).toBe(false);
    });
  });

  describe("when the value changes again during a flash", () => {
    it("ends one flash after the last change", () => {
      const { result, rerender } = renderFlash(10);

      rerender({ shownValue: 20 });
      act(() => vi.advanceTimersByTime(BAR_ANIMATION_MS - 100));
      rerender({ shownValue: 30 });
      act(() => vi.advanceTimersByTime(BAR_ANIMATION_MS - 1));

      expect(result.current).toBe(true);

      act(() => vi.advanceTimersByTime(1));

      expect(result.current).toBe(false);
    });
  });

  describe("when it is rendered again with the same value", () => {
    it("stays off, also for a value that is not a number", () => {
      const { result, rerender } = renderFlash(Number.NaN);

      rerender({ shownValue: Number.NaN });

      expect(result.current).toBe(false);
    });
  });

  describe("when unmounted during a flash", () => {
    it("leaves no timer running", () => {
      const { rerender, unmount } = renderFlash(10);

      rerender({ shownValue: 20 });
      unmount();

      expect(vi.getTimerCount()).toBe(0);
    });
  });
});

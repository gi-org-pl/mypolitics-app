import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NUMBER_ANIMATION_MS } from "../../../SurveyControls.constants";
import { useNumberRoll } from "./useNumberRoll";

const renderRoll = (initialValue: number) =>
  renderHook(({ value }) => useNumberRoll(value), {
    initialProps: { value: initialValue },
  });

describe("useNumberRoll()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("on first render", () => {
    it("returns the value with nothing leaving", () => {
      const { result } = renderRoll(30);

      expect(result.current.value).toBe(30);
      expect(result.current.previousValue).toBeUndefined();
    });

    it("starts no timer", () => {
      renderRoll(30);

      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe("when rendered again with the same value", () => {
    it("keeps nothing leaving", () => {
      const { result, rerender } = renderRoll(30);

      rerender({ value: 30 });

      expect(result.current.previousValue).toBeUndefined();
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe("when the value goes down", () => {
    it("returns the new value, the old one as leaving and the direction down", () => {
      const { result, rerender } = renderRoll(30);

      rerender({ value: 29 });

      expect(result.current).toEqual({
        value: 29,
        previousValue: 30,
        direction: "down",
      });
    });

    it("keeps the old value until the duration has passed", () => {
      const { result, rerender } = renderRoll(30);

      rerender({ value: 29 });
      act(() => {
        vi.advanceTimersByTime(NUMBER_ANIMATION_MS - 1);
      });

      expect(result.current.previousValue).toBe(30);
    });

    it("drops the old value once the duration has passed", () => {
      const { result, rerender } = renderRoll(30);

      rerender({ value: 29 });
      act(() => {
        vi.advanceTimersByTime(NUMBER_ANIMATION_MS);
      });

      expect(result.current.value).toBe(29);
      expect(result.current.previousValue).toBeUndefined();
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe("when the value goes up", () => {
    it("returns the direction up", () => {
      const { result, rerender } = renderRoll(29);

      rerender({ value: 30 });

      expect(result.current).toEqual({
        value: 30,
        previousValue: 29,
        direction: "up",
      });
    });
  });

  describe("when the value changes again mid-animation", () => {
    it("rolls from the value shown last to the latest one", () => {
      const { result, rerender } = renderRoll(30);

      rerender({ value: 29 });
      act(() => {
        vi.advanceTimersByTime(NUMBER_ANIMATION_MS / 2);
      });
      rerender({ value: 28 });

      expect(result.current).toEqual({
        value: 28,
        previousValue: 29,
        direction: "down",
      });
    });

    it("restarts the duration and ends on the latest value", () => {
      const { result, rerender } = renderRoll(30);

      rerender({ value: 29 });
      act(() => {
        vi.advanceTimersByTime(NUMBER_ANIMATION_MS / 2);
      });
      rerender({ value: 28 });
      act(() => {
        vi.advanceTimersByTime(NUMBER_ANIMATION_MS - 1);
      });

      expect(result.current.previousValue).toBe(29);
      expect(vi.getTimerCount()).toBe(1);

      act(() => {
        vi.advanceTimersByTime(1);
      });

      expect(result.current.value).toBe(28);
      expect(result.current.previousValue).toBeUndefined();
    });
  });

  describe("when unmounted mid-animation", () => {
    it("leaves no timer running", () => {
      const { rerender, unmount } = renderRoll(30);

      rerender({ value: 29 });
      expect(vi.getTimerCount()).toBe(1);

      unmount();

      expect(vi.getTimerCount()).toBe(0);
    });
  });
});

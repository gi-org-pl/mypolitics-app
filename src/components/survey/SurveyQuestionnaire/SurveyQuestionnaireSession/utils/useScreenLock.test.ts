import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  CONTENT_CHANGE_MS,
  SCREEN_LOCK_LIMIT_MS,
} from "../SurveyQuestionnaireSession.constants";
import { useScreenLock } from "./useScreenLock";

const renderLock = (contentKey = "first") =>
  renderHook(({ shownKey }) => useScreenLock(shownKey), {
    initialProps: { shownKey: contentKey },
  });

describe("useScreenLock()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("when the screen appears", () => {
    it("is open, with no timer running", () => {
      const { result } = renderLock();

      expect(result.current.isLocked).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe("when lock() is called", () => {
    it("is locked from lock() until the content has changed", () => {
      const { result, rerender } = renderLock();

      act(() => result.current.lock());

      expect(result.current.isLocked).toBe(true);

      act(() => vi.advanceTimersByTime(SCREEN_LOCK_LIMIT_MS - 1));
      rerender({ shownKey: "second" });

      expect(result.current.isLocked).toBe(true);

      act(() => vi.advanceTimersByTime(CONTENT_CHANGE_MS - 1));

      expect(result.current.isLocked).toBe(true);

      act(() => vi.advanceTimersByTime(1));

      expect(result.current.isLocked).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
    });

    it("releases itself after the time limit", () => {
      const { result } = renderLock();

      act(() => result.current.lock());
      act(() => vi.advanceTimersByTime(SCREEN_LOCK_LIMIT_MS - 1));

      expect(result.current.isLocked).toBe(true);

      act(() => vi.advanceTimersByTime(1));

      expect(result.current.isLocked).toBe(false);
    });

    it("keeps the first lock when called again", () => {
      const { result } = renderLock();

      act(() => result.current.lock());
      act(() => vi.advanceTimersByTime(SCREEN_LOCK_LIMIT_MS - 1));
      act(() => result.current.lock());
      act(() => vi.advanceTimersByTime(1));

      expect(result.current.isLocked).toBe(false);
    });

    it("keeps the same function between renders", () => {
      const { result, rerender } = renderLock();
      const { lock } = result.current;

      act(() => lock());
      rerender({ shownKey: "second" });

      expect(result.current.lock).toBe(lock);
    });
  });

  describe("when the content changes", () => {
    it("is locked at once, until the new content is there", () => {
      const { result, rerender } = renderLock();

      rerender({ shownKey: "second" });

      expect(result.current.isLocked).toBe(true);

      act(() => vi.advanceTimersByTime(CONTENT_CHANGE_MS - 1));

      expect(result.current.isLocked).toBe(true);

      act(() => vi.advanceTimersByTime(1));

      expect(result.current.isLocked).toBe(false);
    });

    it("counts from the last change when the content changes again", () => {
      const { result, rerender } = renderLock();

      rerender({ shownKey: "second" });
      act(() => vi.advanceTimersByTime(CONTENT_CHANGE_MS - 1));
      rerender({ shownKey: "third" });
      act(() => vi.advanceTimersByTime(CONTENT_CHANGE_MS - 1));

      expect(result.current.isLocked).toBe(true);

      act(() => vi.advanceTimersByTime(1));

      expect(result.current.isLocked).toBe(false);
    });

    it("is not held longer by a lock() called during the change", () => {
      const { result, rerender } = renderLock();

      rerender({ shownKey: "second" });
      act(() => result.current.lock());
      act(() => vi.advanceTimersByTime(CONTENT_CHANGE_MS));

      expect(result.current.isLocked).toBe(false);
    });
  });

  describe("when unmounted while locked", () => {
    it("leaves no timer running after unmount", () => {
      const { result, unmount } = renderLock();

      act(() => result.current.lock());

      expect(vi.getTimerCount()).toBe(1);

      unmount();

      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe("the durations", () => {
    it("never change the content for longer than an answer is acknowledged", () => {
      expect(CONTENT_CHANGE_MS).toBeLessThanOrEqual(300);
      expect(SCREEN_LOCK_LIMIT_MS).toBeGreaterThan(300);
    });
  });
});

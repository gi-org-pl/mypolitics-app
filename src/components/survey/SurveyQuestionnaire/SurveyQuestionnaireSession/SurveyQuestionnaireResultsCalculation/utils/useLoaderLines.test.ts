import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  LINE_INTERVAL_MS,
  MAX_LINES,
  MIN_LINES,
} from "../SurveyQuestionnaireResultsCalculation.constants";
import { useLoaderLines } from "./useLoaderLines";

// An order longer than a run can show.
const ORDER = Array.from({ length: 12 }, (_, index) => `Linia ${index + 1}`);

const renderLines = (order: readonly string[] = ORDER, firstRun = 0) =>
  renderHook(({ run }) => useLoaderLines(order, run), {
    initialProps: { run: firstRun },
  });

// The time of `count` lines, one line at a time: the next line is timed only
// once the one before has arrived.
const passLines = (count: number, shortBy = 0) => {
  for (let line = 1; line <= count; line += 1) {
    act(() =>
      vi.advanceTimersByTime(LINE_INTERVAL_MS - (line === count ? shortBy : 0)),
    );
  }
};

describe("useLoaderLines()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("when a run starts", () => {
    it("shows the first line at once", () => {
      const { result } = renderLines();

      expect(result.current.lines).toEqual(["Linia 1"]);
      expect(result.current.hasStayedLongEnough).toBe(false);
    });
  });

  describe("when time passes", () => {
    it("adds a line every LINE_INTERVAL_MS", () => {
      const { result } = renderLines();

      passLines(1, 1);

      expect(result.current.lines).toEqual(["Linia 1"]);

      act(() => vi.advanceTimersByTime(1));

      expect(LINE_INTERVAL_MS).toBe(1200);
      expect(result.current.lines).toEqual(["Linia 1", "Linia 2"]);

      passLines(1);

      expect(result.current.lines).toEqual(["Linia 1", "Linia 2", "Linia 3"]);
    });

    it("takes no line twice", () => {
      const { result } = renderLines();

      passLines(MAX_LINES);

      expect(new Set(result.current.lines).size).toBe(
        result.current.lines.length,
      );
    });

    it("stops at MAX_LINES", () => {
      const { result } = renderLines();

      passLines(MAX_LINES - 1);

      expect(MAX_LINES).toBe(8);
      expect(result.current.lines).toEqual(ORDER.slice(0, MAX_LINES));

      passLines(20);

      expect(result.current.lines).toEqual(ORDER.slice(0, MAX_LINES));
      expect(vi.getTimerCount()).toBe(0);
    });

    it("has stayed long enough after MIN_LINES lines have had their time", () => {
      const { result } = renderLines();

      passLines(MIN_LINES, 1);

      expect(result.current.lines).toHaveLength(MIN_LINES);
      expect(result.current.hasStayedLongEnough).toBe(false);

      act(() => vi.advanceTimersByTime(1));

      expect(MIN_LINES * LINE_INTERVAL_MS).toBe(6000);
      expect(result.current.hasStayedLongEnough).toBe(true);
      expect(result.current.lines).toHaveLength(MIN_LINES + 1);
    });
  });

  describe("given an order with fewer lines than a run needs", () => {
    it("counts the stay as five lines when the order has fewer, and when it has none", () => {
      const short = renderLines(["Linia 1", "Linia 2"]);
      const empty = renderLines([]);

      expect(empty.result.current.lines).toEqual([]);

      passLines(MIN_LINES, 1);

      expect(short.result.current.lines).toEqual(["Linia 1", "Linia 2"]);
      expect(short.result.current.hasStayedLongEnough).toBe(false);
      expect(empty.result.current.lines).toEqual([]);
      expect(empty.result.current.hasStayedLongEnough).toBe(false);

      act(() => vi.advanceTimersByTime(1));

      expect(short.result.current.lines).toEqual(["Linia 1", "Linia 2"]);
      expect(short.result.current.hasStayedLongEnough).toBe(true);
      expect(empty.result.current.lines).toEqual([]);
      expect(empty.result.current.hasStayedLongEnough).toBe(true);
    });
  });

  describe("when a new run starts", () => {
    it("starts from the first line again on a new run", () => {
      const { result, rerender } = renderLines();

      passLines(3);

      expect(result.current.lines).toHaveLength(4);

      rerender({ run: 1 });

      expect(result.current.lines).toEqual(["Linia 1"]);

      passLines(1);

      expect(result.current.lines).toEqual(["Linia 1", "Linia 2"]);
    });

    it("starts the clock again after a run that had stopped it", () => {
      const { result, rerender } = renderLines();

      passLines(MAX_LINES);

      expect(vi.getTimerCount()).toBe(0);

      rerender({ run: 1 });
      passLines(MAX_LINES - 1);

      expect(result.current.lines).toEqual(ORDER.slice(0, MAX_LINES));
    });

    it("has stayed long enough from the start on a run that follows a failure", () => {
      const { result, rerender } = renderLines();

      passLines(1);

      expect(result.current.hasStayedLongEnough).toBe(false);

      rerender({ run: 1 });

      expect(result.current.hasStayedLongEnough).toBe(true);
      expect(result.current.lines).toEqual(["Linia 1"]);
    });
  });

  describe("when unmounted", () => {
    it("leaves no timer running after unmount", () => {
      const { unmount } = renderLines();

      passLines(2);

      expect(vi.getTimerCount()).toBe(1);

      unmount();

      expect(vi.getTimerCount()).toBe(0);
    });
  });
});

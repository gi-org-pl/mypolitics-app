import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { RankedEntry } from "../../../RankedRow/RankedRow.types";
import { useFoldedRanking } from "./useFoldedRanking";

const RANKING: RankedEntry[] = ["a", "b", "c", "d", "e"].map((id) => ({
  orientation: { id, name: id },
  value: 50,
}));

const ids = (rows: RankedEntry[]): string[] =>
  rows.map(({ orientation }) => orientation.id);

describe("useFoldedRanking()", () => {
  describe("given a ranking longer than visibleRows", () => {
    it("starts folded with the top rows", () => {
      const { result } = renderHook(() => useFoldedRanking(RANKING, 2));

      expect(ids(result.current.rows)).toEqual(["a", "b"]);
      expect(result.current.hasFold).toBe(true);
      expect(result.current.isFolded).toBe(true);
    });

    describe("when toggled", () => {
      it("returns every row", () => {
        const { result } = renderHook(() => useFoldedRanking(RANKING, 2));

        act(() => result.current.toggle());

        expect(ids(result.current.rows)).toEqual(["a", "b", "c", "d", "e"]);
        expect(result.current.hasFold).toBe(true);
        expect(result.current.isFolded).toBe(false);
      });
    });

    describe("when toggled twice", () => {
      it("folds again", () => {
        const { result } = renderHook(() => useFoldedRanking(RANKING, 2));

        act(() => result.current.toggle());
        act(() => result.current.toggle());

        expect(ids(result.current.rows)).toEqual(["a", "b"]);
        expect(result.current.isFolded).toBe(true);
      });
    });
  });

  describe("given a ranking no longer than visibleRows", () => {
    it("returns every row and no fold", () => {
      const { result } = renderHook(() => useFoldedRanking(RANKING, 5));

      expect(result.current.rows).toHaveLength(5);
      expect(result.current.hasFold).toBe(false);
      expect(result.current.isFolded).toBe(false);
    });
  });

  describe("given no visibleRows, or an invalid one", () => {
    it("folds at 3", () => {
      expect(
        renderHook(() => useFoldedRanking(RANKING)).result.current.rows,
      ).toHaveLength(3);
      expect(
        renderHook(() => useFoldedRanking(RANKING, 0)).result.current.rows,
      ).toHaveLength(3);
    });
  });

  describe("given an opened list whose ranking grows", () => {
    it("stays open", () => {
      const { result, rerender } = renderHook(
        ({ ranking }) => useFoldedRanking(ranking, 2),
        { initialProps: { ranking: RANKING.slice(0, 3) } },
      );

      act(() => result.current.toggle());
      rerender({ ranking: RANKING });

      expect(result.current.rows).toHaveLength(5);
      expect(result.current.isFolded).toBe(false);
    });
  });
});

import { describe, expect, it } from "vitest";

import type { RankedEntry } from "../../../RankedRow/RankedRow.types";
import type { RankedCategory } from "../../HorizontalBarChart.types";
import { getCategoryRanking } from "./getCategoryRanking";

const entry = (id: string, value?: number): RankedEntry => ({
  orientation: { id, name: id },
  value,
});

const ids = (entries: RankedEntry[]): string[] =>
  entries.map(({ orientation }) => orientation.id);

describe("getCategoryRanking()", () => {
  describe("given a category with values above zero", () => {
    it("returns its ranking, the first row as the leader and the rest", () => {
      const result = getCategoryRanking({
        name: " Gospodarka\n",
        entries: [entry("a", 20), entry("b", 65), entry("c", 60)],
      });

      expect(result.name).toBe("Gospodarka");
      expect(ids(result.ranking)).toEqual(["b", "c", "a"]);
      expect(result.leader?.orientation.id).toBe("b");
      expect(ids(result.rest)).toEqual(["c", "a"]);
    });
  });

  describe("given equal leading values", () => {
    it("leads with the first in the given order", () => {
      expect(
        getCategoryRanking({ entries: [entry("a", 50), entry("b", 50)] }).leader
          ?.orientation.id,
      ).toBe("a");
    });
  });

  describe("given a category where no entry has a value above zero", () => {
    it("returns no leader and every entry as the rest", () => {
      const result = getCategoryRanking({
        name: "Gospodarka",
        entries: [entry("a", 0), entry("b"), entry("c", -5)],
      });

      expect(result.leader).toBeNull();
      expect(ids(result.rest)).toEqual(["a", "c", "b"]);
      expect(result.rest).toEqual(result.ranking);
    });
  });

  describe("given a category with no entries", () => {
    it("returns an empty ranking and no leader", () => {
      expect(getCategoryRanking({ name: "Prawo", entries: [] })).toEqual({
        name: "Prawo",
        ranking: [],
        leader: null,
        rest: [],
      });
      expect(
        getCategoryRanking({ name: "Prawo" } as RankedCategory).ranking,
      ).toEqual([]);
    });
  });

  describe("given a category without a name, or no category", () => {
    it("returns an empty name", () => {
      expect(getCategoryRanking({ entries: [] }).name).toBe("");
      expect(getCategoryRanking()).toEqual({
        name: "",
        ranking: [],
        leader: null,
        rest: [],
      });
    });
  });
});

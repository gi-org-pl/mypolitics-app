import { describe, expect, it } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";

import type { HorizontalBarComparison } from "../../HorizontalBarChart.types";
import { getCategoryComparison } from "./getCategoryComparison";

const ania = createOrientation("ania", "Ania", { type: "person" });

const WHOLE: HorizontalBarComparison = {
  orientation: ania,
  values: { alfa: 30 },
};

const BY_CATEGORY: HorizontalBarComparison = {
  ...WHOLE,
  categoryValues: { economy: { alfa: 80 }, views: { alfa: 5, beta: 60 } },
};

describe("getCategoryComparison()", () => {
  describe("given a comparison with values by category", () => {
    it("returns the other party with the values of that category", () => {
      expect(getCategoryComparison(BY_CATEGORY, "economy")).toEqual({
        orientation: ania,
        values: { alfa: 80 },
      });
      expect(getCategoryComparison(BY_CATEGORY, "views")).toEqual({
        orientation: ania,
        values: { alfa: 5, beta: 60 },
      });
    });

    it("returns no value for a category it has none for, and never those of the whole result", () => {
      expect(getCategoryComparison(BY_CATEGORY, "law")).toEqual({
        orientation: ania,
        values: {},
      });
      expect(getCategoryComparison(BY_CATEGORY)).toEqual({
        orientation: ania,
        values: {},
      });
      expect(getCategoryComparison(BY_CATEGORY, "toString")).toEqual({
        orientation: ania,
        values: {},
      });
    });
  });

  describe("given a comparison without values by category", () => {
    it("returns it as it is, for every category", () => {
      expect(getCategoryComparison(WHOLE, "economy")).toBe(WHOLE);
      expect(getCategoryComparison(WHOLE)).toBe(WHOLE);
    });
  });

  describe("given no comparison", () => {
    it("returns none", () => {
      expect(getCategoryComparison(undefined, "economy")).toBeUndefined();
    });
  });
});

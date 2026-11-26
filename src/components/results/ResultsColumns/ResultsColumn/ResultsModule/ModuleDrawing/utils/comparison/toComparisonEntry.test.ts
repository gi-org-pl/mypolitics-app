import { describe, expect, it } from "vitest";

import { FRIEND } from "../../../../../ResultsColumns.fixtures";
import { toComparisonEntry } from "./toComparisonEntry";

describe("toComparisonEntry()", () => {
  describe("given a value", () => {
    it("returns the other side with it", () => {
      expect(toComparisonEntry(FRIEND, 40)).toEqual({
        orientation: FRIEND,
        value: 40,
      });
      expect(toComparisonEntry(FRIEND, 0)).toEqual({
        orientation: FRIEND,
        value: 0,
      });
    });
  });

  describe("given no value", () => {
    it("returns nothing", () => {
      expect(toComparisonEntry(FRIEND)).toBeUndefined();
      expect(toComparisonEntry(FRIEND, Number.NaN)).toBeUndefined();
    });
  });
});

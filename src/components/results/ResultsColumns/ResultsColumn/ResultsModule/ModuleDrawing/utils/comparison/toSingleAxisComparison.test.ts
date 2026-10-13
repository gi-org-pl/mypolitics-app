import { describe, expect, it } from "vitest";

import { findFriendModule } from "@/utils/result-modules/resolvedModules.fixtures";

import { FRIEND } from "../../../../../ResultsColumns.fixtures";
import { toSingleAxisComparison } from "./toSingleAxisComparison";

const other = findFriendModule("single_axis");

describe("toSingleAxisComparison()", () => {
  describe("given the single axis of the other result", () => {
    it("hands the value of the other side for the same orientation", () => {
      expect(other.entry.orientation.id).toBe("green");
      expect(toSingleAxisComparison(other, FRIEND)).toEqual({
        orientation: FRIEND,
        value: 100,
      });
    });
  });

  describe("given an other result with no value for the orientation", () => {
    it("hands nothing", () => {
      expect(
        toSingleAxisComparison(
          { ...other, entry: { orientation: other.entry.orientation } },
          FRIEND,
        ),
      ).toBeUndefined();
    });
  });
});

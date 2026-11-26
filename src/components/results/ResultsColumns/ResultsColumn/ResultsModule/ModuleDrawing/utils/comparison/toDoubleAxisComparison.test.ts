import { describe, expect, it } from "vitest";

import { findFriendModule } from "@/utils/result-modules/resolvedModules.fixtures";

import { FRIEND } from "../../../../../ResultsColumns.fixtures";
import { toDoubleAxisComparison } from "./toDoubleAxisComparison";

const other = findFriendModule("double_axis");

describe("toDoubleAxisComparison()", () => {
  describe("given the double axis of the other result", () => {
    it("hands the start-side value of the other side, not the end-side one", () => {
      expect(other.axis.start.value).toBe(0);
      expect(other.axis.end.value).toBe(100);
      expect(toDoubleAxisComparison(other, FRIEND)).toEqual({
        orientation: FRIEND,
        value: 0,
      });
    });
  });

  describe("given an other result with no start-side value", () => {
    it("hands nothing", () => {
      const { start } = other.axis;

      expect(
        toDoubleAxisComparison(
          {
            ...other,
            axis: { ...other.axis, start: { orientation: start.orientation } },
          },
          FRIEND,
        ),
      ).toBeUndefined();
    });
  });
});

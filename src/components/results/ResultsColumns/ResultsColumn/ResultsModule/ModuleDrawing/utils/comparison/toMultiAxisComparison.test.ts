import { describe, expect, it } from "vitest";

import { findFriendModule } from "@/utils/result-modules/resolvedModules.fixtures";

import { FRIEND } from "../../../../../ResultsColumns.fixtures";
import { toMultiAxisComparison } from "./toMultiAxisComparison";

const other = findFriendModule("multi_axis");

describe("toMultiAxisComparison()", () => {
  describe("given the multi axis of the other result", () => {
    it("hands the start-side value of the other side for every axis of every group, by axis", () => {
      expect(other.groups.length).toBeGreaterThan(1);
      expect(toMultiAxisComparison(other, FRIEND)).toEqual({
        orientation: FRIEND,
        values: { "society-axis": 50, "economy-axis": 0 },
      });
    });
  });

  describe("given an axis the other result has no start-side value for", () => {
    it("leaves that axis out", () => {
      const groups = other.groups.map((group) => ({
        ...group,
        axes: group.axes.map((axis) =>
          axis.id === "economy-axis"
            ? { ...axis, start: { orientation: axis.start.orientation } }
            : axis,
        ),
      }));

      expect(toMultiAxisComparison({ ...other, groups }, FRIEND)).toEqual({
        orientation: FRIEND,
        values: { "society-axis": 50 },
      });
    });
  });
});

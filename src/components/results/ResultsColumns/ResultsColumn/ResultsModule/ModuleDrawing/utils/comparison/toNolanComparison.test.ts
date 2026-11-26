import { describe, expect, it } from "vitest";

import { findFriendModule } from "@/utils/result-modules/resolvedModules.fixtures";

import { FRIEND } from "../../../../../ResultsColumns.fixtures";
import { toNolanComparison } from "./toNolanComparison";

const other = findFriendModule("nolan_chart");

describe("toNolanComparison()", () => {
  describe("given the Nolan chart of the other result", () => {
    it("hands the four side values of the other side", () => {
      expect(toNolanComparison(other, FRIEND)).toEqual({
        orientation: FRIEND,
        horizontal: { start: 0, end: 100 },
        vertical: { start: 50, end: 50 },
      });
    });
  });

  describe("given a side the other result has no value for", () => {
    it("hands that side without a value", () => {
      const { horizontal } = other;

      expect(
        toNolanComparison(
          {
            ...other,
            horizontal: {
              ...horizontal,
              start: { orientation: horizontal.start.orientation },
            },
          },
          FRIEND,
        ),
      ).toEqual({
        orientation: FRIEND,
        horizontal: { start: undefined, end: 100 },
        vertical: { start: 50, end: 50 },
      });
    });
  });
});

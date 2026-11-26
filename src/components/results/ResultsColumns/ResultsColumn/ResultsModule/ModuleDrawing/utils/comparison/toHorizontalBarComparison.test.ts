import { describe, expect, it } from "vitest";

import { findFriendModule } from "@/utils/result-modules/resolvedModules.fixtures";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { FRIEND } from "../../../../../ResultsColumns.fixtures";
import { toHorizontalBarComparison } from "./toHorizontalBarComparison";

const other = findFriendModule("horizontal_bar");

const entry = (id: string, value?: number) => ({
  orientation: createOrientation(id),
  value,
  isOfficial: false,
});

describe("toHorizontalBarComparison()", () => {
  describe("given the ranking of the other result as one list", () => {
    it("hands the value of the other side for every orientation, by orientation", () => {
      expect(toHorizontalBarComparison(other, FRIEND)).toEqual({
        orientation: FRIEND,
        values: { "party-green": 75, "party-left": 25 },
      });
    });

    it("leaves out an orientation the other side has no value for", () => {
      expect(
        toHorizontalBarComparison(
          {
            ...other,
            entries: [entry("a", 10), entry("b")],
          },
          FRIEND,
        ),
      ).toEqual({ orientation: FRIEND, values: { a: 10 } });
    });
  });

  describe("given the ranking of the other result by category", () => {
    const { id, position, column, type, visibleRows } = other;
    const grouped = {
      id,
      position,
      column,
      type,
      visibleRows,
      categories: [
        {
          id: "economy",
          name: "Gospodarka",
          entries: [entry("a", 80), entry("b", 15)],
        },
        {
          id: "society",
          name: "Społeczeństwo",
          entries: [entry("a", 5), entry("b")],
        },
      ],
    };

    it("hands the value of the other side inside each category, by category", () => {
      expect(toHorizontalBarComparison(grouped, FRIEND)).toEqual({
        orientation: FRIEND,
        values: {},
        categoryValues: {
          economy: { a: 80, b: 15 },
          society: { a: 5 },
        },
      });
    });

    it("hands no value of the whole result", () => {
      expect(toHorizontalBarComparison(grouped, FRIEND)?.values).toEqual({});
    });
  });
});

import { describe, expect, it } from "vitest";

import { findFriendModule } from "@/utils/result-modules/resolvedModules.fixtures";

import { FRIEND } from "../../../../../ResultsColumns.fixtures";
import { toArchetypeComparison } from "./toArchetypeComparison";

const other = findFriendModule("archetype");

describe("toArchetypeComparison()", () => {
  describe("given the archetype of the other result", () => {
    it("hands the value of the other side for every archetype, by archetype", () => {
      expect(toArchetypeComparison(other, FRIEND)).toEqual({
        orientation: FRIEND,
        values: { liberal: 60, socialist: 25 },
      });
    });
  });

  describe("given an archetype the other result has no value for", () => {
    it("leaves it out", () => {
      const [first, second] = other.entries;

      expect(
        toArchetypeComparison(
          {
            ...other,
            entries: [first, { orientation: second.orientation }],
          },
          FRIEND,
        ),
      ).toEqual({ orientation: FRIEND, values: { liberal: 60 } });
    });
  });
});

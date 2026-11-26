import { describe, expect, it } from "vitest";

import {
  findFriendModule,
  findModule,
} from "@/utils/result-modules/resolvedModules.fixtures";

import { FRIEND } from "../../../../../ResultsColumns.fixtures";
import { toTraitsComparison } from "./toTraitsComparison";

const other = findFriendModule("traits");

describe("toTraitsComparison()", () => {
  describe("given the traits of the other result", () => {
    it("hands the traits the other side earned, not the ones the taker did", () => {
      expect(findModule("traits").earnedIds).toEqual(["brave"]);
      expect(toTraitsComparison(other, FRIEND)).toEqual({
        orientation: FRIEND,
        earnedIds: ["calm"],
      });
    });
  });

  describe("given an other side that earned none", () => {
    it("hands none", () => {
      expect(toTraitsComparison({ ...other, earnedIds: [] }, FRIEND)).toEqual({
        orientation: FRIEND,
        earnedIds: [],
      });
    });
  });
});

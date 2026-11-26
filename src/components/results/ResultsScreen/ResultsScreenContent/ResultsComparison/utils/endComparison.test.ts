import { describe, expect, it } from "vitest";

import { ComparisonMode } from "@/types/comparison";

import {
  choosingFriend,
  fetchingFriend,
  friendComparison,
  orientationComparison,
  refusedOwn,
} from "../ResultsComparison.fixtures";
import { ComparisonStatus } from "../ResultsComparison.types";
import { endComparison } from "./endComparison";

describe("endComparison()", () => {
  describe("given a comparison with a friend", () => {
    it("goes back to the mode selector on the friend mode, with an empty field", () => {
      expect(endComparison(friendComparison)).toEqual({
        status: ComparisonStatus.Choosing,
        mode: ComparisonMode.Friend,
        friendId: "",
      });
    });
  });

  describe("given a comparison with an orientation", () => {
    it("goes back to the mode selector on the orientation mode", () => {
      expect(endComparison(orientationComparison)).toEqual({
        status: ComparisonStatus.Choosing,
        mode: ComparisonMode.Orientation,
        friendId: "",
      });
    });
  });

  describe("while no comparison runs", () => {
    it("changes nothing", () => {
      expect(endComparison(choosingFriend)).toBe(choosingFriend);
      expect(endComparison(fetchingFriend)).toBe(fetchingFriend);
      expect(endComparison(refusedOwn)).toBe(refusedOwn);
    });
  });
});

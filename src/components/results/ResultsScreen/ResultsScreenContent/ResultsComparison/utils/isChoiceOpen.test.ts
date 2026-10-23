import { describe, expect, it } from "vitest";

import {
  choosingFriend,
  fetchingFriend,
  friendComparison,
  refusedOwn,
} from "../ResultsComparison.fixtures";
import { isChoiceOpen } from "./isChoiceOpen";

describe("isChoiceOpen()", () => {
  describe("given a state in which no comparison runs and nothing is on the way", () => {
    it("says the other side can be chosen", () => {
      expect(isChoiceOpen(choosingFriend)).toBe(true);
      expect(isChoiceOpen(refusedOwn)).toBe(true);
    });
  });

  describe("given a result on the way", () => {
    it("says nothing can be chosen", () => {
      expect(isChoiceOpen(fetchingFriend)).toBe(false);
    });
  });

  describe("given a running comparison", () => {
    it("says nothing can be chosen until it is ended", () => {
      expect(isChoiceOpen(friendComparison)).toBe(false);
    });
  });
});

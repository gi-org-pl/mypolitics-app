import { describe, expect, it } from "vitest";

import { comparisonQuiz, friendSide, leftSide } from "./comparison.fixtures";
import { getFriendAnswers } from "./getFriendAnswers";
import { getOrientationAnswers } from "./getOrientationAnswers";
import { getOtherAnswers } from "./getOtherAnswers";

const [, q2] = comparisonQuiz.questions;

describe("getOtherAnswers()", () => {
  describe("given a friend as the other side", () => {
    it("returns the answer the friend chose", () => {
      expect(getOtherAnswers(q2, friendSide)).toEqual(
        getFriendAnswers(q2, friendSide),
      );
      expect(getOtherAnswers(q2, friendSide)).toEqual([q2.possibleAnswers[0]]);
    });
  });

  describe("given an orientation as the other side", () => {
    it("returns every answer that lists the orientation", () => {
      expect(getOtherAnswers(q2, leftSide)).toEqual(
        getOrientationAnswers(q2, leftSide),
      );
      expect(getOtherAnswers(q2, leftSide)).toHaveLength(2);
    });
  });
});

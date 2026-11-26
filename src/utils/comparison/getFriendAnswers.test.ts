import { describe, expect, it } from "vitest";

import { comparisonQuiz, friendSide } from "./comparison.fixtures";
import { getFriendAnswers } from "./getFriendAnswers";

const [q1, , q3] = comparisonQuiz.questions;

describe("getFriendAnswers()", () => {
  describe("given a question the friend answered", () => {
    it("returns the one answer they chose", () => {
      expect(getFriendAnswers(q1, friendSide)).toEqual([q1.possibleAnswers[0]]);
    });
  });

  describe("given a question the friend did not answer", () => {
    it("returns no answer", () => {
      expect(
        getFriendAnswers(q1, { result: { scores: {}, answers: [] } }),
      ).toEqual([]);
    });
  });

  describe("given an answer the question does not have", () => {
    it("returns no answer", () => {
      expect(getFriendAnswers(q3, friendSide)).toEqual([]);
    });
  });
});

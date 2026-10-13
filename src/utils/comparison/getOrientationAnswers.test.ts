import { describe, expect, it } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";

import { comparisonQuiz, leftSide } from "./comparison.fixtures";
import { getOrientationAnswers } from "./getOrientationAnswers";

const [q1, q2, , q4] = comparisonQuiz.questions;

describe("getOrientationAnswers()", () => {
  describe("given a question with one answer that lists the orientation", () => {
    it("returns that answer", () => {
      expect(getOrientationAnswers(q1, leftSide)).toEqual([
        q1.possibleAnswers[0],
      ]);
    });
  });

  describe("given a question with several answers that list the orientation", () => {
    it("returns every one of them, in the order of the question", () => {
      expect(getOrientationAnswers(q2, leftSide)).toEqual([
        q2.possibleAnswers[0],
        q2.possibleAnswers[2],
      ]);
    });
  });

  describe("given a question with no answer that lists the orientation", () => {
    it("returns no answer", () => {
      expect(getOrientationAnswers(q4, leftSide)).toEqual([]);
      expect(
        getOrientationAnswers(q1, {
          orientation: createOrientation("centre", "Centrum"),
        }),
      ).toEqual([]);
    });
  });
});

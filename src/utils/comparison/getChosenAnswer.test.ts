import { describe, expect, it } from "vitest";

import { comparisonQuiz } from "./comparison.fixtures";
import { getChosenAnswer } from "./getChosenAnswer";

const [q1] = comparisonQuiz.questions;

describe("getChosenAnswer()", () => {
  describe("given a result that answers the question", () => {
    it("returns the possible answer it chose", () => {
      expect(
        getChosenAnswer(q1, [{ questionId: "q1", answerId: "q1-a2" }]),
      ).toBe(q1.possibleAnswers[1]);
    });
  });

  describe("given a result that does not answer the question", () => {
    it("returns nothing", () => {
      expect(
        getChosenAnswer(q1, [{ questionId: "q2", answerId: "q2-a1" }]),
      ).toBeUndefined();
      expect(getChosenAnswer(q1, [])).toBeUndefined();
    });
  });

  describe("given an answer the question does not have", () => {
    it("returns nothing", () => {
      expect(
        getChosenAnswer(q1, [{ questionId: "q1", answerId: "q2-a1" }]),
      ).toBeUndefined();
    });
  });

  describe("given two answers to the question", () => {
    it("counts the first", () => {
      expect(
        getChosenAnswer(q1, [
          { questionId: "q1", answerId: "q1-a1" },
          { questionId: "q1", answerId: "q1-a2" },
        ]),
      ).toBe(q1.possibleAnswers[0]);
    });
  });
});

import { describe, expect, it } from "vitest";

import { toAnswerCounts } from "./toAnswerCounts";

const createQuestion = (answers: unknown[], resultsCounted = 1240) => ({
  questionId: "question-1",
  resultsCounted,
  answers,
});

describe("toAnswerCounts()", () => {
  describe("given a question with a count for each answer", () => {
    it("returns the results counted and the counts by answer identifier", () => {
      expect(
        toAnswerCounts(
          createQuestion([
            { answerId: "answer-1", count: 31 },
            { answerId: "answer-2", count: 62 },
            { answerId: "answer-3", count: 410 },
            { answerId: "answer-4", count: 365 },
          ]),
        ),
      ).toEqual({
        resultsCounted: 1240,
        chosen: {
          "answer-1": 31,
          "answer-2": 62,
          "answer-3": 410,
          "answer-4": 365,
        },
      });
    });

    it("keeps a count of zero", () => {
      expect(
        toAnswerCounts(createQuestion([{ answerId: "a1", count: 0 }])),
      ).toEqual({ resultsCounted: 1240, chosen: { a1: 0 } });
    });
  });

  describe("given no answers", () => {
    it("returns the results counted with no counts", () => {
      expect(toAnswerCounts(createQuestion([]))).toEqual({
        resultsCounted: 1240,
        chosen: {},
      });
    });
  });

  describe("given an answer without an identifier", () => {
    it.each([
      [{ count: 5 }],
      [{ answerId: "", count: 5 }],
      [{ answerId: 7, count: 5 }],
      ["a2"],
      [null],
    ])("leaves that answer out and keeps the others: %j", (answer) => {
      expect(
        toAnswerCounts(createQuestion([{ answerId: "a1", count: 31 }, answer])),
      ).toEqual({ resultsCounted: 1240, chosen: { a1: 31 } });
    });
  });

  describe("given an answer without a count", () => {
    it("leaves that answer out and keeps the others", () => {
      expect(
        toAnswerCounts(
          createQuestion([{ answerId: "a1", count: 31 }, { answerId: "a2" }]),
        ),
      ).toEqual({ resultsCounted: 1240, chosen: { a1: 31 } });
    });
  });

  describe("given a count that is not a number", () => {
    it.each([
      "62",
      null,
      true,
      {},
    ])("returns nothing for the whole question: %j", (count) => {
      expect(
        toAnswerCounts(
          createQuestion([
            { answerId: "a1", count: 31 },
            { answerId: "a2", count },
          ]),
        ),
      ).toBeUndefined();
    });
  });

  describe("given a negative or fractional number", () => {
    it("passes it as sent", () => {
      expect(
        toAnswerCounts(
          createQuestion(
            [
              { answerId: "a1", count: -3 },
              { answerId: "a2", count: 1.5 },
            ],
            -10.5,
          ),
        ),
      ).toEqual({ resultsCounted: -10.5, chosen: { a1: -3, a2: 1.5 } });
    });
  });

  describe("given two items for one answer", () => {
    it("keeps the first", () => {
      expect(
        toAnswerCounts(
          createQuestion([
            { answerId: "a1", count: 31 },
            { answerId: "a1", count: 99 },
          ]),
        ),
      ).toEqual({ resultsCounted: 1240, chosen: { a1: 31 } });
    });
  });
});

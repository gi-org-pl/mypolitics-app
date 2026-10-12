import { describe, expect, it } from "vitest";

import {
  answerCountResponseSchema,
  answerCountsResponseSchema,
  identifiedAnswerResponseSchema,
  questionCountsResponseSchema,
} from "./answerCounts";

describe("answerCountsResponseSchema", () => {
  describe("given a response with the time it was computed at and a list of questions", () => {
    it("passes, and leaves the questions as sent", () => {
      const questions = [{ questionId: "q1" }, "not a question", null];

      expect(
        answerCountsResponseSchema.parse({
          computedAt: "2026-10-08T06:00:00.000Z",
          questions,
        }),
      ).toEqual({ computedAt: "2026-10-08T06:00:00.000Z", questions });
    });

    it.each([
      "2026-10-08T06:00:00Z",
      "2026-10-08T06:00:00.000Z",
      "2026-10-08T08:00:00+02:00",
    ])("takes a date and time in ISO 8601: %s", (computedAt) => {
      expect(
        answerCountsResponseSchema.safeParse({ computedAt, questions: [] })
          .success,
      ).toBe(true);
    });
  });

  describe("given no computedAt, or one that is not a date and time", () => {
    it.each([
      undefined,
      null,
      "",
      "yesterday",
      "2026-10-08",
      "2026-10-08T06:00:00",
      "8 October 2026 06:00",
      1_791_000_000_000,
    ])("fails for %j", (computedAt) => {
      expect(
        answerCountsResponseSchema.safeParse({ computedAt, questions: [] })
          .success,
      ).toBe(false);
    });
  });

  describe("given something that is not an object, or questions that are not a list", () => {
    it.each([
      [undefined],
      [null],
      ["<html></html>"],
      [[]],
      [{ computedAt: "2026-10-08T06:00:00.000Z" }],
      [{ computedAt: "2026-10-08T06:00:00.000Z", questions: {} }],
      [{ computedAt: "2026-10-08T06:00:00.000Z", questions: "questions" }],
    ])("fails for %j", (response) => {
      expect(answerCountsResponseSchema.safeParse(response).success).toBe(
        false,
      );
    });
  });
});

describe("questionCountsResponseSchema", () => {
  it("passes for a question with its identifier, its results counted and a list of answers", () => {
    const question = {
      questionId: "question-1",
      resultsCounted: 1240,
      answers: [{ answerId: "answer-1", count: 31 }, "not an answer"],
    };

    expect(questionCountsResponseSchema.parse(question)).toEqual(question);
  });

  it("takes a number as sent, negative or fractional too", () => {
    expect(
      questionCountsResponseSchema.safeParse({
        questionId: "q1",
        resultsCounted: -1.5,
        answers: [],
      }).success,
    ).toBe(true);
  });

  it.each([
    ["something that is not an object", "question-1"],
    ["no identifier", { resultsCounted: 10, answers: [] }],
    [
      "an empty identifier",
      { questionId: "", resultsCounted: 10, answers: [] },
    ],
    ["no results counted", { questionId: "q1", answers: [] }],
    [
      "results counted that are not a number",
      { questionId: "q1", resultsCounted: "10", answers: [] },
    ],
    ["no answers", { questionId: "q1", resultsCounted: 10 }],
    [
      "answers that are not a list",
      { questionId: "q1", resultsCounted: 10, answers: {} },
    ],
  ])("fails for %s", (_, question) => {
    expect(questionCountsResponseSchema.safeParse(question).success).toBe(
      false,
    );
  });
});

describe("identifiedAnswerResponseSchema", () => {
  it("passes for an item with an identifier, and keeps whatever else it holds", () => {
    expect(
      identifiedAnswerResponseSchema.parse({ answerId: "a1", count: "many" }),
    ).toEqual({ answerId: "a1", count: "many" });
  });

  it.each([
    [undefined],
    [null],
    ["a1"],
    [{}],
    [{ count: 3 }],
    [{ answerId: "" }],
    [{ answerId: 7 }],
  ])("fails for an item without an identifier: %j", (answer) => {
    expect(identifiedAnswerResponseSchema.safeParse(answer).success).toBe(
      false,
    );
  });
});

describe("answerCountResponseSchema", () => {
  it("passes for an answer with a count, and for one without", () => {
    expect(
      answerCountResponseSchema.parse({ answerId: "a1", count: 31 }),
    ).toEqual({ answerId: "a1", count: 31 });
    expect(answerCountResponseSchema.parse({ answerId: "a1" })).toEqual({
      answerId: "a1",
    });
  });

  it("takes a count as sent, negative or fractional too", () => {
    expect(
      answerCountResponseSchema.parse({ answerId: "a1", count: -2.5 }),
    ).toEqual({ answerId: "a1", count: -2.5 });
  });

  it.each([
    "31",
    null,
    true,
    {},
  ])("fails for a count that is not a number: %j", (count) => {
    expect(
      answerCountResponseSchema.safeParse({ answerId: "a1", count }).success,
    ).toBe(false);
  });
});

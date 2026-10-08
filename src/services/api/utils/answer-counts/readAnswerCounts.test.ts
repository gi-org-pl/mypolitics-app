import { describe, expect, it } from "vitest";

import { readAnswerCounts } from "./readAnswerCounts";

const NOW = new Date("2026-10-08T12:00:00.000Z");
const COMPUTED_AT = "2026-10-08T06:00:00.000Z";

const QUESTION_1 = {
  questionId: "question-1",
  resultsCounted: 1240,
  answers: [
    { answerId: "answer-1", count: 31 },
    { answerId: "answer-2", count: 62 },
    { answerId: "answer-3", count: 410 },
    { answerId: "answer-4", count: 365 },
  ],
};
const QUESTION_2 = {
  questionId: "question-2",
  resultsCounted: 1240,
  answers: [
    { answerId: "answer-5", count: 700 },
    { answerId: "answer-6", count: 300 },
  ],
};
const COUNTS_2 = {
  resultsCounted: 1240,
  chosen: { "answer-5": 700, "answer-6": 300 },
};

const createResponse = (
  questions: unknown[] = [QUESTION_1, QUESTION_2],
  computedAt: unknown = COMPUTED_AT,
) => ({ computedAt, questions });

describe("readAnswerCounts()", () => {
  describe("given a well-formed response", () => {
    it("returns one entry per question with its results counted", () => {
      const counts = readAnswerCounts(createResponse(), NOW);

      expect(Object.keys(counts ?? {})).toEqual(["question-1", "question-2"]);
      expect(counts?.["question-1"].resultsCounted).toBe(1240);
      expect(counts?.["question-2"].resultsCounted).toBe(1240);
    });

    it("returns the counts of a question by answer identifier", () => {
      expect(readAnswerCounts(createResponse(), NOW)).toEqual({
        "question-1": {
          resultsCounted: 1240,
          chosen: {
            "answer-1": 31,
            "answer-2": 62,
            "answer-3": 410,
            "answer-4": 365,
          },
        },
        "question-2": COUNTS_2,
      });
    });

    it("returns no entry for a quiz with no question counted", () => {
      expect(readAnswerCounts(createResponse([]), NOW)).toEqual({});
    });
  });

  describe("given no computedAt, one that is not a date, or one in the future", () => {
    it.each([
      ["null", null],
      ["a word", "yesterday"],
      ["a number", 1_791_000_000_000],
      ["a date without a time", "2026-10-08"],
      ["one millisecond after now", "2026-10-08T12:00:00.001Z"],
      ["a day after now", "2026-10-09T12:00:00.000Z"],
    ])("returns nothing: %s", (_, computedAt) => {
      expect(
        readAnswerCounts(createResponse(undefined, computedAt), NOW),
      ).toBeUndefined();
    });

    it("returns nothing when the field is not there at all", () => {
      expect(
        readAnswerCounts({ questions: [QUESTION_1] }, NOW),
      ).toBeUndefined();
    });
  });

  describe("given counts computed more than 24 hours ago", () => {
    it.each([
      "2026-10-07T11:59:59.999Z",
      "2026-10-01T12:00:00.000Z",
    ])("returns nothing: %s", (computedAt) => {
      expect(
        readAnswerCounts(createResponse(undefined, computedAt), NOW),
      ).toBeUndefined();
    });
  });

  describe("given counts computed exactly 24 hours ago", () => {
    it("returns them", () => {
      expect(
        readAnswerCounts(
          createResponse([QUESTION_2], "2026-10-07T12:00:00.000Z"),
          NOW,
        ),
      ).toEqual({ "question-2": COUNTS_2 });
    });

    it("reads the time in the zone it is given in", () => {
      expect(
        readAnswerCounts(
          createResponse([QUESTION_2], "2026-10-07T14:00:00.000+02:00"),
          NOW,
        ),
      ).toEqual({ "question-2": COUNTS_2 });
    });
  });

  describe("given counts computed at this very moment", () => {
    it("returns them", () => {
      expect(
        readAnswerCounts(createResponse([QUESTION_2], NOW.toISOString()), NOW),
      ).toEqual({ "question-2": COUNTS_2 });
    });
  });

  describe("given a response that is not an object, or questions that are not a list", () => {
    it.each([
      [undefined],
      [null],
      [""],
      ["<html><body>Sign in to the network</body></html>"],
      [[]],
      [{}],
      [{ computedAt: COMPUTED_AT }],
      [{ computedAt: COMPUTED_AT, questions: "questions" }],
      [{ computedAt: COMPUTED_AT, questions: { "question-1": QUESTION_1 } }],
    ])("returns nothing for %j", (response) => {
      expect(readAnswerCounts(response, NOW)).toBeUndefined();
    });
  });

  describe("given one malformed question among good ones", () => {
    it.each([
      ["not an object", "question-1"],
      ["null", null],
      ["without an identifier", { ...QUESTION_1, questionId: undefined }],
      ["with an empty identifier", { ...QUESTION_1, questionId: "" }],
      [
        "with results counted that are not a number",
        { ...QUESTION_1, resultsCounted: "1240" },
      ],
      ["without results counted", { questionId: "question-1", answers: [] }],
      ["without answers", { questionId: "question-1", resultsCounted: 1240 }],
    ])("leaves that question out and keeps the others: %s", (_, question) => {
      expect(
        readAnswerCounts(createResponse([question, QUESTION_2]), NOW),
      ).toEqual({ "question-2": COUNTS_2 });
    });
  });

  describe("given a question with a count that is not a number", () => {
    it("leaves that question out", () => {
      expect(
        readAnswerCounts(
          createResponse([
            {
              ...QUESTION_1,
              answers: [
                { answerId: "answer-1", count: 31 },
                { answerId: "answer-2", count: "62" },
              ],
            },
            QUESTION_2,
          ]),
          NOW,
        ),
      ).toEqual({ "question-2": COUNTS_2 });
    });
  });

  describe("given an answer without an identifier, or without a count", () => {
    it("leaves that answer out and keeps the question", () => {
      expect(
        readAnswerCounts(
          createResponse([
            {
              ...QUESTION_1,
              answers: [
                { answerId: "answer-1", count: 31 },
                { count: 62 },
                { answerId: "answer-3" },
                "answer-4",
              ],
            },
          ]),
          NOW,
        ),
      ).toEqual({
        "question-1": { resultsCounted: 1240, chosen: { "answer-1": 31 } },
      });
    });
  });

  describe("given a negative or fractional number", () => {
    it("passes it as sent", () => {
      expect(
        readAnswerCounts(
          createResponse([
            {
              questionId: "question-1",
              resultsCounted: 99.5,
              answers: [
                { answerId: "answer-1", count: -31 },
                { answerId: "answer-2", count: 6.2 },
              ],
            },
          ]),
          NOW,
        ),
      ).toEqual({
        "question-1": {
          resultsCounted: 99.5,
          chosen: { "answer-1": -31, "answer-2": 6.2 },
        },
      });
    });
  });

  describe("given two items for one question", () => {
    it("keeps the first", () => {
      expect(
        readAnswerCounts(
          createResponse([
            QUESTION_2,
            { ...QUESTION_2, resultsCounted: 5, answers: [] },
          ]),
          NOW,
        ),
      ).toEqual({ "question-2": COUNTS_2 });
    });
  });

  it("never throws", () => {
    const inputs: [unknown, unknown][] = [
      [createResponse(), undefined],
      [createResponse(), null],
      [createResponse(), "2026-10-08"],
      [createResponse(), new Date(Number.NaN)],
      [Symbol("response"), NOW],
      [() => createResponse(), NOW],
      [createResponse([{ ...QUESTION_1, answers: [Symbol("answer")] }]), NOW],
    ];

    for (const [response, now] of inputs) {
      expect(() => readAnswerCounts(response, now as Date)).not.toThrow();
    }

    expect(readAnswerCounts(createResponse(), undefined as never)).toBe(
      undefined,
    );
    expect(
      readAnswerCounts(createResponse(), new Date(Number.NaN)),
    ).toBeUndefined();
  });
});

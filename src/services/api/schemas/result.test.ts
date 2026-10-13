import { describe, expect, it } from "vitest";

import {
  resultAnswerResponseSchema,
  resultOrientationResponseSchema,
  resultResponseSchema,
} from "./result";

const calculation = {
  algorithm: "default",
  calculatedAt: "2026-10-08T10:00:00.000Z",
  orientations: [{ id: "0654e995", points: 10, maxPossible: 20 }],
};

describe("resultResponseSchema", () => {
  describe("given a result that is not calculated yet", () => {
    it("reads results that are null as absent, and keeps the survey and the answers", () => {
      expect(
        resultResponseSchema.parse({
          id: "3f0c2a52",
          surveyId: "60beb898",
          prioritizedCategories: [],
          results: null,
          answers: [{ questionId: "30eb37ca", answerId: "c1646132" }],
          createdAt: "2026-10-08T10:00:00.000Z",
          calculatedAt: null,
        }),
      ).toEqual({
        surveyId: "60beb898",
        answers: [{ questionId: "30eb37ca", answerId: "c1646132" }],
      });
    });

    it("reads missing results as absent", () => {
      expect(resultResponseSchema.parse({})).toEqual({});
    });
  });

  describe("given results that hold the calculation as an object", () => {
    it("reads its list of orientations and nothing else", () => {
      expect(resultResponseSchema.parse({ results: calculation })).toEqual({
        results: { orientations: calculation.orientations },
      });
    });

    it("accepts an empty list of orientations", () => {
      expect(
        resultResponseSchema.parse({ results: { orientations: [] } }),
      ).toEqual({ results: { orientations: [] } });
    });

    it("leaves the items of the list as sent", () => {
      const orientations = [null, "left", { id: 7 }];

      expect(
        resultResponseSchema.parse({ results: { orientations } }).results
          ?.orientations,
      ).toEqual(orientations);
    });
  });

  describe("given results that hold the calculation as text", () => {
    it("reads the object the text contains", () => {
      expect(
        resultResponseSchema.parse({ results: JSON.stringify(calculation) }),
      ).toEqual({ results: { orientations: calculation.orientations } });
    });

    it("reads it with line breaks around and inside it", () => {
      expect(
        resultResponseSchema.parse({
          results: `\n${JSON.stringify(calculation, null, 2)}\n`,
        }),
      ).toEqual({ results: { orientations: calculation.orientations } });
    });
  });

  describe("given results that are anything else", () => {
    it.each([
      ["null"],
      [""],
      ["calculated"],
      ['{"orientations":'],
      ['{"algorithm":"default"}'],
      ['{"orientations":"none"}'],
      ['[{"id":"0654e995"}]'],
      [{}],
      [{ algorithm: "default" }],
      [{ orientations: null }],
      [{ orientations: {} }],
      [[]],
      [[{ id: "0654e995", points: 10 }]],
      [true],
      [7],
    ])("reads %j as absent", (results) => {
      expect(resultResponseSchema.parse({ results })).toEqual({});
    });
  });

  describe("given the survey of the result", () => {
    it("reads surveyId without the space around it", () => {
      expect(
        resultResponseSchema.parse({ surveyId: " 60beb898 " }).surveyId,
      ).toBe("60beb898");
    });

    it.each([
      [null],
      [""],
      ["  "],
      [7],
      [{}],
    ])("reads a surveyId of %j as absent", (surveyId) => {
      expect(resultResponseSchema.parse({ surveyId })).toEqual({});
    });
  });

  describe("given the answers of the result", () => {
    it.each([
      [null],
      ["answers"],
      [{}],
      [[null, { questionId: 7 }]],
    ])("leaves answers of %j as sent", (answers) => {
      expect(resultResponseSchema.parse({ answers }).answers).toEqual(answers);
    });
  });

  describe("given something that is not an object", () => {
    it.each([
      [undefined],
      [null],
      [""],
      [7],
      [[]],
    ])("does not accept %j", (response) => {
      expect(resultResponseSchema.safeParse(response).success).toBe(false);
    });
  });
});

describe("resultOrientationResponseSchema", () => {
  describe("given an orientation of a calculation", () => {
    it("reads its identifier, its points and its maximum, and nothing else", () => {
      expect(
        resultOrientationResponseSchema.parse({
          id: "0654e995",
          points: 10,
          maxPossible: 20,
          name: "Zielona Gospodarka",
        }),
      ).toEqual({ id: "0654e995", points: 10, maxPossible: 20 });
    });

    it("accepts zero, a fraction and a negative number", () => {
      expect(
        resultOrientationResponseSchema.parse({
          id: "0654e995",
          points: -0.5,
          maxPossible: 0,
        }),
      ).toEqual({ id: "0654e995", points: -0.5, maxPossible: 0 });
    });
  });

  describe("given an item that is not one", () => {
    it.each([
      [{ points: 10, maxPossible: 20 }],
      [{ id: "", points: 10, maxPossible: 20 }],
      [{ id: 7, points: 10, maxPossible: 20 }],
      [{ id: "0654e995", maxPossible: 20 }],
      [{ id: "0654e995", points: 10 }],
      [{ id: "0654e995", points: "10", maxPossible: 20 }],
      [{ id: "0654e995", points: 10, maxPossible: null }],
      [{ id: "0654e995", points: Number.NaN, maxPossible: 20 }],
      [{ id: "0654e995", points: 10, maxPossible: Number.POSITIVE_INFINITY }],
      [{ id: "0654e995", points: Number.NEGATIVE_INFINITY, maxPossible: 20 }],
      [null],
      ["0654e995"],
      [[]],
    ])("does not accept %j", (item) => {
      expect(resultOrientationResponseSchema.safeParse(item).success).toBe(
        false,
      );
    });
  });
});

describe("resultAnswerResponseSchema", () => {
  describe("given an answer of a result", () => {
    it("reads the question and the answer chosen, and nothing else", () => {
      expect(
        resultAnswerResponseSchema.parse({
          questionId: "30eb37ca",
          answerId: "c1646132",
          seconds: 4,
        }),
      ).toEqual({ questionId: "30eb37ca", answerId: "c1646132" });
    });
  });

  describe("given an item that is not one", () => {
    it.each([
      [{ answerId: "c1646132" }],
      [{ questionId: "30eb37ca" }],
      [{ questionId: "", answerId: "c1646132" }],
      [{ questionId: "30eb37ca", answerId: "" }],
      [{ questionId: 7, answerId: "c1646132" }],
      [{ questionId: "30eb37ca", answerId: null }],
      [null],
      ["30eb37ca"],
      [[]],
    ])("does not accept %j", (item) => {
      expect(resultAnswerResponseSchema.safeParse(item).success).toBe(false);
    });
  });
});

import { describe, expect, it } from "vitest";

import { resultResponseSchema } from "./result";

const calculation = {
  algorithm: "default",
  calculatedAt: "2026-10-08T10:00:00.000Z",
  orientations: [{ id: "0654e995", points: 10, maxPossible: 20 }],
};

describe("resultResponseSchema", () => {
  describe("given a result that is not calculated yet", () => {
    it("reads results that are null as absent", () => {
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
      ).toEqual({});
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

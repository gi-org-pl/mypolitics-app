import { describe, expect, it } from "vitest";

import { ApiFailureKind } from "@/types/api";

import { toSurveyResult } from "./toSurveyResult";

const RESULT_ID = "3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11";

const calculation = {
  algorithm: "default",
  calculatedAt: "2026-10-08T10:00:00.000Z",
  orientations: [{ id: "0654e995", points: 10, maxPossible: 20 }],
};

describe("toSurveyResult()", () => {
  describe("given a result that holds the calculation", () => {
    it("is calculated when results is an object with orientations", () => {
      expect(toSurveyResult({ results: calculation }, RESULT_ID)).toEqual({
        id: RESULT_ID,
        isCalculated: true,
      });
    });

    it("is calculated when results is text that holds such an object", () => {
      expect(
        toSurveyResult({ results: JSON.stringify(calculation) }, RESULT_ID)
          .isCalculated,
      ).toBe(true);
    });

    it("is calculated when the list of orientations is empty", () => {
      expect(
        toSurveyResult({ results: { orientations: [] } }, RESULT_ID)
          .isCalculated,
      ).toBe(true);
      expect(
        toSurveyResult({ results: '{"orientations":[]}' }, RESULT_ID)
          .isCalculated,
      ).toBe(true);
    });
  });

  describe("given a result that does not hold the calculation", () => {
    it("is not calculated when results is null or missing", () => {
      expect(toSurveyResult({ results: null }, RESULT_ID)).toEqual({
        id: RESULT_ID,
        isCalculated: false,
      });
      expect(toSurveyResult({}, RESULT_ID).isCalculated).toBe(false);
    });

    it.each([
      ["null"],
      [""],
      ["calculated"],
      ["{}"],
      ['{"orientations":'],
      [{}],
      [{ orientations: "none" }],
      [[]],
      [true],
      [7],
    ])("is not calculated when results is %j", (results) => {
      expect(toSurveyResult({ results }, RESULT_ID).isCalculated).toBe(false);
    });
  });

  describe("given no reply, or a reply that is not a result", () => {
    it.each([
      [undefined],
      [null],
      [""],
      ["<html></html>"],
      [7],
      [[]],
      [{ kind: ApiFailureKind.Http, status: 404 }],
      [{ message: "Result with given ID does not exist", statusCode: 404 }],
    ])("is not calculated for %j", (response) => {
      expect(toSurveyResult(response, RESULT_ID)).toEqual({
        id: RESULT_ID,
        isCalculated: false,
      });
    });
  });

  describe("given a reply with an identifier of its own", () => {
    it("returns the identifier it was asked for", () => {
      expect(
        toSurveyResult({ id: "another", results: calculation }, RESULT_ID).id,
      ).toBe(RESULT_ID);
    });
  });
});

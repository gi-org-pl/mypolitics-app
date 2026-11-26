import { describe, expect, it } from "vitest";

import { ResultLoadStatus } from "@/types/survey";
import { createSurveyResult } from "@/utils/vitest/survey/createSurveyResult";

import { readResult } from "./readResult";
import { toSurveyResult } from "./toSurveyResult";
import {
  pendingResultResponse,
  RESULT_ID,
  resultResponse,
} from "./toSurveyResult.fixtures";

describe("readResult()", () => {
  describe("given a calculated result as the API sends it", () => {
    it("is ready, with the result as read", () => {
      expect(readResult(resultResponse, RESULT_ID)).toEqual({
        status: ResultLoadStatus.Ready,
        result: toSurveyResult(resultResponse, RESULT_ID),
      });
    });
  });

  describe("given a result that is not calculated yet", () => {
    it("is ready, with a result that is not calculated", () => {
      expect(readResult(pendingResultResponse, RESULT_ID)).toMatchObject({
        status: ResultLoadStatus.Ready,
        result: { id: RESULT_ID, isCalculated: false },
      });
    });
  });

  describe("given an object that holds nothing of a result", () => {
    it("is ready, with a result that holds nothing", () => {
      expect(readResult({}, RESULT_ID)).toEqual({
        status: ResultLoadStatus.Ready,
        result: createSurveyResult({ id: RESULT_ID }),
      });
    });
  });

  describe("given a reply that is not a result", () => {
    it.each([
      ["a page", "<html></html>"],
      ["nothing", undefined],
      ["null", null],
      ["a list", [resultResponse]],
      ["a number", 7],
    ])("is failed: %s", (_, response) => {
      expect(readResult(response, RESULT_ID)).toEqual({
        status: ResultLoadStatus.Failed,
      });
    });
  });
});

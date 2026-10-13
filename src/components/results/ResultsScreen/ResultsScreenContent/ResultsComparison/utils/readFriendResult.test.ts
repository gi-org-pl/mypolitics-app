import { describe, expect, it } from "vitest";

import { ResultLoadStatus } from "@/types/survey";
import { createResultLoad } from "@/utils/vitest/survey/createResultLoad";

import { FRIEND_ID } from "../ResultsComparison.fixtures";
import { FriendRefusal } from "../ResultsComparison.types";
import { readFriendResult } from "./readFriendResult";

const SURVEY_ID = "survey";

const load = (overrides = {}) =>
  createResultLoad({
    id: FRIEND_ID,
    isCalculated: true,
    surveyId: SURVEY_ID,
    ...overrides,
  });

describe("readFriendResult()", () => {
  describe("given a calculated result of the same survey", () => {
    it("gives the result", () => {
      const read = load();

      expect(readFriendResult(read, SURVEY_ID)).toEqual({
        result: read.result,
      });
    });
  });

  describe("given a result of another survey", () => {
    it("refuses it as one of another survey", () => {
      expect(
        readFriendResult(load({ surveyId: "another" }), SURVEY_ID),
      ).toEqual({ refusal: FriendRefusal.OtherSurvey });
    });

    it("refuses a result that names no survey the same way", () => {
      expect(
        readFriendResult(load({ surveyId: undefined }), SURVEY_ID),
      ).toEqual({ refusal: FriendRefusal.OtherSurvey });
    });
  });

  describe("given a result that is not calculated yet", () => {
    it("refuses it as one that cannot be read", () => {
      expect(
        readFriendResult(load({ isCalculated: false }), SURVEY_ID),
      ).toEqual({ refusal: FriendRefusal.Unreadable });
    });

    it("refuses it that way whatever survey it is of", () => {
      expect(
        readFriendResult(
          load({ isCalculated: false, surveyId: "another" }),
          SURVEY_ID,
        ),
      ).toEqual({ refusal: FriendRefusal.Unreadable });
    });
  });

  describe("given no such result", () => {
    it("refuses it as one that cannot be read", () => {
      expect(
        readFriendResult({ status: ResultLoadStatus.NotFound }, SURVEY_ID),
      ).toEqual({ refusal: FriendRefusal.Unreadable });
    });
  });

  describe("given a read that failed", () => {
    it("refuses it as one that cannot be read", () => {
      expect(
        readFriendResult({ status: ResultLoadStatus.Failed }, SURVEY_ID),
      ).toEqual({ refusal: FriendRefusal.Unreadable });
    });
  });
});

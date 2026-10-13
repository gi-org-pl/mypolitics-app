import { describe, expect, it } from "vitest";

import { ApiFailureKind } from "@/types/api";
import { createSurveyResult } from "@/utils/vitest/survey/createSurveyResult";

import { toSurveyResult } from "./toSurveyResult";
import {
  pendingResultResponse,
  RESULT_ID,
  RESULT_SURVEY_ID,
  resultCalculation,
  resultResponse,
} from "./toSurveyResult.fixtures";

const NOTHING_READ = createSurveyResult({ id: RESULT_ID });

describe("toSurveyResult()", () => {
  describe("given a calculated result as the API sends it", () => {
    const calculated = {
      id: RESULT_ID,
      isCalculated: true,
      surveyId: RESULT_SURVEY_ID,
      scores: {
        "a3bf56a8-a29b-4bfd-992b-c4017e659e7a": { points: 10, maximum: 20 },
      },
      answers: [
        {
          questionId: "1d61087b-2e8c-4c66-bac1-7b7d75f2855b",
          answerId: "0bf0f5e4-9ff7-4a85-98a3-3e087af4d1f0",
        },
        {
          questionId: "5a4cc455-0e56-47f0-92a5-0ae8ed843d6e",
          answerId: "30e8a748-5517-4d5c-a3cf-0d83702d3c7e",
        },
      ],
    };

    it("reads the survey, the scores and the answers when results is an object", () => {
      expect(toSurveyResult(resultResponse, RESULT_ID)).toEqual(calculated);
    });

    it("reads the same when results is the text of that object", () => {
      expect(
        toSurveyResult(
          { ...resultResponse, results: JSON.stringify(resultCalculation) },
          RESULT_ID,
        ),
      ).toEqual(calculated);
    });

    it("carries nothing else of the reply", () => {
      expect(Object.keys(toSurveyResult(resultResponse, RESULT_ID))).toEqual([
        "id",
        "isCalculated",
        "surveyId",
        "scores",
        "answers",
      ]);
    });

    it("is calculated, without scores, when the list of orientations is empty", () => {
      expect(
        toSurveyResult({ results: { orientations: [] } }, RESULT_ID),
      ).toMatchObject({ isCalculated: true, scores: {} });
      expect(
        toSurveyResult({ results: '{"orientations":[]}' }, RESULT_ID),
      ).toMatchObject({ isCalculated: true, scores: {} });
    });
  });

  describe("given a result that does not hold the calculation", () => {
    it("is not calculated and has no scores when results is null", () => {
      expect(toSurveyResult(pendingResultResponse, RESULT_ID)).toEqual({
        id: RESULT_ID,
        isCalculated: false,
        surveyId: RESULT_SURVEY_ID,
        scores: {},
        answers: resultResponse.answers,
      });
    });

    it("is not calculated and has no scores when results is missing", () => {
      expect(toSurveyResult({}, RESULT_ID)).toEqual(NOTHING_READ);
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
    ])("is not calculated and has no scores when results is %j", (results) => {
      expect(toSurveyResult({ results }, RESULT_ID)).toEqual(NOTHING_READ);
    });
  });

  describe("given orientations that cannot all be read", () => {
    const read = (orientations: unknown[]) =>
      toSurveyResult({ results: { orientations } }, RESULT_ID);

    it("drops an item without an identifier and keeps the others", () => {
      expect(
        read([
          { points: 1, maxPossible: 2 },
          { id: "left", points: 10, maxPossible: 20 },
        ]),
      ).toMatchObject({
        isCalculated: true,
        scores: { left: { points: 10, maximum: 20 } },
      });
    });

    it.each([
      ["points", { id: "bad", points: "10", maxPossible: 20 }],
      ["points", { id: "bad", points: Number.NaN, maxPossible: 20 }],
      [
        "points",
        { id: "bad", points: Number.POSITIVE_INFINITY, maxPossible: 20 },
      ],
      ["maxPossible", { id: "bad", points: 10 }],
      ["maxPossible", { id: "bad", points: 10, maxPossible: null }],
      [
        "maxPossible",
        { id: "bad", points: 10, maxPossible: Number.NEGATIVE_INFINITY },
      ],
    ])("drops an item whose %s is not a finite number: %j", (_, item) => {
      expect(
        read([item, { id: "left", points: 10, maxPossible: 20 }]).scores,
      ).toEqual({ left: { points: 10, maximum: 20 } });
    });

    it("reads negative points and a negative maximum as 0", () => {
      expect(
        read([
          { id: "left", points: -5, maxPossible: 20 },
          { id: "right", points: 5, maxPossible: -20 },
        ]).scores,
      ).toEqual({
        left: { points: 0, maximum: 20 },
        right: { points: 5, maximum: 0 },
      });
    });

    it("keeps the first of the same orientation sent twice", () => {
      expect(
        read([
          { id: "left", points: 10, maxPossible: 20 },
          { id: "left", points: 1, maxPossible: 2 },
        ]).scores,
      ).toEqual({ left: { points: 10, maximum: 20 } });
    });
  });

  describe("given answers that cannot all be read", () => {
    it.each([
      [undefined],
      [null],
      [""],
      ["answers"],
      [7],
      [{}],
      [{ questionId: "q1", answerId: "q1-yes" }],
    ])("has no answers when answers is %j", (answers) => {
      expect(
        toSurveyResult({ ...resultResponse, answers }, RESULT_ID).answers,
      ).toEqual([]);
    });

    it("drops an answer without a question or without an answer, and keeps the others in order", () => {
      expect(
        toSurveyResult(
          {
            answers: [
              { questionId: "q1", answerId: "q1-yes" },
              { answerId: "q2-yes" },
              { questionId: "q3" },
              { questionId: "", answerId: "q4-yes" },
              { questionId: "q5", answerId: "" },
              { questionId: 6, answerId: "q6-yes" },
              { questionId: "q7", answerId: null },
              null,
              "q8",
              { questionId: "q9", answerId: "q9-no", seconds: 4 },
            ],
          },
          RESULT_ID,
        ).answers,
      ).toEqual([
        { questionId: "q1", answerId: "q1-yes" },
        { questionId: "q9", answerId: "q9-no" },
      ]);
    });

    it("keeps two answers to one question as sent", () => {
      const answers = [
        { questionId: "q1", answerId: "q1-yes" },
        { questionId: "q1", answerId: "q1-no" },
      ];

      expect(toSurveyResult({ answers }, RESULT_ID).answers).toEqual(answers);
    });

    it("has its answers before it is calculated", () => {
      expect(
        toSurveyResult(pendingResultResponse, RESULT_ID).answers,
      ).toHaveLength(2);
    });
  });

  describe("given a survey identifier that cannot be read", () => {
    it.each([
      [undefined],
      [null],
      [""],
      ["   "],
      [7],
      [{}],
    ])("names no survey when surveyId is %j", (surveyId) => {
      const result = toSurveyResult({ ...resultResponse, surveyId }, RESULT_ID);

      expect(result.surveyId).toBeUndefined();
      expect(result.isCalculated).toBe(true);
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
    ])("is not calculated and holds nothing for %j", (response) => {
      expect(toSurveyResult(response, RESULT_ID)).toEqual(NOTHING_READ);
    });
  });

  describe("given a reply with an identifier of its own", () => {
    it("returns the identifier it was asked for", () => {
      expect(
        toSurveyResult({ ...resultResponse, id: "another" }, RESULT_ID).id,
      ).toBe(RESULT_ID);
    });
  });
});

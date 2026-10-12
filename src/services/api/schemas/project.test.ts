import { describe, expect, it } from "vitest";

import { projectResponseSchema } from "./project";

const PROJECT_ID = "5ab50822-e95e-4c7c-a1d6-14aceb68f108";
const SURVEY_ID = "60beb898-a4e4-4160-88c4-07a9931ab499";

describe("projectResponseSchema", () => {
  describe("given a project with a latest survey", () => {
    it("accepts the two fields that are read, as sent", () => {
      const project = { id: PROJECT_ID, latestSurveyId: SURVEY_ID };

      expect(projectResponseSchema.parse(project)).toEqual(project);
    });

    it("leaves out the fields that are not carried", () => {
      expect(
        projectResponseSchema.parse({
          id: PROJECT_ID,
          name: "myPolitics Quiz Tożsamościowy",
          latestSurveyId: SURVEY_ID,
          createdAt: "2025-04-28T19:12:01.889Z",
          totalSolvedSurveys: 375_639,
          surveys: [{ id: SURVEY_ID, version: "mp-qt-1" }],
          defaultLanguage: "pl",
          supportedLanguages: ["pl"],
        }),
      ).toEqual({ id: PROJECT_ID, latestSurveyId: SURVEY_ID });
    });
  });

  describe("given a project with no survey to take", () => {
    it("accepts a latest survey that is null", () => {
      expect(
        projectResponseSchema.parse({ id: PROJECT_ID, latestSurveyId: null }),
      ).toEqual({ id: PROJECT_ID, latestSurveyId: null });
    });
  });

  describe("given a reply without an identifier", () => {
    it.each([
      [{ latestSurveyId: SURVEY_ID }],
      [{ id: "", latestSurveyId: SURVEY_ID }],
      [{ id: null, latestSurveyId: SURVEY_ID }],
      [{ id: 7, latestSurveyId: SURVEY_ID }],
    ])("rejects %j", (response) => {
      expect(projectResponseSchema.safeParse(response).success).toBe(false);
    });
  });

  describe("given a latest survey that is neither an identifier nor null", () => {
    it.each([
      [{ id: PROJECT_ID }],
      [{ id: PROJECT_ID, latestSurveyId: undefined }],
      [{ id: PROJECT_ID, latestSurveyId: "" }],
      [{ id: PROJECT_ID, latestSurveyId: 7 }],
      [{ id: PROJECT_ID, latestSurveyId: { id: SURVEY_ID } }],
      [{ id: PROJECT_ID, latestSurveyId: [SURVEY_ID] }],
    ])("rejects %j", (response) => {
      expect(projectResponseSchema.safeParse(response).success).toBe(false);
    });
  });

  describe("given something that is not an object", () => {
    it.each([
      [undefined],
      [null],
      [""],
      ["<html></html>"],
      [7],
      [true],
      [[]],
      [[{ id: PROJECT_ID, latestSurveyId: SURVEY_ID }]],
    ])("rejects %j", (response) => {
      expect(projectResponseSchema.safeParse(response).success).toBe(false);
    });
  });
});

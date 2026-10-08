import { describe, expect, it } from "vitest";

import { QUIZ_SURVEY_IDS } from "@/constants/survey";

import { getSurveyId } from "./getSurveyId";

describe("getSurveyId()", () => {
  describe("given a slug of the map", () => {
    it("returns the identifier of a known slug", () => {
      expect(getSurveyId("mypolitics")).toBe(
        "60beb898-a4e4-4160-88c4-07a9931ab499",
      );
      expect(getSurveyId("prezydencki2025")).toBe(
        "270f6c12-6551-4661-bfcf-52635a703928",
      );
    });

    it("returns an identifier for every slug of the map", () => {
      for (const [slug, surveyId] of Object.entries(QUIZ_SURVEY_IDS)) {
        expect(getSurveyId(slug)).toBe(surveyId);
      }
    });

    it("matches a slug whatever its letter case", () => {
      expect(getSurveyId("MyPolitics")).toBe(QUIZ_SURVEY_IDS.mypolitics);
      expect(getSurveyId("MYPOLITICS")).toBe(QUIZ_SURVEY_IDS.mypolitics);
      expect(getSurveyId("Prezydencki2025")).toBe(
        QUIZ_SURVEY_IDS.prezydencki2025,
      );
    });
  });

  describe("given anything else", () => {
    it("returns undefined for an unknown, empty or missing slug", () => {
      expect(getSurveyId("wyborczy2023")).toBeUndefined();
      expect(getSurveyId("mypolitics ")).toBeUndefined();
      expect(getSurveyId("mypolitics/")).toBeUndefined();
      expect(getSurveyId("")).toBeUndefined();
      expect(getSurveyId(undefined)).toBeUndefined();
      expect(getSurveyId()).toBeUndefined();
    });

    it("returns undefined for a name every object has", () => {
      expect(getSurveyId("constructor")).toBeUndefined();
      expect(getSurveyId("toString")).toBeUndefined();
      expect(getSurveyId("__proto__")).toBeUndefined();
    });
  });
});

import { describe, expect, it } from "vitest";

import {
  ADULT_AGE,
  DEMOGRAPHICS_FIELD_IDS,
  DEMOGRAPHICS_VALUES,
  MAX_CATEGORIES_RATIO,
  MIN_CATEGORIES_FOR_SELECT,
  SURVEY_ANSWER_KINDS,
  SURVEY_PHASES,
  SURVEY_SCALE_ANSWER_KINDS,
  SURVEY_SESSION_CONFIG,
  SURVEY_SESSION_STORAGE_KEY,
  SURVEY_SESSION_VERSION,
} from "./survey";

describe("the constants of the survey session", () => {
  describe("SURVEY_PHASES", () => {
    it("holds the seven phases in their fixed order", () => {
      expect(SURVEY_PHASES).toEqual([
        "category-select",
        "questions",
        "checkpoints",
        "demographics",
        "email-capture",
        "results-calculation",
        "short-results",
      ]);
    });
  });

  describe("DEMOGRAPHICS_VALUES", () => {
    it("has one age per year from 13 to 99, youngest first", () => {
      const { age } = DEMOGRAPHICS_VALUES;

      expect(age).toHaveLength(87);
      expect(age[0]).toBe("13");
      expect(age[1]).toBe("14");
      expect(age.at(-1)).toBe("99");
      expect(age.map(Number)).toEqual(
        Array.from({ length: 87 }, (_, index) => 13 + index),
      );
    });

    it("has no value for an age under 18 as a band", () => {
      expect(DEMOGRAPHICS_VALUES.age).not.toContain("0");
      expect(DEMOGRAPHICS_VALUES.age).not.toContain("12");
      expect(DEMOGRAPHICS_VALUES.age).not.toContain("100");
    });

    it("has the values the API accepts for the other fields, in the order shown", () => {
      expect(DEMOGRAPHICS_VALUES.gender).toEqual([
        "female",
        "male",
        "other",
        "prefer_not_to_share",
      ]);
      expect(DEMOGRAPHICS_VALUES.residenceAreaSize).toEqual([
        "village",
        "city_below_50k",
        "city_below_200k",
        "city_below_500k",
        "city_over_500k",
      ]);
      expect(DEMOGRAPHICS_VALUES.education).toEqual([
        "primary",
        "basic_vocational",
        "secondary",
        "higher",
      ]);
    });

    it("has a list for each of the four fields and for nothing else", () => {
      expect(Object.keys(DEMOGRAPHICS_VALUES)).toEqual([
        ...DEMOGRAPHICS_FIELD_IDS,
      ]);
      expect(DEMOGRAPHICS_FIELD_IDS).toEqual([
        "age",
        "gender",
        "residenceAreaSize",
        "education",
      ]);
    });
  });

  describe("the kinds of an answer", () => {
    it("draws the scale first, from full agreement to full disagreement", () => {
      expect(SURVEY_ANSWER_KINDS).toEqual([
        "strongly-agree",
        "agree",
        "disagree",
        "strongly-disagree",
        "custom",
      ]);
    });

    it("reads six texts as steps of the scale", () => {
      expect([...SURVEY_SCALE_ANSWER_KINDS]).toEqual([
        ["zdecydowanie za", "strongly-agree"],
        ["częściowo za", "agree"],
        ["za", "agree"],
        ["częściowo przeciw", "disagree"],
        ["przeciw", "disagree"],
        ["zdecydowanie przeciw", "strongly-disagree"],
      ]);
    });
  });

  describe("the settings of a session", () => {
    it("lets half of the visible categories be picked, in a quiz with at least two", () => {
      expect(MAX_CATEGORIES_RATIO).toBe(0.5);
      expect(MIN_CATEGORIES_FOR_SELECT).toBe(2);
    });

    it("draws the line of adulthood at 18", () => {
      expect(ADULT_AGE).toBe(18);
    });

    it("has the e-mail phase switched off", () => {
      expect(SURVEY_SESSION_CONFIG).toEqual({ isEmailSendingSetUp: false });
    });

    it("names the stored record and its version", () => {
      expect(SURVEY_SESSION_STORAGE_KEY).toBe("mypolitics:survey-session");
      expect(SURVEY_SESSION_VERSION).toBe(1);
    });
  });
});

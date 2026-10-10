import { describe, expect, it } from "vitest";

import { createSurveyCategory } from "@/utils/vitest/createSurveyCategory";

import { getQuestionMultiplier } from "./getQuestionMultiplier";

describe("getQuestionMultiplier()", () => {
  const categories = [
    createSurveyCategory("views", { weight: 1.25 }),
    createSurveyCategory("economy", { weight: 2 }),
  ];

  describe("given a question whose category is in prioritizedCategoryIds", () => {
    it("returns the weight of the category", () => {
      expect(
        getQuestionMultiplier({ categoryId: "views" }, categories, ["views"]),
      ).toBe(1.25);
      expect(
        getQuestionMultiplier({ categoryId: "economy" }, categories, [
          "views",
          "economy",
        ]),
      ).toBe(2);
    });
  });

  describe("given a question in a category that is not prioritised", () => {
    it("returns 1", () => {
      expect(
        getQuestionMultiplier({ categoryId: "views" }, categories, ["economy"]),
      ).toBe(1);
      expect(
        getQuestionMultiplier({ categoryId: "views" }, categories, []),
      ).toBe(1);
    });
  });

  describe("given a question with no category", () => {
    it("returns 1", () => {
      expect(getQuestionMultiplier({}, categories, ["views"])).toBe(1);
    });
  });

  describe("given a category weight that is missing, not a number, zero or negative", () => {
    it.each([
      ["missing", undefined],
      ["not a number", Number.NaN],
      ["zero", 0],
      ["negative", -1.25],
    ])("returns 1 for a weight that is %s", (_name, weight) => {
      expect(
        getQuestionMultiplier(
          { categoryId: "views" },
          [createSurveyCategory("views", { weight: weight as number })],
          ["views"],
        ),
      ).toBe(1);
    });
  });

  describe("given a prioritised category the quiz does not have", () => {
    it("ignores it", () => {
      expect(
        getQuestionMultiplier({ categoryId: "views" }, categories, ["ghost"]),
      ).toBe(1);
      expect(
        getQuestionMultiplier({ categoryId: "ghost" }, categories, ["ghost"]),
      ).toBe(1);
    });
  });
});

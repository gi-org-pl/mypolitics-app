import { describe, expect, it } from "vitest";

import { createSurvey } from "@/utils/vitest/survey/createSurvey";
import { createSurveyCategory } from "@/utils/vitest/survey/createSurveyCategory";

import { getVisibleCategories } from "./getVisibleCategories";

describe("getVisibleCategories()", () => {
  describe("given a quiz with categories that cannot be shown", () => {
    it("leaves out a hidden category and a category without a name", () => {
      const survey = createSurvey({
        categories: [
          createSurveyCategory("named"),
          createSurveyCategory("hidden", { isHidden: true }),
          createSurveyCategory("unnamed", { name: undefined }),
          createSurveyCategory("empty", { name: "" }),
          createSurveyCategory("blank", { name: "   " }),
        ],
      });

      expect(getVisibleCategories(survey).map(({ id }) => id)).toEqual([
        "named",
      ]);
    });

    it("leaves out the hidden category of the test quiz", () => {
      expect(
        getVisibleCategories(createSurvey()).map(({ name }) => name),
      ).toEqual(["Gospodarka", "Ekologia"]);
    });
  });

  describe("given a quiz whose categories can all be shown", () => {
    it("keeps the order of the quiz", () => {
      const survey = createSurvey({
        categories: ["c", "a", "b"].map((id) => createSurveyCategory(id)),
      });

      expect(getVisibleCategories(survey).map(({ id }) => id)).toEqual([
        "c",
        "a",
        "b",
      ]);
    });

    it("keeps two categories with the same name", () => {
      const survey = createSurvey({
        categories: [
          createSurveyCategory("a", { name: "Gospodarka" }),
          createSurveyCategory("b", { name: "Gospodarka" }),
        ],
      });

      expect(getVisibleCategories(survey)).toHaveLength(2);
    });

    it("returns the categories as the quiz holds them", () => {
      const survey = createSurvey();

      expect(getVisibleCategories(survey)[0]).toBe(survey.categories[0]);
    });
  });

  describe("given a quiz without categories", () => {
    it("returns an empty list", () => {
      expect(getVisibleCategories(createSurvey({ categories: [] }))).toEqual(
        [],
      );
    });
  });
});

import { describe, expect, it } from "vitest";
import { createSession } from "@/utils/survey/session/createSession";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { createSurveyCategory } from "@/utils/vitest/createSurveyCategory";
import { setSessionCategories } from "./setSessionCategories";

// Five visible categories and a hidden one: the limit is three.
const survey = createSurvey({
  categories: [
    ...["a", "b", "c", "d", "e"].map((id) => createSurveyCategory(id)),
    createSurveyCategory("hidden", { isHidden: true }),
  ],
});

describe("setSessionCategories()", () => {
  describe("when the session is on category select", () => {
    it("keeps visible categories, once each, in the order given", () => {
      const session = setSessionCategories(survey, createSession(survey), [
        "c",
        "hidden",
        "a",
        "c",
        "unknown",
      ]);

      expect(session.prioritizedCategoryIds).toEqual(["c", "a"]);
    });

    it("cuts the categories to the limit", () => {
      const session = setSessionCategories(survey, createSession(survey), [
        "a",
        "b",
        "c",
        "d",
      ]);

      expect(session.prioritizedCategoryIds).toEqual(["a", "b", "c"]);
    });

    it("replaces the categories that were picked, so that a category can be dropped", () => {
      const picked = setSessionCategories(survey, createSession(survey), [
        "a",
        "b",
      ]);

      expect(
        setSessionCategories(survey, picked, ["b"]).prioritizedCategoryIds,
      ).toEqual(["b"]);
      expect(
        setSessionCategories(survey, picked, []).prioritizedCategoryIds,
      ).toEqual([]);
    });

    it("confirms nothing and stays on category select", () => {
      const session = setSessionCategories(survey, createSession(survey), [
        "a",
      ]);

      expect(session.areCategoriesConfirmed).toBe(false);
      expect(session.phase).toBe("category-select");
    });
  });

  describe("when the session is anywhere else", () => {
    it("changes nothing outside category select", () => {
      const onQuestions = createStartedSession(survey, 1);
      const onDemographics = createStartedSession(survey, 5);

      expect(setSessionCategories(survey, onQuestions, ["a"])).toBe(
        onQuestions,
      );
      expect(setSessionCategories(survey, onDemographics, ["a"])).toBe(
        onDemographics,
      );
    });
  });
});

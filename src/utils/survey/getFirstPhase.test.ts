import { describe, expect, it } from "vitest";

import { createSurvey } from "@/utils/vitest/createSurvey";
import { createSurveyCategory } from "@/utils/vitest/createSurveyCategory";

import { getFirstPhase } from "./getFirstPhase";

describe("getFirstPhase()", () => {
  describe("given a quiz with topics to pick", () => {
    it("is category-select for a quiz with two visible categories", () => {
      expect(getFirstPhase(createSurvey())).toBe("category-select");
    });

    it("is category-select for a quiz with more of them", () => {
      const survey = createSurvey({
        categories: ["a", "b", "c", "d", "e"].map((id) =>
          createSurveyCategory(id),
        ),
      });

      expect(getFirstPhase(survey)).toBe("category-select");
    });
  });

  describe("given a quiz with nothing to pick from", () => {
    it("is questions for a quiz with one visible category, or none", () => {
      expect(
        getFirstPhase(
          createSurvey({ categories: [createSurveyCategory("only")] }),
        ),
      ).toBe("questions");
      expect(getFirstPhase(createSurvey({ categories: [] }))).toBe("questions");
    });

    it("is questions when all categories but one are hidden or unnamed", () => {
      const survey = createSurvey({
        categories: [
          createSurveyCategory("visible"),
          createSurveyCategory("hidden", { isHidden: true }),
          createSurveyCategory("unnamed", { name: undefined }),
        ],
      });

      expect(getFirstPhase(survey)).toBe("questions");
    });
  });
});

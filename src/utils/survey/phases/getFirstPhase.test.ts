import { describe, expect, it } from "vitest";

import type { Survey } from "@/types/survey";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";
import { createSurveyCategory } from "@/utils/vitest/survey/createSurveyCategory";

import { getFirstPhase } from "./getFirstPhase";

const createQuiz = (visible: number): Survey =>
  createSurvey({
    categories: Array.from({ length: visible }, (_, index) =>
      createSurveyCategory(`visible-${index}`),
    ),
  });

describe("getFirstPhase()", () => {
  describe("given a quiz with categories to pick", () => {
    it("is category-select for the test quiz, which has two visible categories", () => {
      expect(getFirstPhase(createSurvey())).toBe("category-select");
    });

    it.each([
      2, 3, 5, 7,
    ])("is category-select for a quiz with %i visible categories", (visible) => {
      expect(getFirstPhase(createQuiz(visible))).toBe("category-select");
    });
  });

  describe("given a quiz with nothing to pick from", () => {
    it("is questions for a quiz with one visible category", () => {
      expect(getFirstPhase(createQuiz(1))).toBe("questions");
    });

    it("is questions for a quiz with no category", () => {
      expect(getFirstPhase(createQuiz(0))).toBe("questions");
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

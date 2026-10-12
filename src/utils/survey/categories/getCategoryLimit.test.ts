import { describe, expect, it } from "vitest";

import type { Survey } from "@/types/survey";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { createSurveyCategory } from "@/utils/vitest/createSurveyCategory";

import { getCategoryLimit } from "./getCategoryLimit";

const createQuiz = (visible: number, hidden = 0): Survey =>
  createSurvey({
    categories: [
      ...Array.from({ length: visible }, (_, index) =>
        createSurveyCategory(`visible-${index}`),
      ),
      ...Array.from({ length: hidden }, (_, index) =>
        createSurveyCategory(`hidden-${index}`, { isHidden: true }),
      ),
    ],
  });

describe("getCategoryLimit()", () => {
  describe("given a quiz with at least two visible categories", () => {
    it.each([
      [2, 1],
      [3, 2],
      [4, 2],
      [5, 3],
      [6, 3],
      [7, 4],
      [9, 5],
      [12, 6],
    ])("is half of %i visible categories, rounded: %i", (visible, limit) => {
      expect(getCategoryLimit(createQuiz(visible))).toBe(limit);
    });

    it("rounds a half up, so an odd number gives the larger half", () => {
      expect(getCategoryLimit(createQuiz(3))).toBe(2);
      expect(getCategoryLimit(createQuiz(11))).toBe(6);
    });

    it("always leaves a category unpicked", () => {
      for (const visible of [2, 3, 4, 5, 8, 13]) {
        expect(getCategoryLimit(createQuiz(visible))).toBeLessThan(visible);
      }
    });
  });

  describe("given a quiz with fewer than two visible categories", () => {
    it("is 0 for one, where half would round to one", () => {
      expect(getCategoryLimit(createQuiz(1))).toBe(0);
    });

    it("is 0 for none", () => {
      expect(getCategoryLimit(createQuiz(0))).toBe(0);
    });
  });

  describe("given categories that are not visible", () => {
    it("does not count hidden categories", () => {
      expect(getCategoryLimit(createQuiz(5, 4))).toBe(3);
      expect(getCategoryLimit(createQuiz(2, 5))).toBe(1);
      expect(getCategoryLimit(createQuiz(1, 5))).toBe(0);
      expect(getCategoryLimit(createQuiz(0, 5))).toBe(0);
    });

    it("does not count a category without a name", () => {
      const survey = createSurvey({
        categories: [
          createSurveyCategory("a"),
          createSurveyCategory("b"),
          createSurveyCategory("c"),
          createSurveyCategory("unnamed", { name: undefined }),
          createSurveyCategory("blank", { name: "  " }),
        ],
      });

      expect(getCategoryLimit(survey)).toBe(2);
    });

    it("is 1 for the test quiz, which has two visible categories", () => {
      expect(getCategoryLimit(createSurvey())).toBe(1);
    });
  });
});

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
  describe("given a quiz with many visible categories", () => {
    it("is 3 for four or more visible categories", () => {
      expect(getCategoryLimit(createQuiz(4))).toBe(3);
      expect(getCategoryLimit(createQuiz(5))).toBe(3);
      expect(getCategoryLimit(createQuiz(12))).toBe(3);
    });
  });

  describe("given a quiz with few visible categories", () => {
    it("is 2 for three and 1 for two", () => {
      expect(getCategoryLimit(createQuiz(3))).toBe(2);
      expect(getCategoryLimit(createQuiz(2))).toBe(1);
    });

    it("is 0 for one or none", () => {
      expect(getCategoryLimit(createQuiz(1))).toBe(0);
      expect(getCategoryLimit(createQuiz(0))).toBe(0);
    });
  });

  describe("given categories that are not visible", () => {
    it("does not count them", () => {
      expect(getCategoryLimit(createQuiz(2, 5))).toBe(1);
      expect(getCategoryLimit(createQuiz(1, 5))).toBe(0);
      expect(getCategoryLimit(createQuiz(0, 5))).toBe(0);
    });

    it("is 1 for the test quiz, which has two visible categories", () => {
      expect(getCategoryLimit(createSurvey())).toBe(1);
    });
  });
});

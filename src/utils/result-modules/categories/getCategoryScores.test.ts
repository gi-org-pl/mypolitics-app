import { describe, expect, it } from "vitest";

import {
  moduleQuiz,
  moduleQuizResult,
} from "@/utils/result-modules/resolveResult.fixtures";
import { createSurveyCategory } from "@/utils/vitest/survey/createSurveyCategory";

import { getCategoryScores } from "./getCategoryScores";

const { answers } = moduleQuizResult;

describe("getCategoryScores()", () => {
  describe("given a category of the quiz", () => {
    it("counts the questions of that category alone", () => {
      const scores = getCategoryScores(moduleQuiz, answers, "society");

      // q3 and q4: the socialist is fed by q3 only, the liberal by both.
      expect(scores.socialist).toEqual({ points: 1, maximum: 1, value: 100 });
      expect(scores.liberal).toEqual({ points: 1, maximum: 2, value: 50 });
      expect(scores.progress).toEqual({ points: 2, maximum: 2, value: 100 });
      expect(scores.tradition).toEqual({ points: 0, maximum: 2, value: 0 });
    });

    it("gives an orientation no question of the category feeds no value", () => {
      const scores = getCategoryScores(moduleQuiz, answers, "society");

      expect(scores.left).toEqual({ points: 0, maximum: 0, value: undefined });
      expect(scores["party-left"].value).toBeUndefined();
    });

    it("has a score for every orientation of the quiz", () => {
      expect(
        Object.keys(getCategoryScores(moduleQuiz, answers, "economy")),
      ).toEqual(moduleQuiz.orientations.map(({ id }) => id));
    });

    it("counts a question the result leaves against its full maximum", () => {
      expect(getCategoryScores(moduleQuiz, answers, "control").calm).toEqual({
        points: 0,
        maximum: 1,
        value: 0,
      });
      expect(getCategoryScores(moduleQuiz, [], "economy").socialist).toEqual({
        points: 0,
        maximum: 3,
        value: 0,
      });
    });
  });

  describe("given a category with a weight", () => {
    it("gives the same values: no category is prioritised, so the weight is not applied", () => {
      const weightedQuiz = {
        ...moduleQuiz,
        categories: [createSurveyCategory("economy", { weight: 1.25 })],
      };

      expect(
        getCategoryScores(weightedQuiz, answers, "economy").socialist,
      ).toEqual({ points: 3, maximum: 3, value: 100 });
    });
  });

  describe("given a category the quiz has no question in", () => {
    it("gives no orientation a value", () => {
      const scores = getCategoryScores(moduleQuiz, answers, "ghost");

      expect(Object.values(scores).map(({ value }) => value)).toEqual(
        moduleQuiz.orientations.map(() => undefined),
      );
    });
  });
});

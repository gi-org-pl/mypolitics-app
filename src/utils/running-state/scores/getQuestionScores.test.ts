import { describe, expect, it } from "vitest";
import { workedQuiz } from "@/utils/running-state/getRunningState.fixtures";

import { getOrientationIds } from "@/utils/running-state/orientations/getOrientationIds";
import { createScoredQuestion } from "@/utils/vitest/survey/createScoredQuestion";
import { getQuestionScores } from "./getQuestionScores";

describe("getQuestionScores()", () => {
  const orientationIds = getOrientationIds(workedQuiz);
  const [question] = workedQuiz.questions;
  const [a1, a2, , a4] = question.possibleAnswers;

  describe("given an answered question", () => {
    it("gives the weight of the answer to every orientation it lists", () => {
      expect(
        getQuestionScores({ question, answer: a1 }, 1, orientationIds),
      ).toEqual({
        x: { points: 2, maximum: 2 },
        y: { points: 2, maximum: 2 },
        z: { points: 0, maximum: 4 },
      });
    });

    it("gives no points to an orientation the answer does not list", () => {
      expect(
        getQuestionScores({ question, answer: a4 }, 1, orientationIds),
      ).toEqual({
        x: { points: 0, maximum: 2 },
        y: { points: 0, maximum: 2 },
        z: { points: 4, maximum: 4 },
      });
    });

    it("multiplies points and maximum by the multiplier", () => {
      expect(
        getQuestionScores({ question, answer: a2 }, 1.25, orientationIds),
      ).toEqual({
        x: { points: 1.25, maximum: 2.5 },
        y: { points: 0, maximum: 2.5 },
        z: { points: 0, maximum: 5 },
      });
    });
  });

  describe("given a skipped question", () => {
    it("gives no points and the full maximum", () => {
      expect(getQuestionScores({ question }, 1.25, orientationIds)).toEqual({
        x: { points: 0, maximum: 2.5 },
        y: { points: 0, maximum: 2.5 },
        z: { points: 0, maximum: 5 },
      });
    });
  });

  describe("given an answer that lists an orientation twice, and one the quiz does not have", () => {
    it("counts the first once and drops the second", () => {
      const doubled = createScoredQuestion("q", [[3, ["x", "x", "ghost"]]]);

      expect(
        getQuestionScores(
          { question: doubled, answer: doubled.possibleAnswers[0] },
          1,
          orientationIds,
        ),
      ).toEqual({ x: { points: 3, maximum: 3 } });
    });
  });

  describe("given an answer whose weight does not count", () => {
    it("gives no points", () => {
      const weightless = createScoredQuestion("q", [
        [-2, ["x"]],
        [2, ["x"]],
      ]);

      expect(
        getQuestionScores(
          { question: weightless, answer: weightless.possibleAnswers[0] },
          1,
          orientationIds,
        ),
      ).toEqual({ x: { points: 0, maximum: 2 } });
    });
  });

  describe("given a question with no possible answers", () => {
    it("adds nothing", () => {
      expect(
        getQuestionScores(
          { question: createScoredQuestion("q", []) },
          1,
          orientationIds,
        ),
      ).toEqual({});
    });
  });
});

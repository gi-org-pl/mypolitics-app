import { describe, expect, it } from "vitest";

import { createDoneQuestions } from "@/utils/vitest/createDoneQuestions";

import { getDoneQuestions } from "./getDoneQuestions";
import { getRunningScores } from "./getRunningScores";
import {
  calculatorCases,
  toCalculatorQuiz,
  workedAnswerIds,
  workedPrioritizedCategoryIds,
  workedQuiz,
} from "./getRunningState.fixtures";

const getScores = (
  answerIds: (string | undefined)[],
  prioritizedCategoryIds: string[] = [],
) =>
  getRunningScores(
    workedQuiz,
    createDoneQuestions(workedQuiz, answerIds),
    prioritizedCategoryIds,
  );

describe("getRunningScores()", () => {
  describe("given one question, not prioritised", () => {
    it("gives X 2 of 2, Y 2 of 2, Z 0 of 4 when A1 is chosen", () => {
      expect(getScores(["q1-a1"])).toMatchObject({
        x: { points: 2, maximum: 2, value: 100 },
        y: { points: 2, maximum: 2, value: 100 },
        z: { points: 0, maximum: 4, value: 0 },
      });
    });

    it("gives X 1 of 2, Y 0 of 2, Z 0 of 4 when A2 is chosen", () => {
      expect(getScores(["q1-a2"])).toMatchObject({
        x: { points: 1, maximum: 2, value: 50 },
        y: { points: 0, maximum: 2, value: 0 },
        z: { points: 0, maximum: 4, value: 0 },
      });
    });

    it("gives X 0 of 2, Y 0 of 2, Z 4 of 4 when A4 is chosen", () => {
      expect(getScores(["q1-a4"])).toMatchObject({
        x: { points: 0, maximum: 2, value: 0 },
        y: { points: 0, maximum: 2, value: 0 },
        z: { points: 4, maximum: 4, value: 100 },
      });
    });

    it("gives 0 points and the full maximum when the question is skipped", () => {
      expect(getScores([undefined])).toMatchObject({
        x: { points: 0, maximum: 2, value: 0 },
        y: { points: 0, maximum: 2, value: 0 },
        z: { points: 0, maximum: 4, value: 0 },
      });
    });

    it("gives 0 of 0 and no value when the question is not done", () => {
      expect(getScores([])).toEqual({
        x: { points: 0, maximum: 0, value: undefined },
        y: { points: 0, maximum: 0, value: undefined },
        z: { points: 0, maximum: 0, value: undefined },
        u: { points: 0, maximum: 0, value: undefined },
      });
    });
  });

  describe("given the category is prioritised with weight 1.25", () => {
    it("gives X 1.25 of 2.5, Y 0 of 2.5, Z 0 of 5 when A2 is chosen", () => {
      expect(getScores(["q1-a2"], ["views"])).toMatchObject({
        x: { points: 1.25, maximum: 2.5, value: 50 },
        y: { points: 0, maximum: 2.5, value: 0 },
        z: { points: 0, maximum: 5, value: 0 },
      });
    });

    it("gives 0 of 2.5, 0 of 2.5, 0 of 5 when the question is skipped", () => {
      expect(getScores([undefined], ["views"])).toMatchObject({
        x: { points: 0, maximum: 2.5 },
        y: { points: 0, maximum: 2.5 },
        z: { points: 0, maximum: 5 },
      });
    });
  });

  describe("given the three done questions of the spec", () => {
    const scores = getScores(workedAnswerIds, workedPrioritizedCategoryIds);

    it("gives X 4.75 of 5.75 with a value of 4.75 / 5.75 x 100", () => {
      expect(scores.x).toEqual({
        points: 4.75,
        maximum: 5.75,
        value: (4.75 / 5.75) * 100,
      });
      expect(scores.x.value).toBeCloseTo(82.6, 1);
    });

    it("gives Y 0 of 4 with a value of 0", () => {
      expect(scores.y).toEqual({ points: 0, maximum: 4, value: 0 });
    });

    it("gives Z 0 of 7.25 with a value of 0", () => {
      expect(scores.z).toEqual({ points: 0, maximum: 7.25, value: 0 });
    });

    it("gives an orientation none of them feeds 0 of 0 and no value", () => {
      expect(scores.u).toEqual({ points: 0, maximum: 0, value: undefined });
    });
  });

  describe("when the last entry is removed", () => {
    it("takes away everything that question added", () => {
      expect(getScores(["q1-a2", "q2-a1"].slice(0, -1))).toEqual(
        getScores(["q1-a2"]),
      );
      expect(getScores(["q1-a2", "q2-a1"]).x.points).toBe(4);
      expect(getScores(["q1-a2"]).x.points).toBe(1);
    });
  });

  describe("when every question of the quiz is done", () => {
    it.each(
      calculatorCases,
    )("equals points and maxPossible of the back-end calculator case: $name", (calculatorCase) => {
      const quiz = toCalculatorQuiz(calculatorCase);
      const scores = getRunningScores(
        quiz,
        getDoneQuestions(quiz, calculatorCase.answers),
        calculatorCase.userPrioritizedCategories,
      );

      expect(
        Object.entries(scores).map(([id, { points, maximum }]) => ({
          id,
          points,
          maxPossible: maximum,
        })),
      ).toEqual(calculatorCase.expected);
    });
  });

  it("never rounds a value", () => {
    const { value } = getScores(
      ["q1-a2", "q2-a1"],
      workedPrioritizedCategoryIds,
    ).x;

    expect(value).toBe((4.75 / 5.75) * 100);
    expect(value).not.toBe(Math.round(value ?? 0));
  });

  it("has an entry for every orientation of the quiz", () => {
    expect(Object.keys(getScores([]))).toEqual(["x", "y", "z", "u"]);
    expect(Object.keys(getScores(workedAnswerIds))).toEqual([
      "x",
      "y",
      "z",
      "u",
    ]);
  });

  it("leaves a prioritised category the quiz does not have without effect", () => {
    expect(getScores(workedAnswerIds, ["ghost"])).toEqual(
      getScores(workedAnswerIds),
    );
  });
});

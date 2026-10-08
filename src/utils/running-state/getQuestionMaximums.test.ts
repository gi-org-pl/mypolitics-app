import { describe, expect, it } from "vitest";

import { createScoredQuestion } from "@/utils/vitest/createScoredQuestion";

import { getOrientationIds } from "./getOrientationIds";
import { getQuestionMaximums } from "./getQuestionMaximums";
import { workedQuiz } from "./getRunningState.fixtures";

describe("getQuestionMaximums()", () => {
  const orientationIds = getOrientationIds(workedQuiz);

  describe("given the question A1-A4 of the spec", () => {
    it("returns 2 for X, 2 for Y and 4 for Z", () => {
      const maximums = getQuestionMaximums(
        workedQuiz.questions[0],
        orientationIds,
      );

      expect(Object.fromEntries(maximums)).toEqual({ x: 2, y: 2, z: 4 });
    });
  });

  describe("given an answer that lists an orientation twice", () => {
    it("counts it once", () => {
      const maximums = getQuestionMaximums(
        createScoredQuestion("q", [[3, ["x", "x"]]]),
        orientationIds,
      );

      expect(Object.fromEntries(maximums)).toEqual({ x: 3 });
    });
  });

  describe("given a weight that is missing, not a number, zero or negative", () => {
    it("counts it as zero", () => {
      const maximums = getQuestionMaximums(
        createScoredQuestion("q", [
          [undefined as unknown as number, ["x"]],
          [Number.NaN, ["y"]],
          [0, ["z"]],
          [-4, ["u"]],
        ]),
        orientationIds,
      );

      expect(Object.fromEntries(maximums)).toEqual({ x: 0, y: 0, z: 0, u: 0 });
    });

    it("keeps the highest of the weights that do count", () => {
      const maximums = getQuestionMaximums(
        createScoredQuestion("q", [
          [-4, ["x"]],
          [2, ["x"]],
          [Number.NaN, ["x"]],
        ]),
        orientationIds,
      );

      expect(maximums.get("x")).toBe(2);
    });
  });

  describe("given an answer that lists an orientation the quiz does not have", () => {
    it("drops the reference and keeps the rest of the answer", () => {
      const maximums = getQuestionMaximums(
        createScoredQuestion("q", [[2, ["ghost", "x"]]]),
        orientationIds,
      );

      expect(Object.fromEntries(maximums)).toEqual({ x: 2 });
    });
  });

  describe("given a question with no possible answers", () => {
    it("returns nothing", () => {
      expect(
        getQuestionMaximums(createScoredQuestion("q", []), orientationIds).size,
      ).toBe(0);
    });
  });
});

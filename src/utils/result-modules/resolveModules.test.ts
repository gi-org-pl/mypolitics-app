import { describe, expect, it } from "vitest";

import type { QuizResult, ResolvedModule } from "@/types/results";

import { resolveModules } from "./resolveModules";
import { resolveResult } from "./resolveResult";
import { moduleQuiz, moduleQuizResult } from "./resolveResult.fixtures";

// A result of the same quiz that leads to the other identity: the liberal.
const otherResult: QuizResult = {
  scores: {
    socialist: { points: 0, maximum: 4 },
    liberal: { points: 5, maximum: 5 },
    left: { points: 0, maximum: 3 },
    right: { points: 3, maximum: 3 },
    "party-left": { points: 1, maximum: 4 },
    "party-green": { points: 3, maximum: 4 },
    "party-right": { points: 4, maximum: 4 },
  },
  answers: [],
};

const findParties = (modules: ResolvedModule[]) =>
  modules.find(
    (module): module is Extract<ResolvedModule, { entries: unknown[] }> =>
      module.id === "parties",
  );

describe("resolveModules()", () => {
  describe("given a result and its own leader", () => {
    it("returns the modules the result is drawn with, in the order of the quiz", () => {
      const { leader, modules } = resolveResult(moduleQuiz, moduleQuizResult);

      expect(
        resolveModules({
          survey: moduleQuiz,
          result: moduleQuizResult,
          leader,
        }),
      ).toEqual(modules);
      expect(modules.map(({ id }) => id)).toEqual([
        "identity",
        "ecology",
        "economy",
        "ideologies",
        "parties",
        "compass",
        "traits",
      ]);
    });
  });

  describe("given a second result and the leader of the first", () => {
    const { leader } = resolveResult(moduleQuiz, moduleQuizResult);

    it("keeps the rows a list tied to the leader has for the first, with the values of the second", () => {
      const parties = findParties(
        resolveModules({ survey: moduleQuiz, result: otherResult, leader }),
      );

      expect(
        parties?.entries.map(({ orientation, value }) => [
          orientation.id,
          value,
        ]),
      ).toEqual([
        ["party-green", 75],
        ["party-left", 25],
      ]);
    });

    it("differs from the second result resolved on its own, which lists the rows of its own leader", () => {
      const parties = findParties(
        resolveResult(moduleQuiz, otherResult).modules,
      );

      expect(parties?.entries.map(({ orientation }) => orientation.id)).toEqual(
        ["party-right"],
      );
    });
  });

  describe("given no leader", () => {
    it("leaves out a module that is tied to one", () => {
      expect(
        findParties(
          resolveModules({ survey: moduleQuiz, result: moduleQuizResult }),
        ),
      ).toBeUndefined();
    });
  });
});

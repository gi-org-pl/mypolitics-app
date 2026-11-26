import { describe, expect, it } from "vitest";

import type { ResultAnswer } from "@/types/results";
import {
  moduleQuiz,
  moduleQuizResult,
} from "@/utils/result-modules/resolveResult.fixtures";

import { getEarnedTraitIds } from "./getEarnedTraitIds";
import { getShownOrientations } from "./getShownOrientations";

// q1 and q2 feed "brave", q5 feeds "calm", and no question feeds a party.
const traits = getShownOrientations(["calm", "brave", "party-left"], {
  survey: moduleQuiz,
});

const getEarned = (answers: ResultAnswer[]): string[] =>
  getEarnedTraitIds(traits, {
    survey: moduleQuiz,
    result: { scores: {}, answers },
  });

describe("getEarnedTraitIds()", () => {
  describe("given a trait that scored all it could in the whole quiz", () => {
    it("returns its identifier", () => {
      expect(getEarned(moduleQuizResult.answers)).toEqual(["brave"]);
    });

    it("returns the earned traits in the order given", () => {
      expect(
        getEarned([
          ...moduleQuizResult.answers,
          { questionId: "q5", answerId: "q5-a1" },
        ]),
      ).toEqual(["calm", "brave"]);
    });
  });

  describe("given a trait with a question that feeds it left unanswered", () => {
    it("does not return it", () => {
      expect(getEarned([{ questionId: "q1", answerId: "q1-a1" }])).toEqual([]);
    });
  });

  describe("given a trait with a question answered against it", () => {
    it("does not return it", () => {
      expect(
        getEarned([
          { questionId: "q1", answerId: "q1-a1" },
          { questionId: "q2", answerId: "q2-a2" },
        ]),
      ).toEqual([]);
    });
  });

  describe("given a trait no question feeds", () => {
    it("does not return it", () => {
      expect(getEarned(moduleQuizResult.answers)).not.toContain("party-left");
    });
  });

  describe("given no traits, or no answers", () => {
    it("returns an empty list", () => {
      expect(
        getEarnedTraitIds([], { survey: moduleQuiz, result: moduleQuizResult }),
      ).toEqual([]);
      expect(getEarned([])).toEqual([]);
    });
  });
});

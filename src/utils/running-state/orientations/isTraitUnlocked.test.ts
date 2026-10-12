import { describe, expect, it } from "vitest";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { createDoneQuestions } from "@/utils/vitest/survey/createDoneQuestions";
import { createScoredQuestion } from "@/utils/vitest/survey/createScoredQuestion";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";

import { getOrientationIds } from "./getOrientationIds";
import { isTraitUnlocked } from "./isTraitUnlocked";

// q1 and q3 feed "brave"; q2 does not.
const quiz = createSurvey({
  orientations: [
    createOrientation("brave", "Odważny"),
    createOrientation("other", "Inny"),
    createOrientation("unfed", "Bez pytań"),
  ],
  questions: [
    createScoredQuestion("q1", [
      [2, ["brave"]],
      [1, ["brave", "ghost"]],
      [2, ["other"]],
    ]),
    createScoredQuestion("q2", [[1, ["other"]]]),
    createScoredQuestion("q3", [
      [4, ["brave", "brave"]],
      [4, ["other"]],
    ]),
  ],
});

const isUnlocked = (
  traitId: string,
  answerIds: (string | undefined)[],
): boolean =>
  isTraitUnlocked(
    traitId,
    quiz,
    createDoneQuestions(quiz, answerIds),
    getOrientationIds(quiz),
  );

describe("isTraitUnlocked()", () => {
  describe("given every question that feeds the trait is answered with its highest weight", () => {
    it("returns true", () => {
      expect(isUnlocked("brave", ["q1-a1", "q2-a1", "q3-a1"])).toBe(true);
    });

    it("returns true whatever was done with a question that does not feed it", () => {
      expect(isUnlocked("brave", ["q1-a1", undefined, "q3-a1"])).toBe(true);
    });
  });

  describe("given a question that feeds the trait is left", () => {
    it("returns false", () => {
      expect(isUnlocked("brave", ["q1-a1", "q2-a1"])).toBe(false);
      expect(isUnlocked("brave", [])).toBe(false);
    });
  });

  describe("given a question that feeds the trait is skipped", () => {
    it("returns false", () => {
      expect(isUnlocked("brave", ["q1-a1", "q2-a1", undefined])).toBe(false);
    });
  });

  describe("given an answer that lists the trait with a lower weight", () => {
    it("returns false", () => {
      expect(isUnlocked("brave", ["q1-a2", "q2-a1", "q3-a1"])).toBe(false);
    });
  });

  describe("given an answer that does not list the trait", () => {
    it("returns false", () => {
      expect(isUnlocked("brave", ["q1-a3", "q2-a1", "q3-a1"])).toBe(false);
    });
  });

  describe("given an orientation no question feeds", () => {
    it("returns false", () => {
      expect(isUnlocked("unfed", ["q1-a1", "q2-a1", "q3-a1"])).toBe(false);
      expect(isUnlocked("ghost", ["q1-a2", "q2-a1", "q3-a1"])).toBe(false);
    });
  });
});

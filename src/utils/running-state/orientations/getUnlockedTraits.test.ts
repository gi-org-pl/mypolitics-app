import { describe, expect, it } from "vitest";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { createDoneQuestions } from "@/utils/vitest/survey/createDoneQuestions";
import { createScoredQuestion } from "@/utils/vitest/survey/createScoredQuestion";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";

import { getUnlockedTraits } from "./getUnlockedTraits";

// q1 and q2 feed "brave": q1-a1 and q2-a1 carry its highest weight, q1-a2
// lists it with a lower one and q1-a3 does not list it. q2-a1 also completes
// "hidden" and "nameless". Only q3 feeds "calm", and no question feeds "unfed".
const quiz = createSurvey({
  orientations: [
    createOrientation("brave", "Odważny"),
    createOrientation("calm", "Spokojny"),
    createOrientation("hidden", "Ukryty", { isHidden: true }),
    createOrientation("nameless"),
    createOrientation("unfed", "Bez pytań"),
    createOrientation("other", "Inny"),
  ],
  questions: [
    createScoredQuestion("q1", [
      [2, ["brave"]],
      [1, ["brave"]],
      [2, ["other"]],
    ]),
    createScoredQuestion("q2", [
      [3, ["brave", "hidden", "nameless"]],
      [3, ["other"]],
    ]),
    createScoredQuestion("q3", [
      [1, ["calm"]],
      [1, ["other"]],
    ]),
  ],
});

const getTraitIds = (
  answerIds: (string | undefined)[],
  traitIds?: string[],
): string[] =>
  getUnlockedTraits(quiz, createDoneQuestions(quiz, answerIds), traitIds).map(
    ({ id }) => id,
  );

const EVERY_HIGHEST = ["q1-a1", "q2-a1", "q3-a1"];

describe("getUnlockedTraits()", () => {
  describe("given no trait list", () => {
    it("returns an empty list", () => {
      expect(getTraitIds(EVERY_HIGHEST)).toEqual([]);
      expect(getTraitIds(EVERY_HIGHEST, [])).toEqual([]);
    });
  });

  describe("given a trait whose every question is answered with its highest weight", () => {
    it("unlocks it", () => {
      const traits = getUnlockedTraits(
        quiz,
        createDoneQuestions(quiz, ["q1-a1", "q2-a1"]),
        ["brave"],
      );

      expect(traits).toMatchObject([{ id: "brave", name: "Odważny" }]);
    });
  });

  describe("given a question that feeds the trait is still open", () => {
    it("does not unlock it", () => {
      expect(getTraitIds(["q1-a1"], ["brave"])).toEqual([]);
      expect(getTraitIds([], ["brave"])).toEqual([]);
    });
  });

  describe("given one answer that lists the trait with a lower weight", () => {
    it("does not unlock it", () => {
      expect(getTraitIds(["q1-a2", "q2-a1"], ["brave"])).toEqual([]);
    });
  });

  describe("given one answer that does not list the trait", () => {
    it("does not unlock it", () => {
      expect(getTraitIds(["q1-a3", "q2-a1"], ["brave"])).toEqual([]);
    });
  });

  describe("given a question that feeds the trait was skipped", () => {
    it("does not unlock it", () => {
      expect(getTraitIds([undefined, "q2-a1"], ["brave"])).toEqual([]);
    });
  });

  describe("given a trait that is unknown, hidden, nameless or fed by no question", () => {
    it("never unlocks it", () => {
      expect(
        getTraitIds(EVERY_HIGHEST, ["ghost", "hidden", "nameless", "unfed"]),
      ).toEqual([]);
    });
  });

  it("keeps one trait when it is listed twice", () => {
    expect(getTraitIds(EVERY_HIGHEST, ["brave", "brave"])).toEqual(["brave"]);
  });

  it("returns the unlocked traits in the order of the quiz", () => {
    expect(getTraitIds(EVERY_HIGHEST, ["calm", "brave"])).toEqual([
      "brave",
      "calm",
    ]);
  });

  it("unlocks only the traits of the list", () => {
    expect(getTraitIds(EVERY_HIGHEST, ["calm"])).toEqual(["calm"]);
  });
});

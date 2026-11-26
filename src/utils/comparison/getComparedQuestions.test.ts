import { describe, expect, it } from "vitest";

import { Agreement } from "@/types/comparison";

import {
  comparisonQuiz,
  friendSide,
  leftSide,
  takerAnswers,
} from "./comparison.fixtures";
import { getComparedQuestions } from "./getComparedQuestions";

const toIds = (answers: { id: string }[]) => answers.map(({ id }) => id);

describe("getComparedQuestions()", () => {
  describe("given a friend as the other side", () => {
    const questions = getComparedQuestions(
      comparisonQuiz,
      takerAnswers,
      friendSide,
    );

    it("lists every question of the quiz, in the order of the quiz", () => {
      expect(questions.map(({ question }) => question)).toEqual(
        comparisonQuiz.questions,
      );
    });

    it("gives each question the answer of the taker, or none", () => {
      expect(questions.map(({ answer }) => answer?.id)).toEqual([
        "q1-a1",
        "q2-a3",
        "q3-a2",
        "q4-a1",
        undefined,
      ]);
    });

    it("gives each question the answer the friend chose, ignoring what the quiz does not have", () => {
      expect(questions.map(({ otherAnswers }) => toIds(otherAnswers))).toEqual([
        ["q1-a1"],
        ["q2-a1"],
        [],
        ["q4-a2"],
        ["q5-a1"],
      ]);
    });

    it("says how the two stand on each question", () => {
      expect(questions.map(({ agreement }) => agreement)).toEqual([
        Agreement.Agree,
        Agreement.Disagree,
        Agreement.Neither,
        Agreement.Disagree,
        Agreement.Neither,
      ]);
    });
  });

  describe("given an orientation as the other side", () => {
    const questions = getComparedQuestions(
      comparisonQuiz,
      takerAnswers,
      leftSide,
    );

    it("gives each question every answer that lists the orientation", () => {
      expect(questions.map(({ otherAnswers }) => toIds(otherAnswers))).toEqual([
        ["q1-a1"],
        ["q2-a1", "q2-a3"],
        ["q3-a1"],
        [],
        ["q5-a1"],
      ]);
    });

    it("says how the taker stands with the orientation on each question", () => {
      expect(questions.map(({ agreement }) => agreement)).toEqual([
        Agreement.Agree,
        Agreement.Agree,
        Agreement.Disagree,
        Agreement.Neither,
        Agreement.Neither,
      ]);
    });
  });

  describe("given an answer of the taker to a question the quiz does not have", () => {
    it("ignores it", () => {
      const questions = getComparedQuestions(
        comparisonQuiz,
        [{ questionId: "q9", answerId: "q9-a1" }],
        leftSide,
      );

      expect(questions).toHaveLength(comparisonQuiz.questions.length);
      expect(questions.every(({ answer }) => answer === undefined)).toBe(true);
    });
  });
});

import { describe, expect, it } from "vitest";

import type { ResultAnswer } from "@/types/results";

import { getResultQuestions } from "./getResultQuestions";
import { moduleQuiz, moduleQuizResult } from "./resolveResult.fixtures";

const getAnswerIds = (answers: ResultAnswer[]): (string | undefined)[] =>
  getResultQuestions(moduleQuiz, answers).map(({ answer }) => answer?.id);

describe("getResultQuestions()", () => {
  describe("given the answers of a result", () => {
    it("returns every question of the quiz, in the quiz's order", () => {
      expect(
        getResultQuestions(moduleQuiz, moduleQuizResult.answers).map(
          ({ question }) => question.id,
        ),
      ).toEqual(["q1", "q2", "q3", "q4", "q5"]);
    });

    it("gives each question the answer chosen for it, and none to a question left", () => {
      expect(getAnswerIds(moduleQuizResult.answers)).toEqual([
        "q1-a1",
        "q2-a1",
        "q3-a1",
        "q4-a1",
        undefined,
      ]);
    });

    it("reads the answers in any order", () => {
      expect(
        getAnswerIds([
          { questionId: "q5", answerId: "q5-a2" },
          { questionId: "q1", answerId: "q1-a2" },
        ]),
      ).toEqual(["q1-a2", undefined, undefined, undefined, "q5-a2"]);
    });
  });

  describe("given no answers", () => {
    it("returns every question as left", () => {
      expect(getAnswerIds([])).toEqual([
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      ]);
    });
  });

  describe("given an answer to a question the quiz does not have", () => {
    it("ignores it", () => {
      expect(
        getAnswerIds([
          { questionId: "ghost", answerId: "q1-a1" },
          { questionId: "q2", answerId: "q2-a2" },
        ]),
      ).toEqual([undefined, "q2-a2", undefined, undefined, undefined]);
    });
  });

  describe("given an answer the question does not have", () => {
    it("ignores it", () => {
      expect(
        getAnswerIds([
          { questionId: "q1", answerId: "q2-a1" },
          { questionId: "q2", answerId: "ghost" },
          { questionId: "q3", answerId: "q3-a2" },
        ]),
      ).toEqual([undefined, undefined, "q3-a2", undefined, undefined]);
    });
  });

  describe("given two answers to the same question", () => {
    it("counts the first", () => {
      expect(
        getAnswerIds([
          { questionId: "q1", answerId: "q1-a2" },
          { questionId: "q1", answerId: "q1-a1" },
        ]),
      ).toEqual(["q1-a2", undefined, undefined, undefined, undefined]);
    });
  });
});

import { describe, expect, it } from "vitest";

import type { HomeQuiz, QuizCategory } from "@/types/home";
import { createMessage } from "@/utils/vitest/createMessage";

import { getVisibleQuizzes } from "./getVisibleQuizzes";

const createQuiz = (id: string, categories: QuizCategory[]): HomeQuiz => ({
  id,
  name: createMessage("Quiz"),
  categories,
  tags: [],
});

const ELECTORAL = createQuiz("electoral", ["electoral"]);
const SOCIAL = createQuiz("social", ["social"]);
const BOTH = createQuiz("both", ["social", "electoral"]);
const NEITHER = createQuiz("neither", []);
const QUIZZES = [ELECTORAL, SOCIAL, BOTH, NEITHER];

describe("getVisibleQuizzes", () => {
  describe("when the tab is all", () => {
    it("returns every quiz, also one without a category", () => {
      expect(getVisibleQuizzes(QUIZZES, "all")).toEqual(QUIZZES);
    });
  });

  describe("when the tab is a category", () => {
    it("returns the electoral quizzes in the order of the list", () => {
      expect(getVisibleQuizzes(QUIZZES, "electoral")).toEqual([
        ELECTORAL,
        BOTH,
      ]);
    });

    it("returns the social quizzes in the order of the list", () => {
      expect(getVisibleQuizzes(QUIZZES, "social")).toEqual([SOCIAL, BOTH]);
    });

    it("returns an empty list when no quiz is in the category", () => {
      expect(getVisibleQuizzes([ELECTORAL, NEITHER], "social")).toEqual([]);
    });
  });

  describe("when the list is empty", () => {
    it("returns an empty list on every tab", () => {
      expect(getVisibleQuizzes([], "all")).toEqual([]);
      expect(getVisibleQuizzes([], "electoral")).toEqual([]);
    });
  });
});

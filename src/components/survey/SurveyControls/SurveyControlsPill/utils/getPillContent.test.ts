import { describe, expect, it } from "vitest";

import { getPillContent } from "./getPillContent";

describe("getPillContent()", () => {
  describe("given a label", () => {
    it("returns the label alone, whatever else is passed", () => {
      expect(
        getPillContent({
          quizName: "Quiz Name",
          label: "Prawie koniec!",
          categoryName: "Światopogląd",
          questionsLeft: 11,
        }),
      ).toEqual({ text: "Prawie koniec!" });
    });

    it("trims the label", () => {
      expect(
        getPillContent({ quizName: "Quiz Name", label: "  Prawie koniec!  " }),
      ).toEqual({ text: "Prawie koniec!" });
    });
  });

  describe("given a category name and questions left", () => {
    it("returns both", () => {
      expect(
        getPillContent({
          quizName: "Quiz Name",
          categoryName: "Światopogląd",
          questionsLeft: 11,
        }),
      ).toEqual({ text: "Światopogląd", count: 11 });
    });
  });

  describe("given a category name only", () => {
    it("returns the name without a count", () => {
      expect(
        getPillContent({ quizName: "Quiz Name", categoryName: "Światopogląd" }),
      ).toEqual({ text: "Światopogląd", count: undefined });
    });

    it("leaves out a count that is not a finite number", () => {
      expect(
        getPillContent({
          quizName: "Quiz Name",
          categoryName: "Światopogląd",
          questionsLeft: Number.NaN,
        }),
      ).toEqual({ text: "Światopogląd", count: undefined });
    });
  });

  describe("given questions left only", () => {
    it("returns the count without a text", () => {
      expect(
        getPillContent({ quizName: "Quiz Name", questionsLeft: 4 }),
      ).toEqual({ text: undefined, count: 4 });
    });

    it("returns 0 for a negative count and rounds a fraction down", () => {
      expect(
        getPillContent({ quizName: "Quiz Name", questionsLeft: -2 }),
      ).toEqual({ text: undefined, count: 0 });
      expect(
        getPillContent({ quizName: "Quiz Name", questionsLeft: 2.7 }),
      ).toEqual({ text: undefined, count: 2 });
    });
  });

  describe("given a label or a category name that is empty or only whitespace", () => {
    it("treats them as absent", () => {
      expect(
        getPillContent({
          quizName: "Quiz Name",
          label: "   ",
          categoryName: "",
        }),
      ).toEqual({ text: "Quiz Name" });
    });

    it("falls from a blank label to the category", () => {
      expect(
        getPillContent({
          quizName: "Quiz Name",
          label: " ",
          categoryName: "Gospodarka",
          questionsLeft: 3,
        }),
      ).toEqual({ text: "Gospodarka", count: 3 });
    });
  });

  describe("given none of them", () => {
    it("returns the quiz name", () => {
      expect(getPillContent({ quizName: "Quiz Name" })).toEqual({
        text: "Quiz Name",
      });
    });
  });

  describe("given an empty quiz name and nothing else", () => {
    it("returns nothing to show", () => {
      expect(getPillContent({ quizName: "" })).toEqual({ text: undefined });
      expect(getPillContent({ quizName: "   " })).toEqual({ text: undefined });
    });
  });
});

import { describe, expect, it } from "vitest";

import { findWholePhrases } from "./findWholePhrases";

const findTexts = (text: string, phrases: string[]): string[] =>
  findWholePhrases(text, phrases).map(({ start, end }) =>
    text.slice(start, end),
  );

describe("findWholePhrases()", () => {
  describe("given a phrase as a whole word", () => {
    it("returns where it starts and ends", () => {
      expect(findWholePhrases("To nie jest proste.", ["nie"])).toEqual([
        { start: 3, end: 6 },
      ]);
    });

    it("returns every occurrence in the order of the text", () => {
      expect(findWholePhrases("nie wolno i nie trzeba, nie", ["nie"])).toEqual([
        { start: 0, end: 3 },
        { start: 12, end: 15 },
        { start: 24, end: 27 },
      ]);
    });
  });

  describe("given the phrase inside a longer word", () => {
    it("does not find it at the start, in the middle or at the end", () => {
      expect(
        findWholePhrases("Niektórzy cenią niepodległość, a inni zwątpienie.", [
          "nie",
        ]),
      ).toEqual([]);
    });
  });

  describe("given the phrase next to a Polish letter", () => {
    it("does not find it", () => {
      expect(findWholePhrases("żnie nień nieł ónie", ["nie"])).toEqual([]);
    });

    it("does not find it next to a combining mark", () => {
      expect(findWholePhrases("nié dotyczy", ["nie"])).toEqual([]);
    });
  });

  describe("given the phrase next to a digit or an underscore", () => {
    it("does not find it", () => {
      expect(findWholePhrases("nie2 3nie nie_ _nie", ["nie"])).toEqual([]);
    });
  });

  describe("given the phrase in a different case", () => {
    it("finds it", () => {
      expect(findTexts("Nie wiem, czy NIE, czy nIe.", ["nie"])).toEqual([
        "Nie",
        "NIE",
        "nIe",
      ]);
    });

    it("finds a phrase with Polish letters", () => {
      expect(findTexts("ŻADEN z nich, żaden.", ["żaden"])).toEqual([
        "ŻADEN",
        "żaden",
      ]);
    });
  });

  describe("given the phrase next to punctuation", () => {
    it("finds the word without the punctuation", () => {
      expect(
        findTexts('nie, (nie) nie. "nie" nie-boskie — nie!', ["nie"]),
      ).toEqual(["nie", "nie", "nie", "nie", "nie", "nie"]);
    });
  });

  describe("given several phrases", () => {
    it("finds each of them", () => {
      expect(findTexts("Nigdy nie mów nigdy.", ["nie", "nigdy"])).toEqual([
        "Nigdy",
        "nie",
        "nigdy",
      ]);
    });

    it("prefers the longer phrase where two start at the same place", () => {
      expect(
        findTexts("Państwo nie powinno, ale nie musi.", ["nie", "nie powinno"]),
      ).toEqual(["nie powinno", "nie"]);
    });
  });

  describe("given a phrase with regular expression characters", () => {
    it("matches it literally", () => {
      expect(findTexts("tak (nie) lub n.e, nie nxe", ["n.e", "(nie)"])).toEqual(
        ["(nie)", "n.e"],
      );
    });
  });

  describe("given the same phrase several times in a row", () => {
    it("finds each one when a single space separates them", () => {
      expect(findWholePhrases("nie nie nie", ["nie"])).toEqual([
        { start: 0, end: 3 },
        { start: 4, end: 7 },
        { start: 8, end: 11 },
      ]);
    });

    it("finds each one when a single punctuation mark separates them", () => {
      expect(findWholePhrases("nie,nie;nie-nie", ["nie"])).toEqual([
        { start: 0, end: 3 },
        { start: 4, end: 7 },
        { start: 8, end: 11 },
        { start: 12, end: 15 },
      ]);
    });

    it("finds a one-letter phrase at the start and after it", () => {
      expect(findWholePhrases("a a, a", ["a"])).toEqual([
        { start: 0, end: 1 },
        { start: 2, end: 3 },
        { start: 5, end: 6 },
      ]);
    });
  });

  describe("given a phrase right after one that ends with punctuation", () => {
    it("finds both", () => {
      expect(findWholePhrases("(nie)(nie)", ["(nie)"])).toEqual([
        { start: 0, end: 5 },
        { start: 5, end: 10 },
      ]);
    });

    it("finds both when the phrase is a single punctuation mark", () => {
      expect(findWholePhrases("((", ["("])).toEqual([
        { start: 0, end: 1 },
        { start: 1, end: 2 },
      ]);
    });
  });

  describe("given a phrase that ends with punctuation right before a letter", () => {
    it("does not find it, and still finds the word inside it", () => {
      expect(findTexts("(nie)nie", ["(nie)", "nie"])).toEqual(["nie", "nie"]);
    });
  });

  describe("given the phrase next to an emoji", () => {
    it("finds it", () => {
      expect(findWholePhrases("👍nie👍nie", ["nie"])).toEqual([
        { start: 2, end: 5 },
        { start: 7, end: 10 },
      ]);
    });

    it("finds a phrase that is an emoji twice in a row", () => {
      expect(findWholePhrases("👍👍 nie", ["👍", "nie"])).toEqual([
        { start: 0, end: 2 },
        { start: 2, end: 4 },
        { start: 5, end: 8 },
      ]);
    });
  });

  describe("given phrases padded with whitespace", () => {
    it("finds them trimmed", () => {
      expect(findTexts("To nie tak.", ["  nie "])).toEqual(["nie"]);
    });
  });

  describe("given an empty phrase list", () => {
    it("finds nothing", () => {
      expect(findWholePhrases("To nie tak.", [])).toEqual([]);
    });
  });

  describe("given only blank phrases", () => {
    it("finds nothing", () => {
      expect(findWholePhrases("To nie tak.", ["", "   "])).toEqual([]);
    });
  });

  describe("given empty text", () => {
    it("finds nothing", () => {
      expect(findWholePhrases("", ["nie"])).toEqual([]);
    });
  });
});

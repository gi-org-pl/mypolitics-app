import { describe, expect, it } from "vitest";

import { splitByPhrases } from "./splitByPhrases";

describe("splitByPhrases()", () => {
  describe("given a phrase as a whole word", () => {
    it("marks it as matched", () => {
      expect(
        splitByPhrases("Obraza uczuć religijnych nie powinna być karalna.", [
          "nie",
        ]),
      ).toEqual([
        { text: "Obraza uczuć religijnych ", isMatched: false },
        { text: "nie", isMatched: true },
        { text: " powinna być karalna.", isMatched: false },
      ]);
    });

    it("marks every occurrence, in the order of the text", () => {
      expect(splitByPhrases("nie wolno i nie trzeba, nie", ["nie"])).toEqual([
        { text: "nie", isMatched: true },
        { text: " wolno i ", isMatched: false },
        { text: "nie", isMatched: true },
        { text: " trzeba, ", isMatched: false },
        { text: "nie", isMatched: true },
      ]);
    });

    it("keeps the whole text when the parts are joined", () => {
      const text = "  Nie, to nie tak — (nie)!  ";

      expect(
        splitByPhrases(text, ["nie"])
          .map((part) => part.text)
          .join(""),
      ).toBe(text);
    });
  });

  describe("given the phrase inside a longer word", () => {
    it("does not match it", () => {
      expect(splitByPhrases("Niektórzy cenią niepodległość.", ["nie"])).toEqual(
        [{ text: "Niektórzy cenią niepodległość.", isMatched: false }],
      );
    });
  });

  describe("given the phrase next to a Polish letter", () => {
    it("does not match it", () => {
      expect(splitByPhrases("żnie nień nieł ónie", ["nie"])).toEqual([
        { text: "żnie nień nieł ónie", isMatched: false },
      ]);
    });
  });

  describe("given the phrase in a different case", () => {
    it("matches it and keeps the spelling", () => {
      expect(splitByPhrases("Nie każdy to wie.", ["nie"])).toEqual([
        { text: "Nie", isMatched: true },
        { text: " każdy to wie.", isMatched: false },
      ]);
    });
  });

  describe("given the phrase next to punctuation", () => {
    it("matches the word without the punctuation", () => {
      expect(splitByPhrases("Tak (nie, nie.)", ["nie"])).toEqual([
        { text: "Tak (", isMatched: false },
        { text: "nie", isMatched: true },
        { text: ", ", isMatched: false },
        { text: "nie", isMatched: true },
        { text: ".)", isMatched: false },
      ]);
    });
  });

  describe("given an empty phrase list", () => {
    it("returns the text as one unmatched part", () => {
      expect(splitByPhrases("To nie tak.", [])).toEqual([
        { text: "To nie tak.", isMatched: false },
      ]);
    });
  });

  describe("given only blank phrases", () => {
    it("returns the text as one unmatched part", () => {
      expect(splitByPhrases("To nie tak.", ["", "  "])).toEqual([
        { text: "To nie tak.", isMatched: false },
      ]);
    });
  });

  describe("given empty text", () => {
    it("returns no parts", () => {
      expect(splitByPhrases("", ["nie"])).toEqual([]);
    });
  });
});

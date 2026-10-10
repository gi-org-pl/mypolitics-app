import { describe, expect, it } from "vitest";

import { getLongestWordLength } from "./getLongestWordLength";

describe("getLongestWordLength()", () => {
  describe("given one word", () => {
    it("returns the number of its characters", () => {
      expect(getLongestWordLength("Socjaldemokratyczny")).toBe(19);
    });

    it("counts a letter with a diacritic as one character", () => {
      expect(getLongestWordLength("Żółć")).toBe(4);
    });

    it("counts a character outside the basic plane as one character", () => {
      expect(getLongestWordLength("a😀b")).toBe(3);
    });
  });

  describe("given several words", () => {
    it("returns the length of the longest one", () => {
      expect(getLongestWordLength("Nowa lewica demokratyczna")).toBe(13);
    });

    it("splits at every kind of whitespace", () => {
      expect(getLongestWordLength("Oś\n\ngospodarcza\ti   społeczna")).toBe(11);
    });
  });

  describe("given a word with a hyphen or a dash", () => {
    it("splits after the hyphen and counts it with the part it ends", () => {
      expect(getLongestWordLength("Konserwatywno-liberalny")).toBe(14);
    });

    it("splits after a dash as well", () => {
      expect(getLongestWordLength("Lewica–centrum")).toBe(7);
      expect(getLongestWordLength("Lewica—centrum")).toBe(7);
      expect(getLongestWordLength("Lewica‐centrum")).toBe(7);
    });
  });

  describe("given empty or whitespace-only text", () => {
    it("returns zero", () => {
      expect(getLongestWordLength("")).toBe(0);
      expect(getLongestWordLength(" \n\t ")).toBe(0);
    });
  });

  describe("given a value that is not a string", () => {
    it("returns zero", () => {
      expect(getLongestWordLength()).toBe(0);
      expect(getLongestWordLength(null as unknown as string)).toBe(0);
      expect(getLongestWordLength(42 as unknown as string)).toBe(0);
    });
  });
});

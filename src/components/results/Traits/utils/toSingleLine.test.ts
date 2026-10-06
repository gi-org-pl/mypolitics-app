import { describe, expect, it } from "vitest";

import { toSingleLine } from "./toSingleLine";

describe("toSingleLine()", () => {
  describe("given text with line breaks and repeated spaces", () => {
    it("collapses it into one trimmed line", () => {
      expect(toSingleLine("  Pro-\n\nchoice   teraz ")).toBe(
        "Pro- choice teraz",
      );
    });
  });

  describe("given no text", () => {
    it.each([
      undefined,
      "",
      "   ",
    ])("returns an empty string for %j", (text) => {
      expect(toSingleLine(text)).toBe("");
    });
  });

  describe("given a value that is not a string", () => {
    it("returns an empty string", () => {
      expect(toSingleLine(42 as unknown as string)).toBe("");
      expect(toSingleLine(null as unknown as string)).toBe("");
    });
  });
});

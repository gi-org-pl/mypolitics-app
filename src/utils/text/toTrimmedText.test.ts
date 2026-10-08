import { describe, expect, it } from "vitest";

import { toTrimmedText } from "./toTrimmedText";

describe("toTrimmedText()", () => {
  describe("given text with space or line breaks around it", () => {
    it("trims the ends", () => {
      expect(toTrimmedText("  Zielona postępowczyni \n")).toBe(
        "Zielona postępowczyni",
      );
    });

    it("keeps the line breaks inside it", () => {
      expect(toTrimmedText("\nPierwszy akapit.\n\nDrugi akapit.\n")).toBe(
        "Pierwszy akapit.\n\nDrugi akapit.",
      );
    });
  });

  describe("given empty or whitespace-only text", () => {
    it("returns undefined", () => {
      expect(toTrimmedText("")).toBeUndefined();
      expect(toTrimmedText(" \n\t ")).toBeUndefined();
    });
  });

  describe("given a value that is not a string", () => {
    it("returns undefined", () => {
      expect(toTrimmedText()).toBeUndefined();
      expect(toTrimmedText(null)).toBeUndefined();
      expect(toTrimmedText(2050)).toBeUndefined();
      expect(toTrimmedText(true)).toBeUndefined();
      expect(toTrimmedText({ name: "Zieloni" })).toBeUndefined();
    });
  });
});

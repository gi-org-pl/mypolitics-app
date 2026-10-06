import { describe, expect, it } from "vitest";

import { toSingleLine } from "./toSingleLine";

describe("toSingleLine()", () => {
  describe("given text with line breaks and repeated spaces", () => {
    it("collapses every run of whitespace into one space", () => {
      expect(toSingleLine("Oś\n\ngospodarcza\r\n\ti   społeczna")).toBe(
        "Oś gospodarcza i społeczna",
      );
    });

    it("trims the ends", () => {
      expect(toSingleLine("  Oś gospodarcza \n")).toBe("Oś gospodarcza");
    });
  });

  describe("given empty or whitespace-only text", () => {
    it("returns an empty string", () => {
      expect(toSingleLine("")).toBe("");
      expect(toSingleLine(" \n\t ")).toBe("");
    });
  });

  describe("given a value that is not a string", () => {
    it("returns an empty string", () => {
      expect(toSingleLine()).toBe("");
      expect(toSingleLine(null as unknown as string)).toBe("");
      expect(toSingleLine(42 as unknown as string)).toBe("");
    });
  });
});

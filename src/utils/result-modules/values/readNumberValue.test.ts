import { describe, expect, it } from "vitest";

import type { ResultModuleValueDefinition } from "@/types/results";

import { readNumberValue } from "./readNumberValue";

// A share from 0 to 100 that a word switches off, and a count of 1 to 20.
const share: ResultModuleValueDefinition<"number"> = {
  kind: "number",
  min: 0,
  max: 100,
  off: { word: "none", reads: false },
  fallback: 50,
};

const count: ResultModuleValueDefinition<"number"> = {
  kind: "number",
  min: 1,
  max: 20,
  fallback: 3,
};

describe("readNumberValue()", () => {
  describe("given a whole number within the bounds", () => {
    it.each([
      [0],
      [37],
      [50],
      [100],
    ])("returns %j, the two bounds included", (value) => {
      expect(readNumberValue(share, value)).toBe(value);
    });
  });

  describe("given a number outside the bounds", () => {
    it.each([
      [-1],
      [-40],
      [101],
      [1000],
      [Number.NEGATIVE_INFINITY],
      [Number.POSITIVE_INFINITY],
    ])("returns the fallback for %j", (value) => {
      expect(readNumberValue(share, value)).toBe(50);
    });
  });

  describe("given a fraction", () => {
    it.each([
      [0.5],
      [37.5],
      [100.1],
      [-0.1],
    ])("returns the fallback for %j", (value) => {
      expect(readNumberValue(share, value)).toBe(50);
    });

    it.each([
      [1.5],
      [2.000_001],
      [19.9],
    ])("returns the fallback for %j of a count", (value) => {
      expect(readNumberValue(count, value)).toBe(3);
    });
  });

  describe("given a count", () => {
    it.each([[1], [8], [20]])("returns the whole number %j", (value) => {
      expect(readNumberValue(count, value)).toBe(value);
    });

    it.each([
      [0],
      [-2],
      [21],
    ])("keeps to the bounds: %j is the fallback", (value) => {
      expect(readNumberValue(count, value)).toBe(3);
    });
  });

  describe("given the word that stands for off", () => {
    it("returns what the definition reads it as", () => {
      expect(readNumberValue(share, "none")).toBe(false);
    });

    it("returns the fallback where the definition names no such word", () => {
      expect(readNumberValue(count, "none")).toBe(3);
    });
  });

  describe("given another string", () => {
    it.each([
      ["a text that holds a number", "60"],
      ["an empty text", ""],
      ["another word", "off"],
      ["the word in capitals", "NONE"],
    ])("returns the fallback for %s", (_, value) => {
      expect(readNumberValue(share, value)).toBe(50);
      expect(readNumberValue(count, value)).toBe(3);
    });
  });

  describe("given not a number", () => {
    it("returns the fallback", () => {
      expect(readNumberValue(share, Number.NaN)).toBe(50);
      expect(readNumberValue(count, Number.NaN)).toBe(3);
    });
  });

  describe("given no value", () => {
    it("returns the fallback", () => {
      expect(readNumberValue(share)).toBe(50);
      expect(readNumberValue(count, undefined)).toBe(3);
    });
  });
});

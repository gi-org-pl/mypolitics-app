import { describe, expect, it } from "vitest";

import type { ResultModuleValueDefinition } from "@/types/results";

import { readNumberValue } from "./readNumberValue";

// A share from 0 to 100 that may be switched off, and a count of 1 to 20.
const share: ResultModuleValueDefinition<"number"> = {
  kind: "number",
  min: 0,
  max: 100,
  whole: false,
  nullable: true,
  fallback: 50,
};

const count: ResultModuleValueDefinition<"number"> = {
  kind: "number",
  min: 1,
  max: 20,
  whole: true,
  nullable: false,
  fallback: 3,
};

describe("readNumberValue()", () => {
  describe("given a number within the bounds", () => {
    it.each([
      [0],
      [37.5],
      [50],
      [100],
    ])("returns %j, the two bounds included", (value) => {
      expect(readNumberValue(share, value)).toBe(value);
    });
  });

  describe("given a number outside the bounds", () => {
    it.each([
      [-0.1],
      [-40],
      [100.1],
      [1000],
      [Number.NEGATIVE_INFINITY],
      [Number.POSITIVE_INFINITY],
    ])("returns the fallback for %j", (value) => {
      expect(readNumberValue(share, value)).toBe(50);
    });
  });

  describe("given a definition that asks for a whole number", () => {
    it.each([[1], [8], [20]])("returns the whole number %j", (value) => {
      expect(readNumberValue(count, value)).toBe(value);
    });

    it.each([
      [1.5],
      [2.000_001],
      [19.9],
    ])("returns the fallback for %j", (value) => {
      expect(readNumberValue(count, value)).toBe(3);
    });

    it.each([
      [0],
      [-2],
      [21],
    ])("still keeps to the bounds: %j is the fallback", (value) => {
      expect(readNumberValue(count, value)).toBe(3);
    });
  });

  describe("given a definition that does not ask for a whole number", () => {
    it("returns a number that is not whole", () => {
      expect(readNumberValue(share, 0.5)).toBe(0.5);
    });
  });

  describe("given nothing", () => {
    it("returns false where the definition allows nothing", () => {
      expect(readNumberValue(share, null)).toBe(false);
    });

    it("returns the fallback where it does not", () => {
      expect(readNumberValue(count, null)).toBe(3);
    });
  });

  describe("given a value that is not a number", () => {
    it.each([
      ["a text that holds a number", "60"],
      ["an empty text", ""],
      ["true", true],
      ["false", false],
      ["not a number", Number.NaN],
    ])("returns the fallback for %s", (_, value) => {
      expect(readNumberValue(share, value)).toBe(50);
      expect(readNumberValue(count, value)).toBe(3);
    });
  });

  describe("given no value", () => {
    it("returns the fallback", () => {
      expect(readNumberValue(share)).toBe(50);
      expect(readNumberValue(count, undefined)).toBe(3);
    });
  });
});

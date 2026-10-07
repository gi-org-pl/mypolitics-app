import { describe, expect, it } from "vitest";

import { isNumber } from "./isNumber";

describe("isNumber()", () => {
  describe("given a number", () => {
    it("returns true", () => {
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-12.5)).toBe(true);
      expect(isNumber(Number.POSITIVE_INFINITY)).toBe(true);
    });
  });

  describe("given NaN", () => {
    it("returns false", () => {
      expect(isNumber(Number.NaN)).toBe(false);
    });
  });

  describe("given a value that is not a number", () => {
    it("returns false", () => {
      expect(isNumber(undefined)).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber("40")).toBe(false);
      expect(isNumber({})).toBe(false);
    });
  });
});

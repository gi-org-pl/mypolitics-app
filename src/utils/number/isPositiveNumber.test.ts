import { describe, expect, it } from "vitest";

import { isPositiveNumber } from "./isPositiveNumber";

describe("isPositiveNumber()", () => {
  describe("given a number above zero", () => {
    it("returns true", () => {
      expect(isPositiveNumber(1)).toBe(true);
      expect(isPositiveNumber(0.25)).toBe(true);
    });
  });

  describe("given zero or a negative number", () => {
    it("returns false", () => {
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-3)).toBe(false);
    });
  });

  describe("given a number that cannot be counted with", () => {
    it("returns false", () => {
      expect(isPositiveNumber(Number.NaN)).toBe(false);
      expect(isPositiveNumber(Number.POSITIVE_INFINITY)).toBe(false);
    });
  });

  describe("given something that is not a number", () => {
    it("returns false", () => {
      expect(isPositiveNumber(undefined)).toBe(false);
      expect(isPositiveNumber(null)).toBe(false);
      expect(isPositiveNumber("2")).toBe(false);
    });
  });
});

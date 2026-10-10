import { describe, expect, it } from "vitest";

import { toWeight } from "./toWeight";

describe("toWeight()", () => {
  describe("given a number above zero", () => {
    it("returns it as it is", () => {
      expect(toWeight(4)).toBe(4);
      expect(toWeight(1.25)).toBe(1.25);
    });
  });

  describe("given a weight that is missing, not a number, zero or negative", () => {
    it("returns zero", () => {
      expect(toWeight(undefined)).toBe(0);
      expect(toWeight(null)).toBe(0);
      expect(toWeight("3")).toBe(0);
      expect(toWeight(Number.NaN)).toBe(0);
      expect(toWeight(Number.POSITIVE_INFINITY)).toBe(0);
      expect(toWeight(0)).toBe(0);
      expect(toWeight(-2)).toBe(0);
    });
  });
});

import { describe, expect, it } from "vitest";
import { getSaturatedPercentValue } from "./getSaturatedPercentValue";

describe("getSaturatedPercentValue()", () => {
  describe("given value > 50", () => {
    it("returns the value unchanged", () => {
      expect(getSaturatedPercentValue(75)).toBe(75);
      expect(getSaturatedPercentValue(51)).toBe(51);
      expect(getSaturatedPercentValue(99)).toBe(99);
    });
  });

  describe("given value <= 50", () => {
    it("returns a value higher than the raw input (saturation boost)", () => {
      expect(getSaturatedPercentValue(10)).toBeGreaterThan(10);
      expect(getSaturatedPercentValue(25)).toBeGreaterThan(25);
      expect(getSaturatedPercentValue(1)).toBeGreaterThan(1);
    });
  });

  describe("given value = 0", () => {
    it("returns 0", () => {
      expect(getSaturatedPercentValue(0)).toBe(0);
    });
  });

  describe("given value = 50", () => {
    it("returns 50 (boundary — no boost)", () => {
      expect(getSaturatedPercentValue(50)).toBe(50);
    });
  });

  describe("given value = 100", () => {
    it("returns 100", () => {
      expect(getSaturatedPercentValue(100)).toBe(100);
    });
  });
});

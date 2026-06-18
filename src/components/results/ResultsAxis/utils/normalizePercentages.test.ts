import { describe, expect, it } from "vitest";
import { normalizePercentages } from "./normalizePercentages";

describe("normalizePercentages", () => {
  describe("when the total is greater than 0", () => {
    it("scales both values so they sum to 100", () => {
      const result1 = normalizePercentages(80, 80);
      expect(result1.left + result1.right).toBeCloseTo(100);
      expect(result1).toEqual({ left: 50, right: 50 });

      const result2 = normalizePercentages(30, 10);
      expect(result2.left + result2.right).toBe(100);
      expect(result2).toEqual({ left: 75, right: 25 });
    });
  });

  describe("when the total is 0", () => {
    it("returns { left: 50, right: 50 }", () => {
      expect(normalizePercentages(0, 0)).toEqual({ left: 50, right: 50 });
    });
  });
});

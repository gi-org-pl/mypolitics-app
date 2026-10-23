import { describe, expect, it } from "vitest";

import { easeInOutCubic } from "./easeInOutCubic";

describe("easeInOutCubic()", () => {
  describe("given the ends of a movement", () => {
    it("starts at 0 and ends at 1", () => {
      expect(easeInOutCubic(0)).toBe(0);
      expect(easeInOutCubic(1)).toBe(1);
    });
  });

  describe("given the middle of a movement", () => {
    it("is halfway", () => {
      expect(easeInOutCubic(0.5)).toBe(0.5);
    });
  });

  describe("given the first and the last quarter", () => {
    it("moves slower than linear at the start and is symmetric at the end", () => {
      expect(easeInOutCubic(0.25)).toBeCloseTo(0.0625);
      expect(easeInOutCubic(0.75)).toBeCloseTo(0.9375);
    });
  });

  describe("given a share outside the movement", () => {
    it("holds it at the nearer end", () => {
      expect(easeInOutCubic(-0.5)).toBe(0);
      expect(easeInOutCubic(1.5)).toBe(1);
    });
  });
});

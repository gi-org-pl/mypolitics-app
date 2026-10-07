import { describe, expect, it } from "vitest";

import { clamp } from "./clamp";

describe("clamp()", () => {
  describe("given a value inside the range", () => {
    it("returns the value unchanged", () => {
      expect(clamp(40, 0, 100)).toBe(40);
      expect(clamp(0, 0, 100)).toBe(0);
      expect(clamp(100, 0, 100)).toBe(100);
    });
  });

  describe("given a value below the range", () => {
    it("returns the minimum", () => {
      expect(clamp(-20, 0, 100)).toBe(0);
    });
  });

  describe("given a value above the range", () => {
    it("returns the maximum", () => {
      expect(clamp(140, 0, 100)).toBe(100);
      expect(clamp(Number.POSITIVE_INFINITY, 0, 100)).toBe(100);
    });
  });
});

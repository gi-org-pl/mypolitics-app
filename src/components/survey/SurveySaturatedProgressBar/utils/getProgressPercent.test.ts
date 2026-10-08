import { describe, expect, it } from "vitest";

import { getProgressPercent } from "./getProgressPercent";

describe("getProgressPercent()", () => {
  describe("given done and all", () => {
    it("returns done as a percentage of all", () => {
      expect(getProgressPercent(5, 10)).toBe(50);
      expect(getProgressPercent(0, 10)).toBe(0);
      expect(getProgressPercent(10, 10)).toBe(100);
    });

    it("uses fractions as given", () => {
      expect(getProgressPercent(2.5, 10)).toBe(25);
      expect(getProgressPercent(1, 2.5)).toBe(40);
    });
  });

  describe("given a quiz with one question", () => {
    it("is empty, then full", () => {
      expect(getProgressPercent(0, 1)).toBe(0);
      expect(getProgressPercent(1, 1)).toBe(100);
    });
  });

  describe("given an invalid maxValue", () => {
    it.each([0, -10, Number.NaN])("returns 0 for %s", (maxValue) => {
      expect(getProgressPercent(5, maxValue)).toBe(0);
    });

    it("returns 0 for a maxValue that is not a number at all", () => {
      expect(getProgressPercent(5, "10" as unknown as number)).toBe(0);
    });
  });

  describe("given an invalid value", () => {
    it.each([-1, Number.NaN])("returns 0 for %s", (value) => {
      expect(getProgressPercent(value, 10)).toBe(0);
    });

    it("returns 0 for a value that is not a number at all", () => {
      expect(getProgressPercent(undefined as unknown as number, 10)).toBe(0);
    });
  });

  describe("given a value above maxValue", () => {
    it("returns 100", () => {
      expect(getProgressPercent(11, 10)).toBe(100);
      expect(getProgressPercent(Number.POSITIVE_INFINITY, 10)).toBe(100);
    });
  });
});

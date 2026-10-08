import { describe, expect, it } from "vitest";

import { getQuestionsLeft } from "./getQuestionsLeft";

describe("getQuestionsLeft()", () => {
  describe("given a whole number", () => {
    it("returns it", () => {
      expect(getQuestionsLeft(11)).toBe(11);
    });

    it("returns 0 for 0", () => {
      expect(getQuestionsLeft(0)).toBe(0);
    });
  });

  describe("given a negative number", () => {
    it("returns 0", () => {
      expect(getQuestionsLeft(-3)).toBe(0);
    });

    it("returns 0 for a negative fraction", () => {
      expect(getQuestionsLeft(-0.5)).toBe(0);
    });
  });

  describe("given a fraction", () => {
    it("rounds it down", () => {
      expect(getQuestionsLeft(4.9)).toBe(4);
    });
  });

  describe("given a value that is not a finite number", () => {
    it("returns nothing for NaN", () => {
      expect(getQuestionsLeft(Number.NaN)).toBeUndefined();
    });

    it("returns nothing for Infinity", () => {
      expect(getQuestionsLeft(Number.POSITIVE_INFINITY)).toBeUndefined();
      expect(getQuestionsLeft(Number.NEGATIVE_INFINITY)).toBeUndefined();
    });

    it("returns nothing for a missing value", () => {
      expect(getQuestionsLeft()).toBeUndefined();
    });

    it("returns nothing for a value that is not a number", () => {
      expect(getQuestionsLeft("11" as unknown as number)).toBeUndefined();
      expect(getQuestionsLeft(null as unknown as number)).toBeUndefined();
    });
  });
});

import { describe, expect, it } from "vitest";

import { getMatchBand } from "./getMatchBand";

describe("getMatchBand()", () => {
  describe("given a value below 50", () => {
    it("returns none", () => {
      expect(getMatchBand(0)).toBe("none");
      expect(getMatchBand(49)).toBe("none");
      expect(getMatchBand(49.9)).toBe("none");
    });
  });

  describe("given 50", () => {
    it("returns partial", () => {
      expect(getMatchBand(50)).toBe("partial");
    });
  });

  describe("given 79.9", () => {
    it("returns partial, on the exact value", () => {
      expect(getMatchBand(79.9)).toBe("partial");
    });
  });

  describe("given 80", () => {
    it("returns match", () => {
      expect(getMatchBand(80)).toBe("match");
      expect(getMatchBand(100)).toBe("match");
    });
  });

  describe("given a value outside 0-100", () => {
    it("clamps it first", () => {
      expect(getMatchBand(-20)).toBe("none");
      expect(getMatchBand(250)).toBe("match");
      expect(getMatchBand(Number.POSITIVE_INFINITY)).toBe("match");
      expect(getMatchBand(Number.NEGATIVE_INFINITY)).toBe("none");
    });
  });

  describe("given no value or a value that is not a number", () => {
    it("returns none", () => {
      expect(getMatchBand()).toBe("none");
      expect(getMatchBand(Number.NaN)).toBe("none");
      expect(getMatchBand("90" as unknown as number)).toBe("none");
      expect(getMatchBand(null as unknown as number)).toBe("none");
    });
  });
});

import { describe, expect, it } from "vitest";

import { getPercent } from "./getPercent";

describe("getPercent()", () => {
  describe("given a part and a whole", () => {
    it("returns the part as a percentage of the whole", () => {
      expect(getPercent(5, 10)).toBe(50);
      expect(getPercent(0, 10)).toBe(0);
      expect(getPercent(10, 10)).toBe(100);
    });

    it("uses fractions as given", () => {
      expect(getPercent(2.5, 10)).toBe(25);
      expect(getPercent(1, 2.5)).toBe(40);
    });
  });

  describe("given a whole of one", () => {
    it("is 0, then 100", () => {
      expect(getPercent(0, 1)).toBe(0);
      expect(getPercent(1, 1)).toBe(100);
    });
  });

  describe("given an invalid whole", () => {
    it.each([0, -10, Number.NaN])("returns 0 for %s", (whole) => {
      expect(getPercent(5, whole)).toBe(0);
    });

    it("returns 0 for a whole that is not a number at all", () => {
      expect(getPercent(5, "10" as unknown as number)).toBe(0);
    });
  });

  describe("given an invalid part", () => {
    it.each([-1, Number.NaN])("returns 0 for %s", (part) => {
      expect(getPercent(part, 10)).toBe(0);
    });

    it("returns 0 for a part that is not a number at all", () => {
      expect(getPercent(undefined as unknown as number, 10)).toBe(0);
    });
  });

  describe("given a part larger than the whole", () => {
    it("returns 100", () => {
      expect(getPercent(11, 10)).toBe(100);
      expect(getPercent(Number.POSITIVE_INFINITY, 10)).toBe(100);
    });
  });
});

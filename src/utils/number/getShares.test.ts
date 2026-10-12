import { describe, expect, it } from "vitest";

import { getShares } from "./getShares";

describe("getShares()", () => {
  describe("given values that add up to something", () => {
    it("returns each value as its share of all of them, in the order given", () => {
      expect(getShares([100, 600, 300])).toEqual([0.1, 0.6, 0.3]);
      expect(getShares([1, 3])).toEqual([0.25, 0.75]);
    });

    it("gives a value of zero a share of zero", () => {
      expect(getShares([0, 5, 0])).toEqual([0, 1, 0]);
    });

    it("uses fractions as given", () => {
      expect(getShares([0.5, 1.5])).toEqual([0.25, 0.75]);
    });
  });

  describe("given values that add up to nothing", () => {
    it.each([[[0, 0, 0]], [[0]], [[]]])("returns nothing for %j", (values) => {
      expect(getShares(values)).toBeUndefined();
    });
  });

  describe("given a value that is negative or not a finite number", () => {
    it.each([
      [[-1, 5, 5]],
      [[Number.NaN, 5, 5]],
      [[Number.POSITIVE_INFINITY, 5, 5]],
      [["5", 5, 5]],
      [[null, 5, 5]],
      [[undefined, 5, 5]],
    ])("returns nothing for %j", (values) => {
      expect(getShares(values)).toBeUndefined();
    });
  });

  describe("given values too large to add up", () => {
    it("returns nothing", () => {
      expect(getShares([Number.MAX_VALUE, Number.MAX_VALUE])).toBeUndefined();
    });
  });
});

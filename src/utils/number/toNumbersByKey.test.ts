import { describe, expect, it } from "vitest";

import { toNumbersByKey } from "./toNumbersByKey";

describe("toNumbersByKey()", () => {
  describe("given pairs of a key and a number", () => {
    it("returns the numbers by key", () => {
      expect(
        toNumbersByKey([
          ["a", 10],
          ["b", 0],
          ["c", 99.5],
        ]),
      ).toEqual({ a: 10, b: 0, c: 99.5 });
    });
  });

  describe("given a pair whose value is not a number", () => {
    it("leaves it out", () => {
      expect(
        toNumbersByKey([
          ["a", undefined],
          ["b", Number.NaN],
          ["c", "7"],
          ["d", null],
          ["e", 7],
        ]),
      ).toEqual({ e: 7 });
    });
  });

  describe("given two pairs with one key", () => {
    it("counts the later one", () => {
      expect(
        toNumbersByKey([
          ["a", 1],
          ["a", 2],
        ]),
      ).toEqual({ a: 2 });
    });
  });

  describe("given no pairs", () => {
    it("returns nothing", () => {
      expect(toNumbersByKey([])).toEqual({});
    });
  });
});

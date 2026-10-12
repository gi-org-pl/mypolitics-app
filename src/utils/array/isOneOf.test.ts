import { describe, expect, it } from "vitest";

import { isOneOf } from "./isOneOf";

const SIZES = ["small", "large"] as const;

describe("isOneOf()", () => {
  describe("given a value of the list", () => {
    it("says yes", () => {
      expect(isOneOf(SIZES, "small")).toBe(true);
      expect(isOneOf(SIZES, "large")).toBe(true);
      expect(isOneOf([1, 2, 3], 2)).toBe(true);
    });

    it("narrows the value to the items of the list", () => {
      const value: unknown = "large";
      const size: (typeof SIZES)[number] | undefined = isOneOf(SIZES, value)
        ? value
        : undefined;

      expect(size).toBe("large");
    });
  });

  describe("given anything else", () => {
    it("says no", () => {
      expect(isOneOf(SIZES, "medium")).toBe(false);
      expect(isOneOf(SIZES, "SMALL")).toBe(false);
      expect(isOneOf(SIZES, " small")).toBe(false);
      expect(isOneOf(SIZES, undefined)).toBe(false);
      expect(isOneOf(SIZES, null)).toBe(false);
      expect(isOneOf(SIZES, 0)).toBe(false);
      expect(isOneOf(SIZES, ["small"])).toBe(false);
    });

    it("does not take a value of another type for an item", () => {
      expect(isOneOf(["1", "2"], 1)).toBe(false);
      expect(isOneOf([1, 2], "1")).toBe(false);
    });

    it("says no for an empty list", () => {
      expect(isOneOf([], "small")).toBe(false);
    });
  });
});

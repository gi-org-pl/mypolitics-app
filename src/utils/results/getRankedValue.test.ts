import { describe, expect, it } from "vitest";

import { getRankedValue } from "./getRankedValue";

describe("getRankedValue()", () => {
  describe("given a value within 0-100", () => {
    it("returns it as it is", () => {
      expect(getRankedValue({ value: 42.5 })).toBe(42.5);
      expect(getRankedValue({ value: 0 })).toBe(0);
    });
  });

  describe("given a value outside 0-100", () => {
    it("clamps it", () => {
      expect(getRankedValue({ value: 150 })).toBe(100);
      expect(getRankedValue({ value: -1 })).toBe(0);
    });
  });

  describe("given no value, or one that is not a number", () => {
    it("returns null", () => {
      expect(getRankedValue({})).toBeNull();
      expect(getRankedValue({ value: Number.NaN })).toBeNull();
      expect(getRankedValue({ value: "90" as unknown as number })).toBeNull();
    });
  });

  describe("given no entry", () => {
    it("returns null", () => {
      expect(getRankedValue()).toBeNull();
    });
  });
});

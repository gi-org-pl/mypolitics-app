import { describe, expect, it } from "vitest";

import { getScoreValue } from "./getScoreValue";

describe("getScoreValue()", () => {
  describe("given a maximum above zero", () => {
    it("returns the points as a share of it, out of a hundred", () => {
      expect(getScoreValue({ points: 12, maximum: 20 })).toBe(60);
      expect(getScoreValue({ points: 0, maximum: 4 })).toBe(0);
      expect(getScoreValue({ points: 4, maximum: 4 })).toBe(100);
    });

    it("never rounds", () => {
      expect(getScoreValue({ points: 4.75, maximum: 5.75 })).toBe(
        (4.75 / 5.75) * 100,
      );
    });
  });

  describe("given a maximum of zero", () => {
    it("returns nothing", () => {
      expect(getScoreValue({ points: 0, maximum: 0 })).toBeUndefined();
    });
  });
});

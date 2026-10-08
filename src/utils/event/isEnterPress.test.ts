import { describe, expect, it } from "vitest";

import { isEnterPress } from "./isEnterPress";

const createPress = (key: string, isComposing = false) => ({
  key,
  nativeEvent: { isComposing },
});

describe("isEnterPress()", () => {
  describe("given Enter", () => {
    it("returns true", () => {
      expect(isEnterPress(createPress("Enter"))).toBe(true);
    });
  });

  describe("given Enter that ends a composition", () => {
    it("returns false", () => {
      expect(isEnterPress(createPress("Enter", true))).toBe(false);
    });
  });

  describe("given another key", () => {
    it.each([["a"], [" "], ["Tab"], ["Escape"]])("returns false: %j", (key) => {
      expect(isEnterPress(createPress(key))).toBe(false);
    });
  });
});

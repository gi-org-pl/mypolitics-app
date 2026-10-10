import { describe, expect, it } from "vitest";

import { isDarkFill } from "./isDarkFill";

describe("isDarkFill()", () => {
  describe("given no colour", () => {
    it("returns true, because the neutral fallback is dark", () => {
      expect(isDarkFill()).toBe(true);
      expect(isDarkFill("")).toBe(true);
    });
  });

  describe("given a dark colour", () => {
    it.each(["#192430", "#851c22", "#000"])("returns true for %s", (color) => {
      expect(isDarkFill(color)).toBe(true);
    });
  });

  describe("given a colour of the frame or a light one", () => {
    it.each([
      "#eb5760",
      "#57bfeb",
      "#36db8b",
      "#8443e9",
      "#fff176",
    ])("returns false for %s", (color) => {
      expect(isDarkFill(color)).toBe(false);
    });
  });
});

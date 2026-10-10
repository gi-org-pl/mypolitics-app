import { describe, expect, it } from "vitest";

import { getTextClassName } from "./getTextClassName";

describe("getTextClassName()", () => {
  describe("given a light colour", () => {
    it.each([
      "#fff176",
      "#ffe066",
      "#ecf0f2",
      "rgb(255, 241, 118)",
    ])("returns the dark text class for %s", (color) => {
      expect(getTextClassName(color)).toBe("text-gi-primary");
    });
  });

  describe("given a dark or mid-tone colour", () => {
    it.each([
      "#192430",
      "#851c22",
      "#9b51e0",
      "rgb(25, 36, 48)",
    ])("returns the class of the colour itself for %s", (color) => {
      expect(getTextClassName(color)).toBe("text-(--axis-color)");
    });
  });

  describe("given a colour that cannot be read", () => {
    it("returns the class of the colour itself", () => {
      expect(getTextClassName("gold")).toBe("text-(--axis-color)");
    });
  });

  describe("given no colour", () => {
    it("returns the neutral text class", () => {
      expect(getTextClassName()).toBe("text-gi-dark-gray");
      expect(getTextClassName("")).toBe("text-gi-dark-gray");
    });
  });
});

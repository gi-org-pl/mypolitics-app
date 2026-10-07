import { describe, expect, it } from "vitest";

import { getSafeColor } from "./getSafeColor";

describe("getSafeColor()", () => {
  describe("given a supported colour", () => {
    it.each([
      "#abc",
      "#abcd",
      "#59b6a6",
      "#59B6A6cc",
      "rgb(89, 182, 166)",
      "rgba(89 182 166 / 50%)",
      "hsl(120deg 50% 40%)",
      "hwb(0.5turn 10% 20%)",
      "lab(52% 40 -20)",
      "lch(52% 40 120)",
      "oklab(0.6 0.1 -0.1)",
      "oklch(0.6 0.2 25 / 80%)",
      "oklch(none 0.2 25)",
    ])("returns %s unchanged", (color) => {
      expect(getSafeColor(color)).toBe(color);
    });

    it("trims the surrounding whitespace", () => {
      expect(getSafeColor("  #59b6a6\n")).toBe("#59b6a6");
    });
  });

  describe("given an unsupported colour", () => {
    it.each([
      "red",
      "#12",
      "#12345",
      "#gggggg",
      "var(--gi-primary)",
      "url(https://example.com/x.png)",
      "red; background: url(x)",
      "rgb(0 0 0); color: red",
      "color-mix(in srgb, red, blue)",
      "#59b6a6 !important",
    ])("returns undefined for %s", (color) => {
      expect(getSafeColor(color)).toBeUndefined();
    });
  });

  describe("given no colour", () => {
    it("returns undefined for undefined", () => {
      expect(getSafeColor()).toBeUndefined();
    });

    it("returns undefined for an empty or blank string", () => {
      expect(getSafeColor("")).toBeUndefined();
      expect(getSafeColor("   ")).toBeUndefined();
    });
  });

  describe("given a value that is not a string", () => {
    it("returns undefined", () => {
      expect(getSafeColor(123 as unknown as string)).toBeUndefined();
      expect(getSafeColor(null as unknown as string)).toBeUndefined();
    });
  });
});

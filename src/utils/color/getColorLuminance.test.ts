import { describe, expect, it } from "vitest";

import { getColorLuminance } from "./getColorLuminance";

describe("getColorLuminance()", () => {
  describe("given a hex colour", () => {
    it.each([
      ["#fff", 1],
      ["#000", 0],
      ["#FFFFFF", 1],
      ["#bcbcbc", 0.5029],
      ["#fff176", 0.8548],
      ["#192430", 0.0168],
      ["#8443e9", 0.148],
    ])("returns the relative luminance of %s", (color, luminance) => {
      expect(getColorLuminance(color)).toBeCloseTo(luminance, 3);
    });

    it("trims the surrounding whitespace", () => {
      expect(getColorLuminance("  #fff\n")).toBe(1);
    });
  });

  describe("given a functional notation", () => {
    it.each([
      ["rgb(188, 188, 188)", 0.5029],
      ["rgb(100% 100% 100%)", 1],
      ["hsl(0 0% 100%)", 1],
      ["hsl(0deg 0% 0%)", 0],
      ["hwb(0 100% 0%)", 1],
      ["hwb(0 0% 100%)", 0],
      ["hwb(0 90% 30%)", 0.5225],
      ["lab(100% 0 0)", 1],
      ["lab(5 0 0)", 0.0055],
      ["lch(0 0 0)", 0],
      ["oklab(1 0 0)", 1],
      ["oklch(0.5 0.1 100)", 0.125],
    ])("returns the luminance of %s", (color, luminance) => {
      expect(getColorLuminance(color)).toBeCloseTo(luminance, 3);
    });

    it("reads a hue in any angle unit", () => {
      const yellow = getColorLuminance("hsl(60deg 100% 50%)");

      expect(yellow).toBeCloseTo(0.9278, 3);
      expect(getColorLuminance("hsl(60 100% 50%)")).toBeCloseTo(0.9278, 3);
      expect(getColorLuminance("hsl(66.667grad 100% 50%)")).toBeCloseTo(
        0.9278,
        2,
      );
      expect(getColorLuminance("hsl(1.0472rad 100% 50%)")).toBeCloseTo(
        0.9278,
        2,
      );
      expect(getColorLuminance("hsl(0.16667turn 100% 50%)")).toBeCloseTo(
        0.9278,
        2,
      );
      expect(getColorLuminance("hwb(-300 0% 0%)")).toBeCloseTo(0.9278, 3);
    });

    it("counts a notation with no numbers in it as black", () => {
      expect(getColorLuminance("rgb()")).toBe(0);
      expect(getColorLuminance("hsl(,,)")).toBe(0);
      expect(getColorLuminance("oklch(none 0.2 25)")).toBe(0);
    });
  });

  describe("given a translucent colour", () => {
    it("lets the white surface through in proportion to the transparency", () => {
      expect(getColorLuminance("#00000033")).toBeCloseTo(0.8, 3);
      expect(getColorLuminance("rgb(0 0 0 / 20%)")).toBeCloseTo(0.8, 3);
      expect(getColorLuminance("rgba(0, 0, 0, 0.2)")).toBeCloseTo(0.8, 3);
      expect(getColorLuminance("#000000ff")).toBe(0);
    });
  });

  describe("given no colour notation", () => {
    it.each([
      undefined,
      "",
      "   ",
      "red",
      "#12",
      "#12345",
    ])("returns undefined for %j", (color) => {
      expect(getColorLuminance(color)).toBeUndefined();
    });

    it("returns undefined for a value that is not a string", () => {
      expect(getColorLuminance(123 as unknown as string)).toBeUndefined();
      expect(getColorLuminance(null as unknown as string)).toBeUndefined();
    });
  });
});

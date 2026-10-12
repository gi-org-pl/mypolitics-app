import { describe, expect, it } from "vitest";

import { isLightColor } from "./isLightColor";

describe("isLightColor()", () => {
  describe("given a light colour", () => {
    it.each([
      "#fff",
      "#fffc",
      "#ffe066",
      "#FFE066",
      "#ecf0f2ff",
      "rgb(255, 224, 102)",
      "rgb(100% 88% 40%)",
      "hsl(48deg 100% 70%)",
      "hsla(0.13turn, 100%, 70%, 1)",
      "hwb(48 40% 0%)",
      "hwb(0 90% 10%)",
      "lab(90% 0 60)",
      "lch(90 60 90)",
      "oklab(0.9 0 0.1)",
      "oklch(90% 0.1 100)",
    ])("returns true for %s", (color) => {
      expect(isLightColor(color)).toBe(true);
    });

    it("trims the surrounding whitespace", () => {
      expect(isLightColor("  #ffe066\n")).toBe(true);
    });
  });

  describe("given a dark or mid-tone colour", () => {
    it.each([
      "#000",
      "#192430",
      "#851c22",
      "#b69d59",
      "#9b51e0",
      "#324c51",
      "rgb(25, 36, 48)",
      "rgb(10% 14% 19%)",
      "hsl(211 32% 14%)",
      "hsl(3.4rad 32% 14%)",
      "hsl(-120grad 60% 30%)",
      "hwb(211 10% 81%)",
      "hwb(0 20% 80%)",
      "lab(14% 0 -10)",
      "lab(5 0 0)",
      "lch(14 10 250)",
      "oklab(0.25 0 -0.03)",
      "oklch(0.25 0.03 250)",
      "oklch(none 0.2 25)",
    ])("returns false for %s", (color) => {
      expect(isLightColor(color)).toBe(false);
    });
  });

  describe("given a translucent colour", () => {
    it("treats a dark colour that lets most of the white card through as light", () => {
      expect(isLightColor("#00000033")).toBe(true);
      expect(isLightColor("rgb(0 0 0 / 20%)")).toBe(true);
      expect(isLightColor("rgba(0, 0, 0, 0.2)")).toBe(true);
    });

    it("keeps a mostly opaque dark colour dark", () => {
      expect(isLightColor("#000000cc")).toBe(false);
      expect(isLightColor("oklch(0.25 0.03 250 / 0.9)")).toBe(false);
    });
  });

  describe("given no usable colour", () => {
    it.each([
      undefined,
      "",
      "   ",
      "red",
      "#12",
      "#12345",
      "var(--gi-primary)",
    ])("returns false for %j", (color) => {
      expect(isLightColor(color)).toBe(false);
    });

    it("returns false for a notation with no numbers in it", () => {
      expect(isLightColor("rgb()")).toBe(false);
      expect(isLightColor("hsl(,,)")).toBe(false);
    });

    it("returns false for a value that is not a string", () => {
      expect(isLightColor(123 as unknown as string)).toBe(false);
      expect(isLightColor(null as unknown as string)).toBe(false);
    });
  });
});

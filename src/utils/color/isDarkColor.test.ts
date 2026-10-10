import { describe, expect, it } from "vitest";

import { isDarkColor } from "./isDarkColor";

describe("isDarkColor()", () => {
  describe("given a dark colour", () => {
    it.each([
      "#000",
      "#192430",
      "#851c22",
      "#324c51",
      "#004554",
      "rgb(25, 36, 48)",
      "hsl(211 32% 14%)",
      "hwb(211 10% 81%)",
      "lab(14% 0 -10)",
      "oklch(0.398 0.0331 213.7)",
    ])("returns true for %s", (color) => {
      expect(isDarkColor(color)).toBe(true);
    });

    it("trims the surrounding whitespace", () => {
      expect(isDarkColor("  #192430\n")).toBe(true);
    });
  });

  describe("given a mid-tone or light colour", () => {
    it.each([
      "#8443e9",
      "#eb5760",
      "#57bfeb",
      "#36db8b",
      "#9b51e0",
      "#fff176",
      "#fff",
      "rgb(132, 67, 233)",
      "oklch(0.6057 0.0122 211.04)",
    ])("returns false for %s", (color) => {
      expect(isDarkColor(color)).toBe(false);
    });
  });

  describe("given a translucent colour", () => {
    it("treats a dark colour that lets most of the white surface through as not dark", () => {
      expect(isDarkColor("#00000033")).toBe(false);
      expect(isDarkColor("rgb(0 0 0 / 20%)")).toBe(false);
    });

    it("keeps a mostly opaque dark colour dark", () => {
      expect(isDarkColor("#000000ee")).toBe(true);
    });

    it("judges a colour by what a browser draws on white", () => {
      expect(isDarkColor("#000c")).toBe(isDarkColor("#333"));
      expect(isDarkColor("#000c")).toBe(true);
      expect(isDarkColor("#192430cc")).toBe(isDarkColor("#475059"));
      expect(isDarkColor("#192430cc")).toBe(true);
      expect(isDarkColor("#19243080")).toBe(isDarkColor("#8c9197"));
      expect(isDarkColor("#19243080")).toBe(false);
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
    ])("returns false for %j", (color) => {
      expect(isDarkColor(color)).toBe(false);
    });

    it("returns false for a value that is not a string", () => {
      expect(isDarkColor(123 as unknown as string)).toBe(false);
      expect(isDarkColor(null as unknown as string)).toBe(false);
    });
  });
});

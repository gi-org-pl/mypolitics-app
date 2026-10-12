import { describe, expect, it } from "vitest";

import { isLightColor } from "./isLightColor";

describe("isLightColor()", () => {
  describe("given a light hex colour", () => {
    it.each([
      "#fff",
      "#fffc",
      "#ffe066",
      "#FFE066",
      "#ecf0f2ff",
      "#36db8b",
    ])("returns true for %s", (color) => {
      expect(isLightColor(color)).toBe(true);
    });

    it("trims the surrounding whitespace", () => {
      expect(isLightColor("  #ffe066\n")).toBe(true);
    });
  });

  describe("given a dark or mid-tone hex colour", () => {
    it.each([
      "#000",
      "#192430",
      "#851c22",
      "#b69d59",
      "#9b51e0",
      "#324c51",
    ])("returns false for %s", (color) => {
      expect(isLightColor(color)).toBe(false);
    });
  });

  describe("given a translucent hex colour", () => {
    it("treats a dark colour that lets most of the white card through as light", () => {
      expect(isLightColor("#00000033")).toBe(true);
      expect(isLightColor("#0003")).toBe(true);
    });

    it("keeps a mostly opaque dark colour dark", () => {
      expect(isLightColor("#000000cc")).toBe(false);
      expect(isLightColor("#000c")).toBe(false);
    });

    it("judges a colour by what a browser draws on white", () => {
      // 60% black over white is drawn as #666666, well under the line; the
      // luminance of black mixed with that of white would be above it.
      expect(isLightColor("#00000099")).toBe(false);
      expect(isLightColor("#666666")).toBe(false);
    });
  });

  describe("given a colour in another notation", () => {
    it.each([
      "rgb(255, 224, 102)",
      "hsl(48deg 100% 70%)",
      "hwb(48 40% 0%)",
      "lab(90% 0 60)",
      "oklch(90% 0.1 100)",
    ])("does not read %s", (color) => {
      expect(isLightColor(color)).toBe(false);
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
      "#ggg",
      "var(--gi-primary)",
    ])("returns false for %j", (color) => {
      expect(isLightColor(color)).toBe(false);
    });

    it("returns false for a value that is not a string", () => {
      expect(isLightColor(123 as unknown as string)).toBe(false);
      expect(isLightColor(null as unknown as string)).toBe(false);
    });
  });
});

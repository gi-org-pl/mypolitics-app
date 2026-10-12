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

  describe("given a translucent hex colour", () => {
    // The colour a browser draws for each of these on white.
    it.each([
      ["#000c", "#333333"],
      ["#00000033", "#cccccc"],
      ["#192430cc", "#475059"],
      ["#19243080", "#8c9197"],
      ["#8443e980", "#c1a1f4"],
    ])("reads %s as %s, the colour drawn on white", (color, drawn) => {
      expect(getColorLuminance(color)).toBeCloseTo(
        getColorLuminance(drawn) as number,
        2,
      );
    });

    it("mixes the white in before a channel is made linear", () => {
      // Half black is drawn as #7f7f7f (0.212), not at half the luminance of
      // white (0.5).
      expect(getColorLuminance("#00000080")).toBeCloseTo(
        getColorLuminance("#7f7f7f") as number,
        6,
      );
      expect(getColorLuminance("#00000080")).toBeCloseTo(0.2122, 3);
    });

    it("returns the luminance of white for a fully transparent colour", () => {
      expect(getColorLuminance("#0000")).toBe(1);
      expect(getColorLuminance("#19243000")).toBe(1);
    });

    it("leaves a colour with full opacity as it is", () => {
      expect(getColorLuminance("#000000ff")).toBe(0);
      expect(getColorLuminance("#fff176ff")).toBe(getColorLuminance("#fff176"));
    });
  });

  describe("given a colour in another notation", () => {
    it.each([
      "rgb(188, 188, 188)",
      "hsl(0 0% 100%)",
      "hwb(0 90% 30%)",
      "lab(100% 0 0)",
      "oklch(0.5 0.1 100)",
    ])("does not read %s", (color) => {
      expect(getColorLuminance(color)).toBeUndefined();
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
      "#ggg",
      "var(--gi-primary)",
    ])("returns undefined for %j", (color) => {
      expect(getColorLuminance(color)).toBeUndefined();
    });

    it("returns undefined for a value that is not a string", () => {
      expect(getColorLuminance(123 as unknown as string)).toBeUndefined();
      expect(getColorLuminance(null as unknown as string)).toBeUndefined();
    });
  });
});

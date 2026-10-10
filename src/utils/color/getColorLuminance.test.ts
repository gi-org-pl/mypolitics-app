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
    it.each([
      ["#000c", "#333"],
      ["#000000cc", "#333333"],
      ["#00000033", "#cccccc"],
      ["#0000ff80", "#7f7fff"],
      ["#ff000080", "#ff7f7f"],
      ["rgb(0 0 0 / 20%)", "#cccccc"],
      ["rgba(0, 0, 0, 0.2)", "#cccccc"],
      ["hsl(240 100% 50% / 0.5)", "rgb(50% 50% 100%)"],
      ["hsla(0, 100%, 50%, 0.5)", "rgb(100% 50% 50%)"],
      ["hwb(240 0% 0% / 50%)", "rgb(50% 50% 100%)"],
      ["hwb(0 0% 100% / 0.8)", "#333"],
    ])("returns for %s the luminance of %s, the colour a browser draws on white", (color, drawn) => {
      expect(getColorLuminance(color)).toBeCloseTo(
        getColorLuminance(drawn) as number,
        6,
      );
    });

    it("mixes the white in before a channel is made linear", () => {
      expect(getColorLuminance("#000c")).toBeCloseTo(0.0331, 4);
      expect(getColorLuminance("#00000033")).toBeCloseTo(0.6038, 4);
      expect(getColorLuminance("#0000ff80")).toBeCloseTo(0.2691, 4);
    });

    it("returns the luminance of white for a fully transparent colour", () => {
      expect(getColorLuminance("#0000")).toBe(1);
      expect(getColorLuminance("rgb(0 0 0 / 0)")).toBe(1);
      expect(getColorLuminance("lab(0 0 0 / 0%)")).toBe(1);
    });

    it("leaves a colour with full opacity as it is", () => {
      expect(getColorLuminance("#000000ff")).toBe(0);
      expect(getColorLuminance("#fff176ff")).toBe(getColorLuminance("#fff176"));
      expect(getColorLuminance("rgb(132 67 233 / 100%)")).toBe(
        getColorLuminance("#8443e9"),
      );
      expect(getColorLuminance("lab(50 40 20 / 1)")).toBe(
        getColorLuminance("lab(50 40 20)"),
      );
      expect(getColorLuminance("oklch(0.5 0.1 100 / 100%)")).toBe(
        getColorLuminance("oklch(0.5 0.1 100)"),
      );
    });

    it("takes a notation read for its lightness alone as the grey of that luminance", () => {
      expect(getColorLuminance("lab(0 0 0 / 0.8)")).toBeCloseTo(0.0331, 4);
      expect(getColorLuminance("lch(0 0 0 / 50%)")).toBeCloseTo(
        getColorLuminance("rgb(50% 50% 50%)") as number,
        6,
      );
      expect(getColorLuminance("oklab(0 0 0 / 0.8)")).toBeCloseTo(0.0331, 4);
      expect(getColorLuminance("lab(50 40 20 / 0.5)")).toBeCloseTo(
        getColorLuminance("lab(50 0 0 / 0.5)") as number,
        6,
      );
      expect(getColorLuminance("lab(50 0 0 / 0.5)")).toBeCloseTo(0.4967, 3);
      expect(getColorLuminance("oklch(1 0 0 / 0.5)")).toBeCloseTo(1, 6);
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

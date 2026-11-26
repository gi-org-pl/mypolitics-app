import { describe, expect, it } from "vitest";

import { getContrastRatio } from "./getContrastRatio";

describe("getContrastRatio()", () => {
  describe("given two hex colours", () => {
    it("gives 21 for black and white, either way round", () => {
      expect(getContrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
      expect(getContrastRatio("#fff", "#000")).toBeCloseTo(21, 5);
    });

    it("gives 1 for a colour against itself", () => {
      expect(getContrastRatio("#00d492", "#00d492")).toBe(1);
    });

    it("gives the ratio WCAG gives", () => {
      // The light grey of the palette on white: 2.5:1.
      expect(getContrastRatio("#98a5a8", "#ffffff")).toBeCloseTo(2.54, 2);
      // The primary colour of the palette on white: 10.6:1.
      expect(getContrastRatio("#004554", "#ffffff")).toBeCloseTo(10.6, 1);
    });

    it("draws a translucent colour on white first", () => {
      expect(getContrastRatio("#00000000", "#ffffff")).toBe(1);
    });
  });

  describe("given a colour that is not hex", () => {
    it("gives nothing", () => {
      expect(getContrastRatio("red", "#ffffff")).toBeUndefined();
      expect(getContrastRatio("#ffffff", undefined)).toBeUndefined();
    });
  });
});

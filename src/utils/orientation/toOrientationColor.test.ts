import { describe, expect, it } from "vitest";

import { toOrientationColor } from "./toOrientationColor";

describe("toOrientationColor()", () => {
  describe("given a supported colour", () => {
    it("returns it as written", () => {
      expect(toOrientationColor("#B5123F")).toBe("#B5123F");
      expect(toOrientationColor("rgb(181 18 63)")).toBe("rgb(181 18 63)");
    });

    it("trims the space around it", () => {
      expect(toOrientationColor(" #B5123F\n")).toBe("#B5123F");
    });
  });

  describe("given white", () => {
    it.each([
      "#FFF",
      "#fff",
      "#FFFFFF",
      "#ffffff",
      "#FfFfFf",
      " #FFFFFF ",
      "#FFFF",
      "#ffff",
      "#FFFFFFFF",
      "#ffffffff",
    ])("returns undefined for %j", (color) => {
      expect(toOrientationColor(color)).toBeUndefined();
    });
  });

  describe("given a colour that only looks like white", () => {
    it.each([
      "#FFFFFE",
      "#FFF0",
      "#FFFE",
      "#FFFFFF80",
      "#FFFFFFFE",
    ])("keeps %s", (color) => {
      expect(toOrientationColor(color)).toBe(color);
    });
  });

  describe("given an unsupported colour", () => {
    it("returns undefined", () => {
      expect(toOrientationColor("red")).toBeUndefined();
      expect(toOrientationColor("var(--gi-primary)")).toBeUndefined();
      expect(toOrientationColor("#12345")).toBeUndefined();
    });
  });

  describe("given no colour", () => {
    it("returns undefined", () => {
      expect(toOrientationColor()).toBeUndefined();
      expect(toOrientationColor(null)).toBeUndefined();
      expect(toOrientationColor("")).toBeUndefined();
      expect(toOrientationColor("   ")).toBeUndefined();
    });
  });

  describe("given a value that is not a string", () => {
    it("returns undefined", () => {
      expect(toOrientationColor(123 as unknown as string)).toBeUndefined();
    });
  });
});

import { describe, expect, it } from "vitest";

import { toDescription } from "./toDescription";

describe("toDescription()", () => {
  describe("given text", () => {
    it("returns it", () => {
      expect(toDescription("Poznaj najbliższą ideologię.")).toBe(
        "Poznaj najbliższą ideologię.",
      );
    });

    it("trims the space around it", () => {
      expect(toDescription("  Poznaj najbliższą ideologię. \n")).toBe(
        "Poznaj najbliższą ideologię.",
      );
    });
  });

  describe("given empty or whitespace-only text", () => {
    it("returns undefined", () => {
      expect(toDescription("")).toBeUndefined();
      expect(toDescription(" \n\t ")).toBeUndefined();
    });
  });

  describe("given a node", () => {
    it("returns the same node", () => {
      const description = <strong>Najbardziej zaawansowany test.</strong>;

      expect(toDescription(description)).toBe(description);
    });

    it("returns a number as it is, zero included", () => {
      expect(toDescription(0)).toBe(0);
    });
  });

  describe("given a value that React renders as nothing", () => {
    it("returns undefined", () => {
      expect(toDescription(undefined)).toBeUndefined();
      expect(toDescription(null)).toBeUndefined();
      expect(toDescription(false)).toBeUndefined();
      expect(toDescription(true)).toBeUndefined();
    });
  });
});

import { describe, expect, it } from "vitest";

import type { ResultEntry } from "@/types/results";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { withPoleColor } from "./withPoleColor";

const pole = (color?: string): ResultEntry => ({
  orientation: createOrientation("pacifism", "Pacyfizm", { color }),
  value: 48,
});

describe("withPoleColor()", () => {
  describe("given a pole with no colour of its own", () => {
    it("returns it in the colour it is lent, and changes nothing else", () => {
      expect(withPoleColor(pole(), "#9b59b6")).toEqual(pole("#9b59b6"));
    });

    it("does not change the pole it is given", () => {
      const entry = pole();

      withPoleColor(entry, "#9b59b6");

      expect(entry.orientation.color).toBeUndefined();
    });

    it("treats a colour that is not a plain colour value as no colour", () => {
      expect(
        withPoleColor(pole("url(https://example.com)"), "#9b59b6").orientation
          .color,
      ).toBe("#9b59b6");
    });
  });

  describe("given a pole with a colour of its own", () => {
    it("returns it as it is", () => {
      const entry = pole("#e74c3c");

      expect(withPoleColor(entry, "#9b59b6")).toBe(entry);
    });
  });

  describe("given no colour to lend", () => {
    it("returns the pole as it is", () => {
      const entry = pole();

      expect(withPoleColor(entry)).toBe(entry);
    });
  });

  describe("given a pole with no orientation", () => {
    it("returns it as it is", () => {
      const entry = { value: 10 } as unknown as ResultEntry;

      expect(withPoleColor(entry, "#9b59b6")).toBe(entry);
      expect(
        withPoleColor(undefined as unknown as ResultEntry, "#9b59b6"),
      ).toBeUndefined();
    });
  });
});

import { describe, expect, it } from "vitest";

import { toTypedName } from "./toTypedName";

describe("toTypedName()", () => {
  describe("given a space typed at the end", () => {
    it("keeps it, so the next word can follow", () => {
      expect(toTypedName("Ala ")).toBe("Ala ");
    });
  });

  describe("given a pasted line break", () => {
    it("replaces it with a space", () => {
      expect(toTypedName("Ala\nNowak")).toBe("Ala Nowak");
    });
  });

  describe("given more than 50 characters", () => {
    it("keeps the first 50, counting each character outside the basic plane as one", () => {
      expect(Array.from(toTypedName("😀".repeat(60)))).toHaveLength(50);
    });
  });
});

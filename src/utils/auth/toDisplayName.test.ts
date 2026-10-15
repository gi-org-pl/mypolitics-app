import { describe, expect, it } from "vitest";

import { toDisplayName, toTypedName } from "./toDisplayName";

describe("toDisplayName()", () => {
  describe("given spaces around and inside the name", () => {
    it("trims it and leaves single spaces", () => {
      expect(toDisplayName("  Ala    Nowak  ")).toBe("Ala Nowak");
    });
  });

  describe("given control characters and line breaks", () => {
    it("turns them into single spaces", () => {
      expect(toDisplayName("Ala\nNowak\t\u0007")).toBe("Ala Nowak");
    });
  });

  describe("given more than 50 characters", () => {
    it("keeps the first 50", () => {
      expect(toDisplayName("a".repeat(60))).toHaveLength(50);
    });
  });

  describe("given characters outside the basic plane", () => {
    it("counts each as one character", () => {
      expect(Array.from(toDisplayName("😀".repeat(60)))).toHaveLength(50);
    });
  });
});

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
});

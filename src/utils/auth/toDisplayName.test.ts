import { describe, expect, it } from "vitest";

import { toDisplayName } from "./toDisplayName";

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

  describe("given only invisible format characters", () => {
    it("comes out empty", () => {
      expect(toDisplayName("​​")).toBe("");
      expect(toDisplayName(" ‎⁠﻿ ")).toBe("");
    });
  });

  describe("given invisible format characters at the ends of the name", () => {
    it("removes them, so they do not count as characters", () => {
      expect(toDisplayName("​A​")).toBe("A");
    });
  });

  describe("given invisible format characters around a space", () => {
    it("keeps one space", () => {
      expect(toDisplayName("Ala ​ Nowak")).toBe("Ala Nowak");
    });
  });

  describe("given an emoji sequence held together by a zero-width joiner", () => {
    it("keeps the sequence whole", () => {
      expect(toDisplayName("Ala \u{1F469}‍\u{1F4BB}")).toBe(
        "Ala \u{1F469}‍\u{1F4BB}",
      );
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

import { describe, expect, it } from "vitest";

import { escapeRegExp } from "./escapeRegExp";

describe("escapeRegExp()", () => {
  describe("given text without special characters", () => {
    it("returns it unchanged", () => {
      expect(escapeRegExp("nie powinien")).toBe("nie powinien");
    });
  });

  describe("given text with regular expression characters", () => {
    it("escapes every one of them", () => {
      expect(escapeRegExp(".*+?^${}()|[]\\")).toBe(
        "\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\",
      );
    });

    it("makes a pattern that matches the text literally", () => {
      const pattern = new RegExp(escapeRegExp("a.b (c)"));

      expect(pattern.test("a.b (c)")).toBe(true);
      expect(pattern.test("axb (c)")).toBe(false);
    });
  });

  describe("given empty text", () => {
    it("returns empty text", () => {
      expect(escapeRegExp("")).toBe("");
    });
  });
});

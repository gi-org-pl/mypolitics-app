import { describe, expect, it } from "vitest";

import { getInitials } from "./getInitials";

describe("getInitials()", () => {
  describe("given a first name and a surname", () => {
    it("takes their first letters", () => {
      expect(getInitials("Ala Nowak")).toBe("AN");
    });
  });

  describe("given one word", () => {
    it("takes its first letter in capitals", () => {
      expect(getInitials("ola")).toBe("O");
    });
  });

  describe("given three words", () => {
    it("takes the first two only", () => {
      expect(getInitials("Anna Maria Kowalska")).toBe("AM");
    });
  });

  describe("given spaces around the name", () => {
    it("ignores them", () => {
      expect(getInitials("  łucja   żak ")).toBe("ŁŻ");
    });
  });

  describe("given an empty name", () => {
    it("has no initials", () => {
      expect(getInitials("   ")).toBe("");
    });
  });
});

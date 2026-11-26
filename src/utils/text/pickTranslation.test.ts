import { describe, expect, it } from "vitest";

import { pickTranslation } from "./pickTranslation";

const TITLE = { pl: "Tożsamość", en: "Identity" };

describe("pickTranslation()", () => {
  describe("given a text written in the language asked for", () => {
    it("returns the text of that language", () => {
      expect(pickTranslation(TITLE, "en")).toBe("Identity");
      expect(pickTranslation(TITLE, "pl")).toBe("Tożsamość");
    });

    it("returns it without the space around it", () => {
      expect(pickTranslation({ pl: "Partie", en: " Parties " }, "en")).toBe(
        "Parties",
      );
    });
  });

  describe("given a text that is not written in the language asked for", () => {
    it("falls back to Polish", () => {
      expect(pickTranslation(TITLE, "de")).toBe("Tożsamość");
      expect(pickTranslation({ pl: "Partie" }, "en")).toBe("Partie");
    });

    it.each([
      [""],
      ["   "],
    ])("falls back to Polish when the text of that language is %j", (en) => {
      expect(pickTranslation({ pl: "Partie", en }, "en")).toBe("Partie");
    });

    it("falls back to Polish for a language named like something every object has", () => {
      expect(pickTranslation(TITLE, "constructor")).toBe("Tożsamość");
      expect(pickTranslation(TITLE, "toString")).toBe("Tożsamość");
    });
  });

  describe("given a text that falls back to Polish", () => {
    it("returns the Polish text without the space around it", () => {
      expect(pickTranslation({ pl: " Partie " }, "en")).toBe("Partie");
    });

    it.each([
      [""],
      ["   "],
    ])("returns nothing when the Polish text is %j", (pl) => {
      expect(pickTranslation({ pl }, "en")).toBeUndefined();
      expect(pickTranslation({ pl }, "pl")).toBeUndefined();
    });
  });

  describe("given no text", () => {
    it("returns nothing", () => {
      expect(pickTranslation(undefined, "pl")).toBeUndefined();
      expect(pickTranslation(undefined, "en")).toBeUndefined();
    });
  });
});

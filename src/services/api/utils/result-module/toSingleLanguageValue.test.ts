import { describe, expect, it } from "vitest";

import { toSingleLanguageValue } from "./toSingleLanguageValue";

describe("toSingleLanguageValue()", () => {
  describe("given a value that holds each language", () => {
    const text = { pl: "Tożsamość", en: "Identity" };

    it("returns the text of the language asked for", () => {
      expect(toSingleLanguageValue(text, "pl")).toBe("Tożsamość");
      expect(toSingleLanguageValue(text, "en")).toBe("Identity");
    });

    it("falls back to Polish for a language it is not written in, or is blank in", () => {
      expect(toSingleLanguageValue(text, "de")).toBe("Tożsamość");
      expect(toSingleLanguageValue({ pl: "Tożsamość", en: " " }, "en")).toBe(
        "Tożsamość",
      );
    });

    it("returns the text without the space around it", () => {
      expect(toSingleLanguageValue({ pl: "  Partie\n" }, "pl")).toBe("Partie");
    });

    it("returns nothing when it is blank in that language and in Polish", () => {
      expect(toSingleLanguageValue({ pl: " ", en: "" }, "en")).toBeUndefined();
    });
  });

  describe("given a plain value", () => {
    it.each([
      ["a text", "linked_to_leader"],
      ["a text with space around it", "  Partie\n"],
      ["an empty text", ""],
      ["a number", 13],
      ["zero", 0],
    ])("returns %s as it is, whatever the language", (_, value) => {
      expect(toSingleLanguageValue(value, "pl")).toBe(value);
      expect(toSingleLanguageValue(value, "en")).toBe(value);
    });
  });
});

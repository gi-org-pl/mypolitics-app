import { describe, expect, it } from "vitest";

import { getExplanationPreview } from "./getExplanationPreview";

describe("getExplanationPreview()", () => {
  describe("given a trigger phrase in the text", () => {
    it("returns the text up to and including the first one, with an ellipsis", () => {
      expect(
        getExplanationPreview(
          "Obraza uczuć religijnych to działanie lub wypowiedź, a to bywa karane.",
          ["to"],
        ),
      ).toBe("Obraza uczuć religijnych to...");
    });

    it("keeps the spelling of the trigger phrase", () => {
      expect(getExplanationPreview("Konkordat TO umowa.", ["to"])).toBe(
        "Konkordat TO...",
      );
    });

    it("stops before the punctuation that follows the trigger phrase", () => {
      expect(getExplanationPreview("Oznacza to, że płaci każdy.", ["to"])).toBe(
        "Oznacza to...",
      );
    });
  });

  describe("given several trigger phrases", () => {
    it("stops at the one that comes first in the text", () => {
      expect(
        getExplanationPreview("Podatek liniowy oznacza, że to jedna stawka.", [
          "to",
          "oznacza",
        ]),
      ).toBe("Podatek liniowy oznacza...");
    });
  });

  describe("given the trigger phrase as the first word", () => {
    it("returns that word with an ellipsis", () => {
      expect(getExplanationPreview("To umowa między państwami.", ["to"])).toBe(
        "To...",
      );
    });
  });

  describe("given the trigger phrase only inside a longer word", () => {
    it("returns nothing", () => {
      expect(
        getExplanationPreview("Autonomia regionów, które stoją osobno.", [
          "to",
        ]),
      ).toBeUndefined();
    });
  });

  describe("given no trigger phrase", () => {
    it("returns nothing", () => {
      expect(
        getExplanationPreview("Umowa między państwem a Kościołem.", ["to"]),
      ).toBeUndefined();
    });
  });

  describe("given an empty trigger phrase list", () => {
    it("returns nothing", () => {
      expect(getExplanationPreview("Konkordat to umowa.", [])).toBeUndefined();
    });
  });
});

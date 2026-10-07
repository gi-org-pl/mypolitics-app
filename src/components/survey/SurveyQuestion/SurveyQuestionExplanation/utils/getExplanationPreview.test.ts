import { describe, expect, it } from "vitest";

import { getExplanationPreview } from "./getExplanationPreview";

const getPreview = (explanation: string, triggerPhrases: string[] = ["to"]) =>
  getExplanationPreview(explanation, triggerPhrases, "...");

describe("getExplanationPreview()", () => {
  describe("given a trigger phrase in the text", () => {
    it("returns the text up to and including the first one, with an ellipsis", () => {
      expect(
        getPreview(
          "Obraza uczuć religijnych to działanie lub wypowiedź, a to bywa karane.",
        ),
      ).toBe("Obraza uczuć religijnych to...");
    });

    it("keeps the spelling of the trigger phrase", () => {
      expect(getPreview("Konkordat TO umowa.")).toBe("Konkordat TO...");
    });

    it("stops before the punctuation that follows the trigger phrase", () => {
      expect(getPreview("Oznacza to, że płaci każdy.")).toBe("Oznacza to...");
    });
  });

  describe("given another ellipsis", () => {
    it("ends the preview with the given one", () => {
      expect(getExplanationPreview("Konkordat to umowa.", ["to"], "…")).toBe(
        "Konkordat to…",
      );
    });

    it("ends the preview at the trigger phrase when the ellipsis is empty", () => {
      expect(getExplanationPreview("Konkordat to umowa.", ["to"], "")).toBe(
        "Konkordat to",
      );
    });
  });

  describe("given several trigger phrases", () => {
    it("stops at the one that comes first in the text", () => {
      expect(
        getPreview("Podatek liniowy oznacza, że to jedna stawka.", [
          "to",
          "oznacza",
        ]),
      ).toBe("Podatek liniowy oznacza...");
    });
  });

  describe("given the trigger phrase as the first word", () => {
    it("returns that word with an ellipsis", () => {
      expect(getPreview("To umowa między państwami.")).toBe("To...");
    });
  });

  describe("given the trigger phrase only inside a longer word", () => {
    it("returns nothing", () => {
      expect(
        getPreview("Autonomia regionów, które stoją osobno."),
      ).toBeUndefined();
    });
  });

  describe("given no trigger phrase", () => {
    it("returns nothing", () => {
      expect(getPreview("Umowa między państwem a Kościołem.")).toBeUndefined();
    });
  });

  describe("given an empty trigger phrase list", () => {
    it("returns nothing", () => {
      expect(getPreview("Konkordat to umowa.", [])).toBeUndefined();
    });
  });
});

import { describe, expect, it } from "vitest";

import type { ResultModuleValueDefinition } from "@/types/results";

import { readTextValue } from "./readTextValue";

const text: ResultModuleValueDefinition<"text"> = { kind: "text" };
const localizedText: ResultModuleValueDefinition<"localizedText"> = {
  kind: "localizedText",
};

describe("readTextValue()", () => {
  describe.each([
    ["a text", text],
    ["a text per language", localizedText],
  ])("given a definition of %s", (_, definition) => {
    describe("when the value is a text", () => {
      it("returns it", () => {
        expect(readTextValue(definition, "Partie")).toBe("Partie");
      });

      it("returns it without the space and the line breaks around it", () => {
        expect(readTextValue(definition, "  Twój wynik\n")).toBe("Twój wynik");
        expect(readTextValue(definition, "\n\tDwie osie. ")).toBe("Dwie osie.");
      });

      it("keeps the space and the line breaks inside it", () => {
        expect(
          readTextValue(definition, "Pierwszy wiersz.\nDrugi wiersz."),
        ).toBe("Pierwszy wiersz.\nDrugi wiersz.");
      });
    });

    describe("when the value is blank", () => {
      it.each([[""], [" "], [" \n\t "]])("returns nothing for %j", (value) => {
        expect(readTextValue(definition, value)).toBeUndefined();
      });
    });

    describe("when the value is not a text", () => {
      it.each([
        ["a number", 7],
        ["zero", 0],
      ])("returns nothing for %s", (_, value) => {
        expect(readTextValue(definition, value)).toBeUndefined();
      });
    });

    describe("when there is no value", () => {
      it("returns nothing", () => {
        expect(readTextValue(definition)).toBeUndefined();
        expect(readTextValue(definition, undefined)).toBeUndefined();
      });
    });
  });
});

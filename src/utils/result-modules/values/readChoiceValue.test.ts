import { describe, expect, it } from "vitest";

import type { ResultModuleValueDefinition } from "@/types/results";

import { readChoiceValue } from "./readChoiceValue";

const definition: ResultModuleValueDefinition<"choice"> = {
  kind: "choice",
  choices: ["name", "value", "none"],
  fallback: "value",
};

describe("readChoiceValue()", () => {
  describe("given a value the definition lists", () => {
    it.each([["name"], ["value"], ["none"]])("returns %j", (value) => {
      expect(readChoiceValue(definition, value)).toBe(value);
    });
  });

  describe("given a value the definition does not list", () => {
    it.each([
      ["another text", "date"],
      ["a listed value in other letters", "Name"],
      ["a listed value with space around it", " name "],
      ["an empty text", ""],
      ["a number", 0],
    ])("returns the fallback for %s", (_, value) => {
      expect(readChoiceValue(definition, value)).toBe("value");
    });
  });

  describe("given no value", () => {
    it("returns the fallback", () => {
      expect(readChoiceValue(definition)).toBe("value");
      expect(readChoiceValue(definition, undefined)).toBe("value");
    });
  });

  describe("given a definition with another fallback", () => {
    it("returns that one", () => {
      expect(readChoiceValue({ ...definition, fallback: "none" }, "date")).toBe(
        "none",
      );
    });
  });
});

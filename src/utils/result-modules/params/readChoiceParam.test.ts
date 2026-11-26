import { describe, expect, it } from "vitest";

import type { ResultModuleParamDefinition } from "@/types/results";

import { readChoiceParam } from "./readChoiceParam";

const definition: ResultModuleParamDefinition<"choice"> = {
  kind: "choice",
  values: ["name", "value", "none"],
  fallback: "value",
};

describe("readChoiceParam()", () => {
  describe("given a value the definition allows", () => {
    it.each([["name"], ["value"], ["none"]])("returns %j", (value) => {
      expect(readChoiceParam(definition, value)).toBe(value);
    });
  });

  describe("given a value the definition does not allow", () => {
    it.each([
      ["another text", "date"],
      ["an allowed value in other letters", "Name"],
      ["an allowed value with space around it", " name "],
      ["an empty text", ""],
      ["a number", 0],
      ["a boolean", true],
      ["null", null],
      ["a list that holds an allowed value", ["name"]],
    ])("returns the fallback for %s", (_, value) => {
      expect(readChoiceParam(definition, value)).toBe("value");
    });
  });

  describe("given no value", () => {
    it("returns the fallback", () => {
      expect(readChoiceParam(definition)).toBe("value");
      expect(readChoiceParam(definition, undefined)).toBe("value");
    });
  });

  describe("given a definition with another fallback", () => {
    it("returns that one", () => {
      expect(readChoiceParam({ ...definition, fallback: "none" }, "date")).toBe(
        "none",
      );
    });
  });
});

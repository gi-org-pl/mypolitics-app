import { describe, expect, it } from "vitest";

import type {
  ResultModuleParamDefinition,
  ResultModuleParamKind,
} from "@/types/results";

import { readChoiceParam } from "./readChoiceParam";
import { readNumberParam } from "./readNumberParam";
import { readParam } from "./readParam";

const choice: ResultModuleParamDefinition<"choice"> = {
  kind: "choice",
  values: ["name", "value"],
  fallback: "value",
};

const number: ResultModuleParamDefinition<"number"> = {
  kind: "number",
  min: 0,
  max: 10,
  whole: true,
  nullable: true,
  fallback: 4,
};

// One definition of every kind there is.
const DEFINITIONS: {
  [Kind in ResultModuleParamKind]: ResultModuleParamDefinition<Kind>;
} = { choice, number };

describe("readParam()", () => {
  describe("given a definition of a choice", () => {
    it.each([
      ["name"],
      ["date"],
      [7],
      [null],
      [undefined],
    ])("reads %j as a choice", (value) => {
      expect(readParam(choice, value)).toBe(readChoiceParam(choice, value));
    });

    it("returns an allowed value, and the fallback for any other", () => {
      expect(readParam(choice, "name")).toBe("name");
      expect(readParam(choice, 7)).toBe("value");
    });
  });

  describe("given a definition of a number", () => {
    it.each([
      [7],
      [7.5],
      [11],
      ["name"],
      [null],
      [undefined],
    ])("reads %j as a number", (value) => {
      expect(readParam(number, value)).toBe(readNumberParam(number, value));
    });

    it("returns a number within the bounds, false for nothing, and the fallback for any other", () => {
      expect(readParam(number, 7)).toBe(7);
      expect(readParam(number, null)).toBe(false);
      expect(readParam(number, "name")).toBe(4);
    });
  });

  describe("given a definition of each kind and no value", () => {
    it.each(
      Object.values(DEFINITIONS),
    )("returns the fallback of the $kind", (definition) => {
      expect(readParam(definition)).toBe(definition.fallback);
    });
  });
});

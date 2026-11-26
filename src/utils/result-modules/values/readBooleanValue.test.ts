import { describe, expect, it } from "vitest";

import type { ResultModuleValueDefinition } from "@/types/results";

import { readBooleanValue } from "./readBooleanValue";

const off: ResultModuleValueDefinition<"boolean"> = {
  kind: "boolean",
  fallback: false,
};

const on: ResultModuleValueDefinition<"boolean"> = {
  kind: "boolean",
  fallback: true,
};

describe("readBooleanValue()", () => {
  describe("given yes or no", () => {
    it.each([[true], [false]])("returns %j, whatever the fallback", (value) => {
      expect(readBooleanValue(off, value)).toBe(value);
      expect(readBooleanValue(on, value)).toBe(value);
    });
  });

  describe("given a value that is neither", () => {
    it.each([
      ["a text that says yes", "true"],
      ["a text that says no", "false"],
      ["an empty text", ""],
      ["one", 1],
      ["zero", 0],
      ["null", null],
    ])("returns the fallback for %s", (_, value) => {
      expect(readBooleanValue(off, value)).toBe(false);
      expect(readBooleanValue(on, value)).toBe(true);
    });
  });

  describe("given no value", () => {
    it("returns the fallback", () => {
      expect(readBooleanValue(off)).toBe(false);
      expect(readBooleanValue(on, undefined)).toBe(true);
    });
  });
});

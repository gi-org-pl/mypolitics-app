import { describe, expect, it } from "vitest";

import type { ResultModuleValueDefinition } from "@/types/results";

import { readColorValue } from "./readColorValue";

const definition: ResultModuleValueDefinition<"color"> = { kind: "color" };

describe("readColorValue()", () => {
  describe("given a colour that passes the app's colour check", () => {
    it.each([
      ["#ef4444"],
      ["#FFF"],
      ["oklch(74.6% 0.16 232.661)"],
      ["rgb(16 185 129)"],
      ["rgb(16 185 129 / 50%)"],
    ])("returns %j", (value) => {
      expect(readColorValue(definition, value)).toBe(value);
    });

    it("returns it without the space around it", () => {
      expect(readColorValue(definition, " #7c3aed ")).toBe("#7c3aed");
      expect(readColorValue(definition, " oklch(74.6% 0.16 232.661)\n")).toBe(
        "oklch(74.6% 0.16 232.661)",
      );
    });
  });

  describe("given a text that does not pass the colour check", () => {
    it.each([
      ["a colour by name", "red"],
      ["a variable", "var(--gi-red)"],
      ["an address", "url(https://example.com/a.png)"],
      ["a colour with something after it", "#ef4444; background: red"],
      ["a hex that is too short", "#12345"],
      ["an empty text", ""],
      ["a blank text", " \n "],
    ])("returns nothing for %s", (_, value) => {
      expect(readColorValue(definition, value)).toBeUndefined();
    });
  });

  describe("given a value that is not a text", () => {
    it.each([
      ["a number", 7],
      ["a number that would read as a hex", 123_456],
      ["true", true],
      ["false", false],
      ["null", null],
    ])("returns nothing for %s", (_, value) => {
      expect(readColorValue(definition, value)).toBeUndefined();
    });
  });

  describe("given no value", () => {
    it("returns nothing", () => {
      expect(readColorValue(definition)).toBeUndefined();
      expect(readColorValue(definition, undefined)).toBeUndefined();
    });
  });
});

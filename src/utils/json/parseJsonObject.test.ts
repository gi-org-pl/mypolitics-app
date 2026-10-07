import { describe, expect, it } from "vitest";

import { parseJsonObject } from "./parseJsonObject";

describe("parseJsonObject()", () => {
  describe("given the text of a JSON object", () => {
    it("returns the object", () => {
      expect(parseJsonObject('{"name":"Zieloni","isHidden":false}')).toEqual({
        name: "Zieloni",
        isHidden: false,
      });
      expect(parseJsonObject("{}")).toEqual({});
    });

    it("reads it with space and line breaks between its keys", () => {
      expect(parseJsonObject(' {\n  "m": "a",\n  "f": "b"\n}\n')).toEqual({
        m: "a",
        f: "b",
      });
    });
  });

  describe("given valid JSON that is not an object", () => {
    it.each([
      "2050",
      "true",
      "null",
      '"Zieloni"',
      '["Zieloni"]',
    ])("returns undefined for %s", (text) => {
      expect(parseJsonObject(text)).toBeUndefined();
    });
  });

  describe("given text that is not valid JSON", () => {
    it.each([
      "",
      "Zieloni",
      '{"name":"Zieloni"',
      "{name:'Zieloni'}",
      '{"long":"Pierwszy akapit.\nDrugi akapit."}',
    ])("returns undefined for %j", (text) => {
      expect(parseJsonObject(text)).toBeUndefined();
    });
  });

  describe("given a value that is not a string", () => {
    it("returns undefined", () => {
      expect(parseJsonObject(undefined as unknown as string)).toBeUndefined();
      expect(parseJsonObject(null as unknown as string)).toBeUndefined();
      expect(parseJsonObject(2050 as unknown as string)).toBeUndefined();
    });
  });
});

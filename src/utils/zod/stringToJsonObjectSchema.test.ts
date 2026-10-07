import { describe, expect, it } from "vitest";
import { z } from "zod";

import { stringToJsonObjectSchema } from "./stringToJsonObjectSchema";

describe("stringToJsonObjectSchema", () => {
  describe("given the text of a JSON object", () => {
    it("returns the object", () => {
      expect(
        stringToJsonObjectSchema.parse('{"name":"Zieloni","isHidden":false}'),
      ).toEqual({ name: "Zieloni", isHidden: false });
      expect(stringToJsonObjectSchema.parse("{}")).toEqual({});
    });

    it("reads it with space around it", () => {
      expect(stringToJsonObjectSchema.parse(' \n{"m":"Rodzic"}\n ')).toEqual({
        m: "Rodzic",
      });
    });

    it("can be piped into the schema of the object", () => {
      const schema = stringToJsonObjectSchema.pipe(
        z.object({ name: z.string() }),
      );

      expect(schema.parse('{"name":"Zieloni","slug":"zieloni"}')).toEqual({
        name: "Zieloni",
      });
      expect(schema.safeParse('{"name":2050}').success).toBe(false);
    });
  });

  describe("given a JSON object with raw line breaks inside its values", () => {
    it("reads it and keeps the line breaks in the value", () => {
      expect(
        stringToJsonObjectSchema.parse(
          '{ "long": "Pierwszy akapit.\n\nDrugi akapit.\r\nTrzeci." }',
        ),
      ).toEqual({ long: "Pierwszy akapit.\n\nDrugi akapit.\r\nTrzeci." });
    });

    it("still reads a pretty-printed object with line breaks between its keys", () => {
      expect(
        stringToJsonObjectSchema.parse(
          '{\n  "m": "Rodzic",\n  "f": "Matka"\n}',
        ),
      ).toEqual({ m: "Rodzic", f: "Matka" });
    });
  });

  describe("given valid JSON that is not an object", () => {
    it.each([
      "2050",
      "true",
      "null",
      '"Zieloni"',
      '["Zieloni"]',
    ])("rejects %s", (text) => {
      expect(stringToJsonObjectSchema.safeParse(text).success).toBe(false);
    });
  });

  describe("given text that is not JSON", () => {
    it.each([
      "",
      "Zieloni",
      '{"name":"Zieloni"',
      "{name: 'Zieloni'}",
    ])("rejects %j with a message", (text) => {
      const result = stringToJsonObjectSchema.safeParse(text);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe("Invalid JSON object");
    });
  });

  describe("given a value that is not text", () => {
    it.each([
      undefined,
      null,
      2050,
      { name: "Zieloni" },
    ])("rejects %j", (value) => {
      expect(stringToJsonObjectSchema.safeParse(value).success).toBe(false);
    });
  });
});

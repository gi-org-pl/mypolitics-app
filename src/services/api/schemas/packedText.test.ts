import { describe, expect, it } from "vitest";
import { z } from "zod";

import { packedTextSchema } from "./packedText";

const schema = packedTextSchema(
  z.object({
    name: z.string().optional().catch(undefined),
    isHidden: z.boolean().optional().catch(undefined),
  }),
);

describe("packedTextSchema()", () => {
  describe("given plain words", () => {
    it("returns them as text, trimmed", () => {
      expect(schema.parse("Zieloni")).toBe("Zieloni");
      expect(schema.parse("  Nowa Lewica \n")).toBe("Nowa Lewica");
    });

    it("keeps the line breaks inside them", () => {
      expect(schema.parse("Pierwszy akapit.\n\nDrugi akapit.\n")).toBe(
        "Pierwszy akapit.\n\nDrugi akapit.",
      );
    });

    it("returns words with a brace further in as text", () => {
      expect(schema.parse('Partia {"X"}')).toBe('Partia {"X"}');
    });
  });

  describe("given missing, empty or blank text", () => {
    it("returns undefined", () => {
      expect(schema.parse(undefined)).toBeUndefined();
      expect(schema.parse(null)).toBeUndefined();
      expect(schema.parse("")).toBeUndefined();
      expect(schema.parse(" \n\t ")).toBeUndefined();
    });

    it("returns undefined for a value that is not text", () => {
      expect(schema.parse(2050)).toBeUndefined();
      expect(schema.parse({ name: "Zieloni" })).toBeUndefined();
    });
  });

  describe("given a JSON object", () => {
    it("returns it read by the packed schema", () => {
      expect(
        schema.parse('{"name":"Rafał Trzaskowski","isHidden":false}'),
      ).toEqual({ name: "Rafał Trzaskowski", isHidden: false });
    });

    it("returns an empty object", () => {
      expect(schema.parse("{}")).toEqual({});
    });

    it("reads it with space around it", () => {
      expect(schema.parse(' \n{"name":"Zieloni"}\n ')).toEqual({
        name: "Zieloni",
      });
    });

    it("leaves out the keys the packed schema does not name", () => {
      expect(schema.parse('{"name":"Zieloni","slug":"zieloni"}')).toEqual({
        name: "Zieloni",
      });
    });

    it("reads a value of the wrong sort as the packed schema decides", () => {
      expect(schema.parse('{"name":2050,"isHidden":"yes"}')).toEqual({});
    });
  });

  describe("given a JSON object the packed schema rejects", () => {
    it("returns undefined", () => {
      const strictSchema = packedTextSchema(z.object({ name: z.string() }));

      expect(strictSchema.parse('{"name":2050}')).toBeUndefined();
    });
  });

  describe("given valid JSON that is not an object", () => {
    it('returns "2050", "true" and "null" as text', () => {
      expect(schema.parse("2050")).toBe("2050");
      expect(schema.parse("true")).toBe("true");
      expect(schema.parse("null")).toBe("null");
    });

    it("returns quoted text and a list as text", () => {
      expect(schema.parse('"Zieloni"')).toBe('"Zieloni"');
      expect(schema.parse('["Zieloni"]')).toBe('["Zieloni"]');
    });
  });

  describe("given packed text with raw line breaks inside its values", () => {
    it("reads it and keeps the line breaks in the value", () => {
      expect(
        schema.parse(
          '{ "name": "Pierwszy akapit.\n\nDrugi akapit.\r\nTrzeci." }',
        ),
      ).toEqual({ name: "Pierwszy akapit.\n\nDrugi akapit.\r\nTrzeci." });
    });

    it("still reads pretty-printed packed text with line breaks between its keys", () => {
      expect(
        schema.parse('{\n  "name": "Zieloni",\n  "isHidden": true\n}'),
      ).toEqual({ name: "Zieloni", isHidden: true });
      expect(
        schema.parse(
          '{\n  "name": "Pierwszy \\"akapit\\".\n\nDrugi akapit.",\n  "isHidden": true\n}',
        ),
      ).toEqual({
        name: 'Pierwszy "akapit".\n\nDrugi akapit.',
        isHidden: true,
      });
    });
  });

  describe("given text that opens like packed text and does not parse", () => {
    it("returns undefined", () => {
      expect(schema.parse('{"name":"Zieloni"')).toBeUndefined();
      expect(schema.parse("{name: 'Zieloni'}")).toBeUndefined();
      expect(schema.parse("{Zieloni}")).toBeUndefined();
      expect(schema.parse('{"name":"Pierwszy.\nDrugi.",}')).toBeUndefined();
      expect(schema.parse('  {"name":"Zieloni"')).toBeUndefined();
    });
  });
});

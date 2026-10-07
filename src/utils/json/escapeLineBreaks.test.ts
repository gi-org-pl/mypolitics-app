import { describe, expect, it } from "vitest";

import { escapeLineBreaks } from "./escapeLineBreaks";

describe("escapeLineBreaks()", () => {
  describe("given raw line breaks inside a string", () => {
    it("escapes them", () => {
      expect(
        escapeLineBreaks('{"long":"Pierwszy.\n\nDrugi.\r\nTrzeci."}'),
      ).toBe('{"long":"Pierwszy.\\n\\nDrugi.\\r\\nTrzeci."}');
    });

    it("escapes them in a key as well", () => {
      expect(escapeLineBreaks('{"lo\nng":"a"}')).toBe('{"lo\\nng":"a"}');
    });
  });

  describe("given line breaks between keys", () => {
    it("leaves them as they are", () => {
      const json = '{\n  "m": "a",\r\n  "f": "b"\n}';

      expect(escapeLineBreaks(json)).toBe(json);
    });
  });

  describe("given both", () => {
    it("escapes only the ones inside a string", () => {
      expect(escapeLineBreaks('{\n  "short": "a\nb",\n  "long": "c"\n}')).toBe(
        '{\n  "short": "a\\nb",\n  "long": "c"\n}',
      );
    });
  });

  describe("given a string with an escaped quote or backslash", () => {
    it("still finds where the string ends", () => {
      expect(
        escapeLineBreaks('{"a":"x \\"y\\"\nz",\n"b":"c\\\\",\n"d":"e\nf"}'),
      ).toBe('{"a":"x \\"y\\"\\nz",\n"b":"c\\\\",\n"d":"e\\nf"}');
    });
  });

  describe("given line breaks that are already escaped", () => {
    it("leaves them as they are", () => {
      const json = '{"long":"Pierwszy.\\n\\nDrugi."}';

      expect(escapeLineBreaks(json)).toBe(json);
    });
  });

  describe("given text without a string", () => {
    it("returns it unchanged", () => {
      expect(escapeLineBreaks("")).toBe("");
      expect(escapeLineBreaks("[1,\n2]")).toBe("[1,\n2]");
    });
  });
});

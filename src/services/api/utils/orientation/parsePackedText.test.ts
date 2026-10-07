import { describe, expect, it } from "vitest";

import { parsePackedText } from "./parsePackedText";

describe("parsePackedText()", () => {
  describe("given plain words", () => {
    it("returns them as plain text, trimmed", () => {
      expect(parsePackedText("Zieloni")).toEqual({
        kind: "plain",
        text: "Zieloni",
      });
      expect(parsePackedText("  Nowa Lewica \n")).toEqual({
        kind: "plain",
        text: "Nowa Lewica",
      });
    });

    it("keeps the line breaks inside them", () => {
      expect(parsePackedText("Pierwszy akapit.\n\nDrugi akapit.\n")).toEqual({
        kind: "plain",
        text: "Pierwszy akapit.\n\nDrugi akapit.",
      });
    });

    it("returns words with a brace further in as plain text", () => {
      expect(parsePackedText('Partia {"X"}')).toEqual({
        kind: "plain",
        text: 'Partia {"X"}',
      });
    });
  });

  describe("given missing, empty or blank text", () => {
    it("returns absent", () => {
      expect(parsePackedText()).toEqual({ kind: "absent" });
      expect(parsePackedText(null)).toEqual({ kind: "absent" });
      expect(parsePackedText("")).toEqual({ kind: "absent" });
      expect(parsePackedText(" \n\t ")).toEqual({ kind: "absent" });
    });

    it("returns absent for a value that is not text", () => {
      expect(parsePackedText(2050 as unknown as string)).toEqual({
        kind: "absent",
      });
      expect(parsePackedText({ name: "Zieloni" } as unknown as string)).toEqual(
        { kind: "absent" },
      );
    });
  });

  describe("given a JSON object", () => {
    it("returns it as packed", () => {
      expect(
        parsePackedText('{"name":"Rafał Trzaskowski","isHidden":false}'),
      ).toEqual({
        kind: "packed",
        value: { name: "Rafał Trzaskowski", isHidden: false },
      });
    });

    it("returns an empty object as packed", () => {
      expect(parsePackedText("{}")).toEqual({ kind: "packed", value: {} });
    });

    it("reads it with space around it", () => {
      expect(parsePackedText(' \n{"m":"Rodzic"}\n ')).toEqual({
        kind: "packed",
        value: { m: "Rodzic" },
      });
    });
  });

  describe("given valid JSON that is not an object", () => {
    it('returns "2050", "true" and "null" as plain text', () => {
      expect(parsePackedText("2050")).toEqual({ kind: "plain", text: "2050" });
      expect(parsePackedText("true")).toEqual({ kind: "plain", text: "true" });
      expect(parsePackedText("null")).toEqual({ kind: "plain", text: "null" });
    });

    it("returns quoted text and a list as plain text", () => {
      expect(parsePackedText('"Zieloni"')).toEqual({
        kind: "plain",
        text: '"Zieloni"',
      });
      expect(parsePackedText('["Zieloni"]')).toEqual({
        kind: "plain",
        text: '["Zieloni"]',
      });
    });
  });

  describe("given packed text with raw line breaks inside its values", () => {
    it("reads it and keeps the line breaks in the value", () => {
      expect(
        parsePackedText(
          '{ "short": "Krótki opis.", "long": "Pierwszy akapit.\n\nDrugi akapit.\r\nTrzeci." }',
        ),
      ).toEqual({
        kind: "packed",
        value: {
          short: "Krótki opis.",
          long: "Pierwszy akapit.\n\nDrugi akapit.\r\nTrzeci.",
        },
      });
    });

    it("still reads pretty-printed packed text with line breaks between its keys", () => {
      expect(
        parsePackedText(
          '{\n  "m": "Zielony postępowiec",\n  "f": "Zielona postępowczyni"\n}',
        ),
      ).toEqual({
        kind: "packed",
        value: { m: "Zielony postępowiec", f: "Zielona postępowczyni" },
      });
      expect(
        parsePackedText(
          '{\n  "short": "Krótki \\"opis\\".",\n  "long": "Pierwszy akapit.\n\nDrugi akapit."\n}',
        ),
      ).toEqual({
        kind: "packed",
        value: {
          short: 'Krótki "opis".',
          long: "Pierwszy akapit.\n\nDrugi akapit.",
        },
      });
    });
  });

  describe("given text that opens like packed text and does not parse", () => {
    it("returns absent", () => {
      expect(parsePackedText('{"name":"Zieloni"')).toEqual({ kind: "absent" });
      expect(parsePackedText("{name: 'Zieloni'}")).toEqual({ kind: "absent" });
      expect(parsePackedText("{Zieloni}")).toEqual({ kind: "absent" });
      expect(parsePackedText('{"long":"Pierwszy.\nDrugi.",}')).toEqual({
        kind: "absent",
      });
    });
  });
});

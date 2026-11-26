import { describe, expect, it } from "vitest";

import type { OwnResultModule } from "@/types/results";

import { toSingleLanguageModule } from "./toSingleLanguageModule";

const record: OwnResultModule = {
  id: "compass",
  type: "nolan_chart",
  position: 3,
  column: "end",
  axisIds: ["economy", "society"],
  values: [
    { key: "title", value: { pl: "Kompas", en: "Compass" } },
    { key: "description", value: { pl: "Dwie osie.", en: "Two axes." } },
    { key: "marker", value: "none" },
    { key: "label.centre", value: { pl: "Centrowy", en: "Centrist" } },
    {
      key: "label.horizontalStartModerate",
      value: { pl: "Lewicowy gospodarczo" },
    },
    { key: "color.topLeft", value: "#ff0000" },
    { key: "note", value: { pl: "Uwaga", en: "Note" } },
  ],
};

const getValue = (language: string, key: string) =>
  toSingleLanguageModule(record, language).values.find(
    (pair) => pair.key === key,
  )?.value;

describe("toSingleLanguageModule()", () => {
  describe("given a record with its texts in two languages", () => {
    it.each([
      ["en", "Compass", "Two axes.", "Centrist"],
      ["pl", "Kompas", "Dwie osie.", "Centrowy"],
    ])("holds each text in the language asked for: %s", (language, title, description, centre) => {
      expect(getValue(language, "title")).toBe(title);
      expect(getValue(language, "description")).toBe(description);
      expect(getValue(language, "label.centre")).toBe(centre);
    });

    it("turns a value that holds each language into one text whatever its key, a key the app does not know included", () => {
      expect(getValue("en", "note")).toBe("Note");
      expect(getValue("pl", "note")).toBe("Uwaga");
    });

    it("falls back to Polish for a text that is not written in that language", () => {
      expect(getValue("en", "label.horizontalStartModerate")).toBe(
        "Lewicowy gospodarczo",
      );
      expect(getValue("de", "title")).toBe("Kompas");
      expect(getValue("de", "label.centre")).toBe("Centrowy");
    });

    it("leaves a plain value, the order of the pairs and every other field as written", () => {
      expect(toSingleLanguageModule(record, "en")).toStrictEqual({
        id: "compass",
        type: "nolan_chart",
        position: 3,
        column: "end",
        axisIds: ["economy", "society"],
        values: [
          { key: "title", value: "Compass" },
          { key: "description", value: "Two axes." },
          { key: "marker", value: "none" },
          { key: "label.centre", value: "Centrist" },
          {
            key: "label.horizontalStartModerate",
            value: "Lewicowy gospodarczo",
          },
          { key: "color.topLeft", value: "#ff0000" },
          { key: "note", value: "Note" },
        ],
      });
    });

    it("leaves the record it was given as it is", () => {
      const before = structuredClone(record);

      toSingleLanguageModule(record, "en");

      expect(record).toStrictEqual(before);
    });
  });

  describe("given a record without values", () => {
    it("has none", () => {
      expect(
        toSingleLanguageModule(
          {
            id: "header",
            type: "header",
            position: 0,
            orientationIds: ["a"],
            values: [],
          },
          "pl",
        ),
      ).toStrictEqual({
        id: "header",
        type: "header",
        position: 0,
        orientationIds: ["a"],
        values: [],
      });
    });
  });
});

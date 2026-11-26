import { describe, expect, it } from "vitest";

import type { OwnResultModule } from "@/types/results";

import { toSingleLanguageModule } from "./toSingleLanguageModule";

const record: OwnResultModule = {
  id: "compass",
  type: "nolan_chart",
  position: 3,
  column: "end",
  title: { pl: "Kompas", en: "Compass" },
  description: { pl: "Dwie osie.", en: "Two axes." },
  axisIds: ["economy", "society"],
  params: { marker: null },
  labels: {
    centre: { pl: "Centrowy", en: "Centrist" },
    horizontalStartModerate: { pl: "Lewicowy gospodarczo" },
  },
  colors: { topLeft: "#ff0000" },
};

describe("toSingleLanguageModule()", () => {
  describe("given a record with its texts in two languages", () => {
    it("holds each text in the language asked for", () => {
      expect(toSingleLanguageModule(record, "en")).toMatchObject({
        title: "Compass",
        description: "Two axes.",
        labels: { centre: "Centrist" },
      });
      expect(toSingleLanguageModule(record, "pl")).toMatchObject({
        title: "Kompas",
        description: "Dwie osie.",
        labels: { centre: "Centrowy" },
      });
    });

    it("falls back to Polish for a text that is not written in that language", () => {
      expect(
        toSingleLanguageModule(record, "en").labels.horizontalStartModerate,
      ).toBe("Lewicowy gospodarczo");
      expect(toSingleLanguageModule(record, "de")).toMatchObject({
        title: "Kompas",
        description: "Dwie osie.",
        labels: {
          centre: "Centrowy",
          horizontalStartModerate: "Lewicowy gospodarczo",
        },
      });
    });

    it("leaves every other field as written", () => {
      expect(toSingleLanguageModule(record, "en")).toEqual({
        id: "compass",
        type: "nolan_chart",
        position: 3,
        column: "end",
        title: "Compass",
        description: "Two axes.",
        axisIds: ["economy", "society"],
        params: { marker: null },
        labels: {
          centre: "Centrist",
          horizontalStartModerate: "Lewicowy gospodarczo",
        },
        colors: { topLeft: "#ff0000" },
      });
    });
  });

  describe("given a record without texts", () => {
    it("has no title, no description and no labels", () => {
      const module = toSingleLanguageModule(
        { id: "header", type: "header", position: 0, orientationIds: ["a"] },
        "pl",
      );

      expect(module).toEqual({
        id: "header",
        type: "header",
        position: 0,
        orientationIds: ["a"],
        labels: {},
      });
      expect(module.title).toBeUndefined();
      expect(module.description).toBeUndefined();
    });
  });
});

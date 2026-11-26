import { describe, expect, it } from "vitest";

import {
  resultModulePairSchema,
  resultModuleResponseSchema,
} from "./resultModule";

const record = { id: "f0a1", type: "single_axis", position: 2 };

const DEFAULTS = { column: "start" };

const parse = (overrides: Record<string, unknown>) =>
  resultModuleResponseSchema.parse({ ...record, ...overrides });

describe("resultModuleResponseSchema", () => {
  describe("given a record with every field", () => {
    it("accepts the fields that are read, as sent", () => {
      const sent = {
        id: "f0a1",
        type: "nolan_chart",
        position: 4,
        column: "end",
        orientationIds: ["a"],
        axisIds: ["x", "y"],
        values: [
          { key: "title", value: "Kompas" },
          { key: "description", value: "Gdzie jesteś na mapie poglądów." },
          { key: "marker", value: 60 },
          { key: "label.centre", value: "Centrum" },
          { key: "color.topLeft", value: "#ef4444" },
        ],
      };

      expect(
        resultModuleResponseSchema.parse({ ...sent, surveyId: "60beb898" }),
      ).toEqual(sent);
    });
  });

  describe("given a record that sends its title, description, parameters, labels or colours as fields, as the earlier versions of the contract had it", () => {
    const fields = {
      title: "Kompas",
      description: "Gdzie jesteś na mapie poglądów.",
      params: { marker: 60, groupBy: "category" },
      labels: { centre: "Centrum" },
      colors: { topLeft: "#ef4444" },
      selection: "linked_to_leader",
      groupBy: "category",
      marker: 60,
      visibleRows: 5,
    };

    it("does not read them", () => {
      expect(parse(fields)).toEqual({ ...record, ...DEFAULTS });
    });

    it("does not read them beside its values: only the values count", () => {
      const values = [{ key: "marker", value: 20 }];

      expect(parse({ ...fields, values })).toEqual({
        ...record,
        ...DEFAULTS,
        values,
      });
    });
  });

  describe("given only an identifier, a type and a position", () => {
    it("accepts it, with every other field at its default", () => {
      expect(resultModuleResponseSchema.parse(record)).toEqual({
        ...record,
        ...DEFAULTS,
      });
    });
  });

  describe("given a type", () => {
    it.each([
      ["header"],
      ["single_axis"],
      ["double_axis"],
      ["multi_axis"],
      ["horizontal_bar"],
      ["nolan_chart"],
      ["archetype"],
      ["traits"],
    ])("accepts %j", (type) => {
      expect(parse({ type }).type).toBe(type);
    });

    it.each([
      [undefined],
      [null],
      [""],
      ["radar"],
      ["HEADER"],
      ["single-axis"],
      [" header "],
      [7],
      [{}],
    ])("does not accept %j", (type) => {
      expect(
        resultModuleResponseSchema.safeParse({ ...record, type }).success,
      ).toBe(false);
    });
  });

  describe("given no identifier, or a blank one", () => {
    it.each([
      [undefined],
      [null],
      [""],
      [" \n\t "],
      [7],
      [{}],
    ])("does not accept the identifier %j", (id) => {
      expect(
        resultModuleResponseSchema.safeParse({ ...record, id }).success,
      ).toBe(false);
    });
  });

  describe("given a position", () => {
    it.each([[0], [-1], [2.5], [40]])("accepts %j as sent", (position) => {
      expect(parse({ position }).position).toBe(position);
    });

    it.each([
      [undefined],
      [null],
      ["2"],
      [Number.NaN],
      [Number.POSITIVE_INFINITY],
      [Number.NEGATIVE_INFINITY],
      [true],
    ])("does not accept %j", (position) => {
      expect(
        resultModuleResponseSchema.safeParse({ ...record, position }).success,
      ).toBe(false);
    });
  });

  describe("given something that is not an object", () => {
    it.each([
      [undefined],
      [null],
      ["f0a1"],
      [7],
      [[]],
      [[record]],
    ])("does not accept %j", (response) => {
      expect(resultModuleResponseSchema.safeParse(response).success).toBe(
        false,
      );
    });
  });

  describe("given a column", () => {
    it("accepts the values the API has for it", () => {
      expect(parse({ column: "end" }).column).toBe("end");
      expect(parse({ column: "start" }).column).toBe("start");
    });

    it.each([
      [null],
      [""],
      ["middle"],
      ["END"],
      [7],
      [{}],
    ])("reads %j as the default of the field", (column) => {
      expect(parse({ column }).column).toBe("start");
    });
  });

  describe("given values", () => {
    it("leaves the items of the list as sent: they are read pair by pair", () => {
      const values = [
        { key: "title", value: "Partie" },
        { key: "marker", value: null },
        { key: "sortBy", value: { by: "name" } },
        { value: "bez klucza" },
        null,
        7,
      ];

      expect(parse({ values }).values).toEqual(values);
      expect(parse({ values: [] }).values).toEqual([]);
    });

    it.each([
      [undefined],
      [null],
      [""],
      ["title"],
      [7],
      [true],
      [{ title: "Partie" }],
      [{ 0: { key: "title", value: "Partie" }, length: 1 }],
    ])("reads %j, which is not a list, as absent", (values) => {
      expect(parse({ values })).toEqual({ ...record, ...DEFAULTS });
    });
  });

  describe("given lists of identifiers", () => {
    it("leaves the items of the lists as sent", () => {
      const ids = ["a", 7, null, "a"];

      expect(parse({ orientationIds: ids, axisIds: ids })).toMatchObject({
        orientationIds: ids,
        axisIds: ids,
      });
    });

    it.each([[null], ["a"], [{ 0: "a" }], [7]])("reads %j as absent", (ids) => {
      expect(parse({ orientationIds: ids, axisIds: ids })).toEqual({
        ...record,
        ...DEFAULTS,
      });
    });
  });
});

describe("resultModulePairSchema", () => {
  describe("given a key and a value", () => {
    it.each([
      ["a text", "linked_to_leader"],
      ["an empty text", ""],
      ["a number", 37.5],
      ["zero", 0],
      ["yes", true],
      ["no", false],
      ["nothing", null],
    ])("accepts %s as sent", (_, value) => {
      expect(resultModulePairSchema.parse({ key: "name", value })).toEqual({
        key: "name",
        value,
      });
    });

    it("does not trim a text: whoever reads the key does", () => {
      expect(
        resultModulePairSchema.parse({ key: "title", value: "  Partie\n" }),
      ).toEqual({ key: "title", value: "  Partie\n" });
    });

    it("accepts any key, whether the app knows it or not, and checks no value against its key", () => {
      for (const pair of [
        { key: "marker", value: 250 },
        { key: "selection", value: 7 },
        { key: "sortBy", value: "name" },
        { key: "label.topLeftModerate", value: false },
        { key: "__proto__", value: "x" },
      ]) {
        expect(resultModulePairSchema.parse(pair)).toEqual(pair);
      }
    });

    it("reads nothing else of a pair", () => {
      expect(
        resultModulePairSchema.parse({
          key: "title",
          value: "Partie",
          id: "0d6b",
          language: "pl",
        }),
      ).toEqual({ key: "title", value: "Partie" });
    });
  });

  describe("given a value that is not a text, a number, a boolean or null", () => {
    it.each([
      ["no value", undefined],
      ["an object", { min: 1 }],
      ["a text per language", { pl: "Partie", en: "Parties" }],
      ["a list", ["a", "b"]],
      ["an empty list", []],
      ["a number that is not one", Number.NaN],
      ["an endless number", Number.POSITIVE_INFINITY],
    ])("does not accept %s", (_, value) => {
      expect(
        resultModulePairSchema.safeParse({ key: "name", value }).success,
      ).toBe(false);
    });

    it("does not accept a pair that leaves the value out", () => {
      expect(resultModulePairSchema.safeParse({ key: "name" }).success).toBe(
        false,
      );
    });
  });

  describe("given no key, or one that is blank or not a text", () => {
    it.each([
      [undefined],
      [null],
      [""],
      [" \n\t "],
      [7],
      [true],
      [["title"]],
      [{}],
    ])("does not accept the key %j", (key) => {
      expect(
        resultModulePairSchema.safeParse({ key, value: "Partie" }).success,
      ).toBe(false);
    });

    it("does not accept a pair that leaves the key out", () => {
      expect(
        resultModulePairSchema.safeParse({ value: "Partie" }).success,
      ).toBe(false);
    });
  });

  describe("given something that is not a pair", () => {
    it.each([
      [undefined],
      [null],
      ["title"],
      [7],
      [[]],
      [["title", "Partie"]],
    ])("does not accept %j", (pair) => {
      expect(resultModulePairSchema.safeParse(pair).success).toBe(false);
    });
  });
});

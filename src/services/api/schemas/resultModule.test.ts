import { describe, expect, it } from "vitest";

import { resultModuleResponseSchema } from "./resultModule";

const record = { id: "f0a1", type: "single_axis", position: 2 };

const DEFAULTS = {
  column: "start",
  params: {},
  labels: {},
  colors: {},
};

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
        title: "Kompas",
        description: "Gdzie jesteś na mapie poglądów.",
        orientationIds: ["a"],
        axisIds: ["x", "y"],
        params: {
          selection: "linked_to_leader",
          groupBy: "category",
          marker: 60,
          visibleRows: 5,
        },
        labels: { centre: "Centrum" },
        colors: { topLeft: "#ef4444" },
      };

      expect(
        resultModuleResponseSchema.parse({ ...sent, surveyId: "60beb898" }),
      ).toEqual(sent);
    });
  });

  describe("given a record that sends a setting as a field beside its parameters", () => {
    it("does not read the field: only the parameters count", () => {
      const sent = {
        selection: "linked_to_leader",
        groupBy: "category",
        marker: 60,
        visibleRows: 5,
      };

      expect(parse({ ...sent, params: { marker: 20 } })).toEqual({
        ...record,
        ...DEFAULTS,
        params: { marker: 20 },
      });
      expect(parse(sent)).toEqual({ ...record, ...DEFAULTS });
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

  describe("given parameters", () => {
    it.each([
      ["a number", 37.5],
      ["a text", "linked_to_leader"],
      ["a boolean", false],
      ["null", null],
      ["a list of those", [1, "two", true, null]],
      ["an empty list", []],
    ])("keeps %s as sent", (_, value) => {
      expect(parse({ params: { name: value } }).params).toEqual({
        name: value,
      });
    });

    it("keeps every name, whether the app knows it or not, and checks no value against its name", () => {
      const params = { marker: 250, selection: 7, sortBy: "name", "": "x" };

      expect(parse({ params }).params).toEqual(params);
    });

    it.each([
      ["an object", { min: 1 }],
      ["a list that holds an object", [1, {}]],
      ["a list that holds a list", [[1]]],
      ["a number that is not one", Number.NaN],
      ["an endless number", Number.POSITIVE_INFINITY],
    ])("reads %s as absent and keeps the other names", (_, value) => {
      expect(parse({ params: { name: value, marker: 20 } }).params).toEqual({
        marker: 20,
      });
    });

    it.each([
      [undefined],
      [null],
      ["marker"],
      [7],
      [true],
      [[["marker", 20]]],
    ])("reads %j as no parameters", (params) => {
      expect(parse({ params }).params).toEqual({});
    });
  });

  describe("given text with space or line breaks around it", () => {
    it("trims the title and the description", () => {
      expect(
        parse({ title: "  Partie\n", description: "\n Kto jest najbliżej. " }),
      ).toMatchObject({ title: "Partie", description: "Kto jest najbliżej." });
    });

    it.each([
      [undefined],
      [null],
      [""],
      [" \n\t "],
      [7],
    ])("reads the title and the description %j as absent", (text) => {
      expect(parse({ title: text, description: text })).toEqual({
        ...record,
        ...DEFAULTS,
      });
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

  describe("given labels or colours", () => {
    it("keeps every slot that holds text, as sent", () => {
      const slots = { link: " Strona ", unknown: "x", topLeft: "red" };

      expect(parse({ labels: slots, colors: slots })).toMatchObject({
        labels: slots,
        colors: slots,
      });
    });

    it("reads a slot that does not hold text as absent and keeps the others", () => {
      expect(
        parse({
          labels: { link: 7, centre: null, topLeftModerate: "Lewica" },
          colors: { topLeft: {}, topRight: ["#fff"], bottomLeft: "#fff" },
        }),
      ).toMatchObject({
        labels: { topLeftModerate: "Lewica" },
        colors: { bottomLeft: "#fff" },
      });
    });

    it.each([
      [undefined],
      [null],
      ["link"],
      [7],
      [["Strona"]],
    ])("reads %j as no slots", (slots) => {
      expect(parse({ labels: slots, colors: slots })).toMatchObject({
        labels: {},
        colors: {},
      });
    });
  });
});

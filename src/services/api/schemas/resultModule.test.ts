import { describe, expect, it } from "vitest";

import { resultModuleResponseSchema } from "./resultModule";

const record = { id: "f0a1", type: "single_axis", position: 2 };

const DEFAULTS = {
  column: "start",
  selection: "all",
  groupBy: "none",
  marker: 50,
  visibleRows: 3,
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
        selection: "linked_to_leader",
        groupBy: "category",
        marker: 60,
        visibleRows: 5,
        labels: { centre: "Centrum" },
        colors: { topLeft: "#ef4444" },
      };

      expect(
        resultModuleResponseSchema.parse({ ...sent, surveyId: "60beb898" }),
      ).toEqual(sent);
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

  describe("given a column, a selection or a grouping", () => {
    it("accepts the values the API has for each", () => {
      expect(parse({ column: "end" }).column).toBe("end");
      expect(parse({ column: "start" }).column).toBe("start");
      expect(parse({ selection: "linked_to_leader" }).selection).toBe(
        "linked_to_leader",
      );
      expect(parse({ selection: "all" }).selection).toBe("all");
      expect(parse({ groupBy: "category" }).groupBy).toBe("category");
      expect(parse({ groupBy: "none" }).groupBy).toBe("none");
    });

    it.each([
      [null],
      [""],
      ["middle"],
      ["END"],
      [7],
      [{}],
    ])("reads %j as the default of the field", (value) => {
      expect(
        parse({ column: value, selection: value, groupBy: value }),
      ).toMatchObject({ column: "start", selection: "all", groupBy: "none" });
    });
  });

  describe("given a marker", () => {
    it.each([[0], [37.5], [100]])("accepts %j as sent", (marker) => {
      expect(parse({ marker }).marker).toBe(marker);
    });

    it("accepts null as sent", () => {
      expect(parse({ marker: null }).marker).toBeNull();
    });

    it.each([
      [-0.1],
      [100.1],
      [Number.NaN],
      [Number.POSITIVE_INFINITY],
      ["60"],
      [false],
      [{}],
    ])("reads %j as the default", (marker) => {
      expect(parse({ marker }).marker).toBe(50);
    });
  });

  describe("given a number of visible rows", () => {
    it.each([[1], [3], [12]])("accepts %j as sent", (visibleRows) => {
      expect(parse({ visibleRows }).visibleRows).toBe(visibleRows);
    });

    it.each([
      [0],
      [-2],
      [2.5],
      [Number.NaN],
      [Number.POSITIVE_INFINITY],
      ["4"],
      [null],
    ])("reads %j as the default", (visibleRows) => {
      expect(parse({ visibleRows }).visibleRows).toBe(3);
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

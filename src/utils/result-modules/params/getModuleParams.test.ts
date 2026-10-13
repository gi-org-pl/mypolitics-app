import { describe, expect, expectTypeOf, it } from "vitest";

import { RESULT_MODULE_TYPES } from "@/constants/results";
import type {
  ResultModule,
  ResultModuleParamsOf,
  ResultModuleParamValue,
  ResultModuleType,
} from "@/types/results";
import { createResultModule } from "@/utils/vitest/results/createResultModule";

import { getModuleParams } from "./getModuleParams";

// Every parameter a type reads, set to a value that is not its default.
const SET: { [Type in ResultModuleType]: ResultModuleParamsOf<Type> } = {
  header: {},
  single_axis: { marker: 20 },
  double_axis: { marker: 80 },
  multi_axis: { groupBy: "category", marker: 35.5 },
  horizontal_bar: {
    selection: "linked_to_leader",
    groupBy: "category",
    visibleRows: 7,
  },
  nolan_chart: {},
  archetype: {},
  traits: {},
};

// What a type is given when its record sets nothing.
const DEFAULTS: { [Type in ResultModuleType]: ResultModuleParamsOf<Type> } = {
  header: {},
  single_axis: { marker: 50 },
  double_axis: { marker: 50 },
  multi_axis: { groupBy: "none", marker: 50 },
  horizontal_bar: { selection: "all", groupBy: "none", visibleRows: 3 },
  nolan_chart: {},
  archetype: {},
  traits: {},
};

// Every name the app defines, and one nobody does, each with a value.
const EVERY_NAME = {
  selection: "linked_to_leader",
  groupBy: "category",
  marker: 20,
  visibleRows: 7,
  sortBy: "name",
};

type Params = Record<string, ResultModuleParamValue>;

const readBar = (params: Params) =>
  getModuleParams(createResultModule("ranking", "horizontal_bar", { params }));

const readAxes = (params: Params) =>
  getModuleParams(createResultModule("ideologies", "multi_axis", { params }));

describe("getModuleParams()", () => {
  describe.each(
    RESULT_MODULE_TYPES,
  )("given a record of the type %s", (type) => {
    describe("when every one of its parameters is set", () => {
      it("returns the values as set", () => {
        expect(
          getModuleParams(
            createResultModule("record", type, { params: SET[type] }),
          ),
        ).toStrictEqual(SET[type]);
      });
    });

    describe("when it has no parameters", () => {
      it("returns the default of every one", () => {
        expect(
          getModuleParams(createResultModule("record", type)),
        ).toStrictEqual(DEFAULTS[type]);
      });
    });

    describe("when it holds every name there is", () => {
      it("returns the names its type reads, and no other", () => {
        expect(
          Object.keys(
            getModuleParams(
              createResultModule("record", type, { params: EVERY_NAME }),
            ),
          ),
        ).toEqual(Object.keys(DEFAULTS[type]));
      });
    });
  });

  // The rows of "Reading a parameter".
  describe("given a name that is left out", () => {
    it("returns its default: selection all, groupBy none, marker 50, visibleRows 3", () => {
      expect(readBar({})).toStrictEqual({
        selection: "all",
        groupBy: "none",
        visibleRows: 3,
      });
      expect(readAxes({})).toStrictEqual({ groupBy: "none", marker: 50 });
    });

    it("returns the default of the one left out, beside the ones that are set", () => {
      expect(readBar({ visibleRows: 7 })).toStrictEqual({
        selection: "all",
        groupBy: "none",
        visibleRows: 7,
      });
    });
  });

  describe("given a selection", () => {
    it.each([
      ["all"],
      ["linked_to_leader"],
    ] as const)("returns %j", (selection) => {
      expect(readBar({ selection }).selection).toBe(selection);
    });

    it.each([
      [null],
      [""],
      ["linked"],
      ["linked-to-leader"],
      ["ALL"],
      [7],
      [true],
      [["all"]],
    ])("returns the default for %j, which is not allowed", (selection) => {
      expect(readBar({ selection }).selection).toBe("all");
    });
  });

  describe("given a grouping", () => {
    it.each([["none"], ["category"]] as const)("returns %j", (groupBy) => {
      expect(readBar({ groupBy }).groupBy).toBe(groupBy);
      expect(readAxes({ groupBy }).groupBy).toBe(groupBy);
    });

    it.each([
      [null],
      [""],
      ["axis"],
      ["Category"],
      [0],
      [true],
      [["category"]],
    ])("returns the default for %j, which is not allowed", (groupBy) => {
      expect(readBar({ groupBy }).groupBy).toBe("none");
      expect(readAxes({ groupBy }).groupBy).toBe("none");
    });
  });

  describe("given a marker that is a number from 0 to 100", () => {
    it.each([[0], [37.5], [62.5], [100]])("returns %j", (marker) => {
      expect(readAxes({ marker }).marker).toBe(marker);
    });
  });

  describe("given a marker that is null", () => {
    it("returns false: no reference line", () => {
      expect(readAxes({ marker: null }).marker).toBe(false);
    });
  });

  describe("given a marker that is outside 0 to 100 or is not a number", () => {
    it.each([
      [-1],
      [-0.1],
      [100.1],
      [100.5],
      [Number.NaN],
      [Number.POSITIVE_INFINITY],
      ["60"],
      [true],
      [false],
      [[60]],
    ])("returns 50 for %j", (marker) => {
      expect(readAxes({ marker }).marker).toBe(50);
    });
  });

  describe("given a number of visible rows that is whole, 1 or more", () => {
    it.each([[1], [3], [8], [13], [500]])("returns %j", (visibleRows) => {
      expect(readBar({ visibleRows }).visibleRows).toBe(visibleRows);
    });
  });

  describe("given a number of visible rows that is below 1, not whole or not a number", () => {
    it.each([
      [0],
      [-2],
      [2.5],
      [Number.NaN],
      [Number.POSITIVE_INFINITY],
      ["4"],
      [null],
      [true],
      [[4]],
    ])("returns 3 for %j", (visibleRows) => {
      expect(readBar({ visibleRows }).visibleRows).toBe(3);
    });
  });

  describe("given a type that reads no parameter", () => {
    it.each([
      ["header"],
      ["nolan_chart"],
      ["archetype"],
      ["traits"],
    ] as const)("returns an empty object for %s, whatever the record holds", (type) => {
      expect(
        getModuleParams(
          createResultModule("record", type, { params: EVERY_NAME }),
        ),
      ).toStrictEqual({});
    });
  });

  describe("given a horizontal bar record that also holds a marker and a name nobody defines", () => {
    const record = createResultModule("ranking", "horizontal_bar", {
      params: { visibleRows: 7, marker: 20, sortBy: "name" },
    });
    const params = getModuleParams(record);

    it("has neither in the result", () => {
      expect(params).toStrictEqual({
        selection: "all",
        groupBy: "none",
        visibleRows: 7,
      });
      expect(params).not.toHaveProperty("marker");
      expect(params).not.toHaveProperty("sortBy");
    });

    it("leaves both on the record", () => {
      expect(record.params).toStrictEqual({
        visibleRows: 7,
        marker: 20,
        sortBy: "name",
      });
    });
  });

  describe("given the same name on records of two types that read it", () => {
    it("reads it the same way for both", () => {
      const params = { marker: 250, groupBy: "category" };

      expect(readAxes(params).groupBy).toBe(readBar(params).groupBy);
      expect(readAxes(params).marker).toBe(
        getModuleParams(createResultModule("axis", "single_axis", { params }))
          .marker,
      );
    });
  });

  // Checked by the compiler, not at run time: `tsc` fails when one of these
  // stops holding.
  describe("the type of the result", () => {
    const bar = getModuleParams(createResultModule("bar", "horizontal_bar"));
    const axes = getModuleParams(createResultModule("axes", "multi_axis"));
    const axis = getModuleParams(createResultModule("axis", "single_axis"));
    const pair = getModuleParams(createResultModule("pair", "double_axis"));
    const header = getModuleParams(createResultModule("header", "header"));

    it("holds the names the type of the record reads, each as its definition reads it", () => {
      expectTypeOf(bar).toEqualTypeOf<{
        selection: "all" | "linked_to_leader";
        groupBy: "none" | "category";
        visibleRows: number;
      }>();
      expectTypeOf(axes).toEqualTypeOf<{
        groupBy: "none" | "category";
        marker: number | false;
      }>();
      expectTypeOf(axis).toEqualTypeOf<{ marker: number | false }>();
      expectTypeOf(pair).toEqualTypeOf<{ marker: number | false }>();
      expectTypeOf(header).toEqualTypeOf<Record<never, never>>();
    });

    it("does not let a type be asked for a name it does not read", () => {
      // @ts-expect-error A horizontal bar reads no marker.
      expect(bar.marker).toBeUndefined();
      // @ts-expect-error A multi axis reads no selection.
      expect(axes.selection).toBeUndefined();
      // @ts-expect-error A single axis reads no grouping.
      expect(axis.groupBy).toBeUndefined();
      // @ts-expect-error A header reads no parameter.
      expect(header.marker).toBeUndefined();
      // @ts-expect-error Nobody defines this name.
      expect(bar.sortBy).toBeUndefined();
    });

    it("gives a record whose type is not known no parameter to ask for", () => {
      const record: ResultModule = createResultModule("axis", "single_axis");
      const params = getModuleParams(record);

      // @ts-expect-error The record may be of a type that reads no marker.
      expect(params.marker).toBe(50);
    });
  });
});

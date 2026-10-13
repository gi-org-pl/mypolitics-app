import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import { RESULT_MODULE_TYPES } from "@/constants/results";
import type {
  ResultModule,
  ResultModuleType,
  ResultModuleValue,
  ResultModuleValuesOf,
} from "@/types/results";
import { createResultModule } from "@/utils/vitest/results/createResultModule";

import { getModuleValues } from "./getModuleValues";

// Every key a type reads, set to a value that is not its default. A key that
// is added to a type, or taken from it, has to be added here or taken from
// here before this file compiles.
const SET = {
  header: {
    description: "Kto jest najbliżej.",
    lowMatch: "named",
    "label.link": "Program",
    "label.lowMatch": "Żadna tożsamość nie jest wystarczająco blisko.",
  },
  single_axis: { description: "Jedna oś.", marker: 20 },
  double_axis: { description: "Dwie strony osi.", marker: 80 },
  multi_axis: {
    title: "Ideologie",
    description: "Wszystkie osie.",
    groupBy: "category",
    marker: 35.5,
  },
  horizontal_bar: {
    title: "Partie",
    description: "Partie twojej tożsamości.",
    selection: "linked_to_leader",
    groupBy: "category",
    visibleRows: 7,
    "label.empty": "Brak najbliższej partii",
  },
  nolan_chart: {
    description: "Dwie osie na jednej mapie.",
    "label.centre": "Centrum",
    "label.horizontalStartModerate": "Umiarkowany socjalizm",
    "label.horizontalStartExtreme": "Socjalizm",
    "label.horizontalEndModerate": "Umiarkowany rynek",
    "label.horizontalEndExtreme": "Wolny rynek",
    "label.verticalStartModerate": "Umiarkowany postęp",
    "label.verticalStartExtreme": "Postęp",
    "label.verticalEndModerate": "Umiarkowana tradycja",
    "label.verticalEndExtreme": "Tradycja",
    "label.topLeftModerate": "Umiarkowana lewica autorytarna",
    "label.topLeftExtreme": "Lewica autorytarna",
    "label.topLeftModerateShort": "Um. lewica aut.",
    "label.topLeftExtremeShort": "Lewica aut.",
    "label.topRightModerate": "Umiarkowana prawica autorytarna",
    "label.topRightExtreme": "Prawica autorytarna",
    "label.topRightModerateShort": "Um. prawica aut.",
    "label.topRightExtremeShort": "Prawica aut.",
    "label.bottomLeftModerate": "Umiarkowana lewica wolnościowa",
    "label.bottomLeftExtreme": "Lewica wolnościowa",
    "label.bottomLeftModerateShort": "Um. lewica wol.",
    "label.bottomLeftExtremeShort": "Lewica wol.",
    "label.bottomRightModerate": "Umiarkowana prawica wolnościowa",
    "label.bottomRightExtreme": "Prawica wolnościowa",
    "label.bottomRightModerateShort": "Um. prawica wol.",
    "label.bottomRightExtremeShort": "Prawica wol.",
    "color.topLeft": "#ef4444",
    "color.topRight": "oklch(74.6% 0.16 232.661)",
    "color.bottomLeft": "rgb(16 185 129)",
    "color.bottomRight": "#7c3aed",
  },
  archetype: {
    title: "Tożsamość",
    description: "Typ, do którego ci blisko.",
    lowMatch: "named",
  },
  traits: { title: "Cechy", description: "Cechy, które zdobywasz." },
} satisfies { [Type in ResultModuleType]: ResultModuleValuesOf<Type> };

// The keys that have a default, each with it. Every other key has none.
const DEFAULTS: Record<string, unknown> = {
  selection: "all",
  groupBy: "none",
  marker: 50,
  visibleRows: 3,
  lowMatch: "no_match",
};

// What a type is given when its record sets nothing.
const toDefaults = (type: ResultModuleType): Record<string, unknown> =>
  Object.fromEntries(Object.keys(SET[type]).map((key) => [key, DEFAULTS[key]]));

// Every key the app defines, and one nobody does, each with a value.
const EVERY_KEY: Record<string, ResultModuleValue> = {
  ...SET.header,
  ...SET.nolan_chart,
  ...SET.multi_axis,
  ...SET.horizontal_bar,
  sortBy: "name",
};

type Values = Record<string, ResultModuleValue>;

const readBar = (values: Values) =>
  getModuleValues(createResultModule("ranking", "horizontal_bar", { values }));

const readAxes = (values: Values) =>
  getModuleValues(createResultModule("ideologies", "multi_axis", { values }));

const readHeader = (values: Values) =>
  getModuleValues(createResultModule("header", "header", { values }));

const readMap = (values: Values) =>
  getModuleValues(createResultModule("compass", "nolan_chart", { values }));

describe("getModuleValues()", () => {
  describe.each(
    RESULT_MODULE_TYPES,
  )("given a record of the type %s", (type) => {
    describe("when every one of its keys is set", () => {
      it("returns the values as set", () => {
        expect(
          getModuleValues(
            createResultModule("record", type, { values: SET[type] }),
          ),
        ).toStrictEqual(SET[type]);
      });
    });

    describe("when it has no values", () => {
      it("returns the default of every key that has one, and nothing for the others", () => {
        expect(
          getModuleValues(createResultModule("record", type)),
        ).toStrictEqual(toDefaults(type));
      });
    });

    describe("when it holds every key there is", () => {
      it("returns the keys its type reads, and no other", () => {
        expect(
          Object.keys(
            getModuleValues(
              createResultModule("record", type, { values: EVERY_KEY }),
            ),
          ).sort(),
        ).toEqual(Object.keys(SET[type]).sort());
      });
    });
  });

  // The rows of "Reading a key".
  describe("given a key that is left out", () => {
    it("returns its default: selection all, groupBy none, marker 50, visibleRows 3, lowMatch no_match", () => {
      expect(readBar({})).toMatchObject({
        selection: "all",
        groupBy: "none",
        visibleRows: 3,
      });
      expect(readAxes({})).toMatchObject({ groupBy: "none", marker: 50 });
      expect(readHeader({})).toMatchObject({ lowMatch: "no_match" });
    });

    it("returns no title, no description, no label and no colour", () => {
      expect(readBar({})).toMatchObject({
        title: undefined,
        description: undefined,
      });
      expect(readHeader({})).toStrictEqual({
        description: undefined,
        lowMatch: "no_match",
        "label.link": undefined,
        "label.lowMatch": undefined,
      });
      expect(
        Object.values(readMap({})).filter((value) => value !== undefined),
      ).toEqual([]);
    });

    it("returns the default of the one left out, beside the ones that are set", () => {
      expect(readBar({ title: "Partie", visibleRows: 7 })).toStrictEqual({
        title: "Partie",
        description: undefined,
        selection: "all",
        groupBy: "none",
        visibleRows: 7,
        "label.empty": undefined,
      });
    });
  });

  describe("given what a module does with a leader below a partial match", () => {
    it.each([["no_match"], ["named"]])("returns %s as it is", (lowMatch) => {
      expect(readHeader({ lowMatch })).toMatchObject({ lowMatch });
    });

    it.each([
      ["leader"],
      ["NAMED"],
      [""],
      [1],
      [true],
      [null],
    ])("reads %j as its default, saying that nothing matches", (lowMatch) => {
      expect(readHeader({ lowMatch })).toMatchObject({ lowMatch: "no_match" });
    });
  });

  describe("given a text", () => {
    it("returns it without the space around it", () => {
      expect(
        readBar({
          title: "  Partie\n",
          description: "\n Kto jest najbliżej. ",
        }),
      ).toMatchObject({ title: "Partie", description: "Kto jest najbliżej." });
      expect(readHeader({ "label.link": " Zobacz stronę\n" })).toMatchObject({
        "label.link": "Zobacz stronę",
      });
      expect(readMap({ "label.centre": "\tCentrum " })).toMatchObject({
        "label.centre": "Centrum",
      });
    });
  });

  describe("given a text that is blank, or not a text", () => {
    it.each([
      [""],
      [" \n\t "],
      [7],
      [true],
      [false],
      [null],
    ])("reads %j as if the key were left out", (text) => {
      expect(readBar({ title: text, description: text })).toStrictEqual(
        readBar({}),
      );
      expect(readHeader({ "label.link": text })).toStrictEqual(readHeader({}));
      expect(
        readMap({ "label.centre": text, "label.topLeftModerate": text }),
      ).toStrictEqual(readMap({}));
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
    ])("returns 3 for %j", (visibleRows) => {
      expect(readBar({ visibleRows }).visibleRows).toBe(3);
    });
  });

  describe("given a colour that passes the app's colour check", () => {
    it("returns it, without the space around it", () => {
      expect(
        readMap({ "color.topLeft": "#ef4444", "color.topRight": " #FFF " }),
      ).toMatchObject({ "color.topLeft": "#ef4444", "color.topRight": "#FFF" });
    });
  });

  describe("given a colour that does not pass the app's colour check", () => {
    it.each([
      ["red"],
      ["var(--gi-red)"],
      ["url(https://example.com/a.png)"],
      ["#ef4444; background: red"],
      ["#12345"],
      [""],
      [7],
      [true],
      [null],
    ])("reads %j as if the key were left out", (color) => {
      expect(
        readMap({ "color.topLeft": color, "color.bottomRight": color }),
      ).toStrictEqual(readMap({}));
    });
  });

  describe("given a type that reads no key but the description", () => {
    afterEach(() => {
      vi.doUnmock("@/constants/results");
      vi.resetModules();
    });

    it("returns the description alone, whatever the record holds", async () => {
      // No type of today reads so little, so the table of keys is given one
      // that does: what a type reads comes from the table and from nowhere
      // else.
      vi.resetModules();
      vi.doMock("@/constants/results", async (importOriginal) => {
        const constants =
          await importOriginal<typeof import("@/constants/results")>();

        return {
          ...constants,
          RESULT_MODULE_KEYS: {
            ...constants.RESULT_MODULE_KEYS,
            traits: ["description"],
          },
        };
      });

      const { getModuleValues: read } = await import("./getModuleValues");
      const record = createResultModule("traits", "traits", {
        values: EVERY_KEY,
      });

      expect(read(record)).toStrictEqual({
        description: EVERY_KEY.description,
      });
      expect(read({ ...record, values: {} })).toStrictEqual({
        description: undefined,
      });
    });
  });

  describe("given a horizontal bar record that also holds a marker, a label of the map and a key nobody defines", () => {
    const record = createResultModule("ranking", "horizontal_bar", {
      values: {
        visibleRows: 7,
        marker: 20,
        "label.centre": "Centrum",
        sortBy: "name",
      },
    });
    const values = getModuleValues(record);

    it("has none of the three in the result", () => {
      expect(values).toStrictEqual({
        title: undefined,
        description: undefined,
        selection: "all",
        groupBy: "none",
        visibleRows: 7,
        "label.empty": undefined,
      });
      expect(values).not.toHaveProperty("marker");
      expect(values).not.toHaveProperty("label.centre");
      expect(values).not.toHaveProperty("sortBy");
    });

    it("leaves all three on the record", () => {
      expect(record.values).toStrictEqual({
        visibleRows: 7,
        marker: 20,
        "label.centre": "Centrum",
        sortBy: "name",
      });
    });
  });

  describe("given the same key on records of two types that read it", () => {
    it("reads it the same way for both", () => {
      const values = {
        marker: 250,
        groupBy: "category",
        title: " Tytuł ",
        description: "",
      };

      expect(readAxes(values).groupBy).toBe(readBar(values).groupBy);
      expect(readAxes(values).title).toBe(readBar(values).title);
      expect(readAxes(values).description).toBe(readHeader(values).description);
      expect(readAxes(values).marker).toBe(
        getModuleValues(createResultModule("axis", "single_axis", { values }))
          .marker,
      );
    });
  });

  // Checked by the compiler, not at run time: `tsc` fails when one of these
  // stops holding.
  describe("the type of the result", () => {
    const bar = getModuleValues(createResultModule("bar", "horizontal_bar"));
    const axes = getModuleValues(createResultModule("axes", "multi_axis"));
    const axis = getModuleValues(createResultModule("axis", "single_axis"));
    const pair = getModuleValues(createResultModule("pair", "double_axis"));
    const header = getModuleValues(createResultModule("header", "header"));
    const map = getModuleValues(createResultModule("map", "nolan_chart"));
    const traits = getModuleValues(createResultModule("traits", "traits"));

    it("holds the keys the type of the record reads, each as its definition reads it", () => {
      expectTypeOf(bar).toEqualTypeOf<{
        title: string | undefined;
        description: string | undefined;
        selection: "all" | "linked_to_leader";
        groupBy: "none" | "category";
        visibleRows: number;
        "label.empty": string | undefined;
      }>();
      expectTypeOf(axes).toEqualTypeOf<{
        title: string | undefined;
        description: string | undefined;
        groupBy: "none" | "category";
        marker: number | false;
      }>();
      expectTypeOf(axis).toEqualTypeOf<{
        description: string | undefined;
        marker: number | false;
      }>();
      expectTypeOf(pair).toEqualTypeOf<{
        description: string | undefined;
        marker: number | false;
      }>();
      expectTypeOf(header).toEqualTypeOf<{
        description: string | undefined;
        lowMatch: "no_match" | "named";
        "label.link": string | undefined;
        "label.lowMatch": string | undefined;
      }>();
      expectTypeOf(traits).toEqualTypeOf<{
        title: string | undefined;
        description: string | undefined;
      }>();
      expectTypeOf(map["label.centre"]).toEqualTypeOf<string | undefined>();
      expectTypeOf(map["label.topLeftExtremeShort"]).toEqualTypeOf<
        string | undefined
      >();
      expectTypeOf(map["color.bottomRight"]).toEqualTypeOf<
        string | undefined
      >();
    });

    it("does not let a type be asked for a key it does not read", () => {
      // @ts-expect-error A horizontal bar reads no marker.
      expect(bar.marker).toBeUndefined();
      // @ts-expect-error A multi axis reads no selection.
      expect(axes.selection).toBeUndefined();
      // @ts-expect-error A single axis reads no grouping.
      expect(axis.groupBy).toBeUndefined();
      // @ts-expect-error A single axis reads no title.
      expect(axis.title).toBeUndefined();
      // @ts-expect-error A header reads no marker.
      expect(header.marker).toBeUndefined();
      // @ts-expect-error A header reads no label of the map.
      expect(header["label.centre"]).toBeUndefined();
      // @ts-expect-error The map does not read the label of the header's link.
      expect(map["label.link"]).toBeUndefined();
      // @ts-expect-error The map has no colour for its middle.
      expect(map["color.centre"]).toBeUndefined();
      // @ts-expect-error Nobody defines this key.
      expect(bar.sortBy).toBeUndefined();
    });

    it("gives a record whose type is not known the keys every type reads, and no other", () => {
      const record: ResultModule = createResultModule("axis", "single_axis");
      const values = getModuleValues(record);

      expect(values.description).toBeUndefined();
      // @ts-expect-error The record may be of a type that reads no marker.
      expect(values.marker).toBe(50);
    });
  });
});

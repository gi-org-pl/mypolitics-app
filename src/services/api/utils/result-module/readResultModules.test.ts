import { describe, expect, it } from "vitest";

import type { ResultModule } from "@/types/results";

import { readResultModules } from "./readResultModules";
import {
  QUIZ_AXIS_IDS,
  QUIZ_ORIENTATION_IDS,
  resultModulesResponse,
} from "./readResultModules.fixtures";

const known = {
  orientationIds: new Set(QUIZ_ORIENTATION_IDS),
  axisIds: new Set(QUIZ_AXIS_IDS),
};

const createRecord = (
  overrides: Record<string, unknown> = {},
): Record<string, unknown> => ({
  id: "m1",
  type: "single_axis",
  position: 0,
  ...overrides,
});

const read = (response: unknown): ResultModule[] =>
  readResultModules(response, known);

const readOne = (overrides: Record<string, unknown>): ResultModule =>
  read([createRecord(overrides)])[0];

const getIds = (response: unknown): string[] =>
  read(response).map(({ id }) => id);

const toTitle = (value: string) => ({ key: "title", value });

describe("readResultModules()", () => {
  describe("given a list with one record of each type", () => {
    it("reads eight records, every field as the reading table says and the values by key", () => {
      expect(read(resultModulesResponse)).toStrictEqual([
        {
          id: "module-header",
          type: "header",
          position: 0,
          column: "start",
          orientationIds: ["socialist", "liberal", "conservative"],
          axisIds: [],
          values: {
            description: "Tożsamość, do której jest ci najbliżej.",
            "label.link": "Zobacz stronę",
          },
        },
        {
          id: "module-single-axis",
          type: "single_axis",
          position: 1,
          column: "start",
          orientationIds: ["green"],
          axisIds: [],
          values: { marker: 60 },
        },
        {
          id: "module-double-axis",
          type: "double_axis",
          position: 2,
          column: "end",
          orientationIds: [],
          axisIds: ["economy"],
          values: {
            description: "Jak blisko ci do każdej ze stron osi.",
            marker: null,
          },
        },
        {
          id: "module-multi-axis",
          type: "multi_axis",
          position: 3,
          column: "start",
          orientationIds: [],
          axisIds: ["economy", "society"],
          values: { title: "Ideologie", groupBy: "category" },
        },
        {
          id: "module-horizontal-bar",
          type: "horizontal_bar",
          position: 4,
          column: "end",
          orientationIds: ["party-left", "party-right"],
          axisIds: [],
          values: {
            title: "Partie",
            description: "Partie powiązane z twoją tożsamością.",
            selection: "linked_to_leader",
            visibleRows: 5,
          },
        },
        {
          id: "module-nolan-chart",
          type: "nolan_chart",
          position: 5,
          column: "start",
          orientationIds: [],
          axisIds: ["compass-x", "compass-y"],
          values: {
            "label.centre": "Centrum",
            "label.horizontalStartModerate": "Umiarkowany socjalizm",
            "label.horizontalEndExtreme": "Wolny rynek",
            "label.verticalEndModerate": "Umiarkowany konserwatyzm",
            "label.topLeftExtreme": "Autorytarna lewica",
            "label.topLeftExtremeShort": "Aut. lewica",
            "color.topLeft": "#ef4444",
            "color.topRight": "oklch(74.6% 0.16 232.661)",
            "color.bottomLeft": "rgb(16 185 129)",
            "color.bottomRight": "#7c3aed",
          },
        },
        {
          id: "module-archetype",
          type: "archetype",
          position: 6,
          column: "end",
          orientationIds: ["socialist", "liberal", "conservative"],
          axisIds: [],
          values: { title: "Tożsamość" },
        },
        {
          id: "module-traits",
          type: "traits",
          position: 7,
          column: "start",
          orientationIds: ["green", "hidden"],
          axisIds: [],
          values: { title: "Cechy" },
        },
      ]);
    });
  });

  describe("the list", () => {
    describe("given no list, an empty list, or something that is not a list", () => {
      it.each([
        [undefined],
        [null],
        [[]],
        [""],
        ["resultModules"],
        [7],
        [true],
        [{}],
        [{ 0: createRecord(), length: 1 }],
      ])("returns an empty list for %j", (response) => {
        expect(read(response)).toEqual([]);
      });
    });

    describe("given records in any order", () => {
      it("puts them by position, lowest first, and keeps equal positions in the order of the list", () => {
        expect(
          getIds([
            createRecord({ id: "d", position: 2 }),
            createRecord({ id: "b", position: 1 }),
            createRecord({ id: "a", position: 0 }),
            createRecord({ id: "c", position: 1 }),
          ]),
        ).toEqual(["a", "b", "c", "d"]);
      });

      it("puts the header record first whatever its position", () => {
        expect(
          getIds([
            createRecord({ id: "a", position: 1 }),
            createRecord({ id: "header", type: "header", position: 1 }),
            createRecord({ id: "b", position: 0 }),
          ]),
        ).toEqual(["header", "b", "a"]);
      });
    });

    describe("given a list where the header record has the highest position", () => {
      it("puts the header first and the others after it by position", () => {
        expect(
          getIds([
            createRecord({
              id: "ranking",
              type: "horizontal_bar",
              position: 2,
            }),
            createRecord({ id: "axes", type: "multi_axis", position: 1 }),
            createRecord({ id: "header", type: "header", position: 9 }),
            createRecord({ id: "traits", type: "traits", position: 3 }),
          ]),
        ).toEqual(["header", "axes", "ranking", "traits"]);
      });
    });

    describe("given more than one header record", () => {
      it("keeps the first in that order and drops the others", () => {
        expect(
          getIds([
            createRecord({ id: "late", type: "header", position: 4 }),
            createRecord({ id: "a", position: 0 }),
            createRecord({ id: "early", type: "header", position: 2 }),
            createRecord({ id: "same", type: "header", position: 2 }),
          ]),
        ).toEqual(["early", "a"]);
      });
    });

    describe("given two records with the same identifier", () => {
      it("keeps the first", () => {
        expect(
          read([
            createRecord({
              id: "a",
              values: [toTitle("Pierwszy")],
              position: 5,
            }),
            createRecord({ id: "b", values: [toTitle("Inny")], position: 6 }),
            createRecord({ id: "a", values: [toTitle("Drugi")], position: 0 }),
          ]).map(({ id, values }) => [id, values.title]),
        ).toEqual([
          ["a", "Pierwszy"],
          ["b", "Inny"],
        ]);
      });

      it("keeps the first that can be read", () => {
        expect(
          read([
            createRecord({
              id: "a",
              values: [toTitle("Bez typu")],
              type: "radar",
            }),
            createRecord({ id: "a", values: [toTitle("Drugi")] }),
          ]).map(({ id, values }) => [id, values.title]),
        ).toEqual([["a", "Drugi"]]);
      });
    });
  });

  describe("invalid and edge input", () => {
    describe("given a record without an identifier, or with a blank one", () => {
      it("drops it and keeps the others", () => {
        expect(
          getIds([
            createRecord({ id: "a", position: 0 }),
            createRecord({ id: undefined }),
            createRecord({ id: "" }),
            createRecord({ id: " \n " }),
            createRecord({ id: null }),
            createRecord({ id: 7 }),
            createRecord({ id: "b", position: 1 }),
          ]),
        ).toEqual(["a", "b"]);
      });
    });

    describe("given a record whose type is missing or not one of the eight", () => {
      it("drops it and keeps the others", () => {
        expect(
          getIds([
            createRecord({ id: "a", position: 0 }),
            createRecord({ id: "c", type: undefined }),
            createRecord({ id: "d", type: null }),
            createRecord({ id: "e", type: "" }),
            createRecord({ id: "f", type: "radar" }),
            createRecord({ id: "g", type: "HEADER" }),
            createRecord({ id: "h", type: 7 }),
            createRecord({ id: "b", position: 1 }),
          ]),
        ).toEqual(["a", "b"]);
      });
    });

    describe("given a record whose position is missing or not a finite number", () => {
      it("drops it and keeps the others", () => {
        expect(
          getIds([
            createRecord({ id: "a", position: 0 }),
            createRecord({ id: "c", position: undefined }),
            createRecord({ id: "d", position: null }),
            createRecord({ id: "e", position: "1" }),
            createRecord({ id: "f", position: Number.NaN }),
            createRecord({ id: "g", position: Number.POSITIVE_INFINITY }),
            createRecord({ id: "h", position: Number.NEGATIVE_INFINITY }),
            createRecord({ id: "b", position: 1 }),
          ]),
        ).toEqual(["a", "b"]);
      });
    });

    describe("given a column that is missing or unknown", () => {
      it.each([
        [undefined],
        [null],
        [""],
        ["middle"],
        ["END"],
        [7],
      ])("reads %j as start", (column) => {
        expect(readOne({ column }).column).toBe("start");
      });

      it("keeps end", () => {
        expect(readOne({ column: "end" }).column).toBe("end");
      });
    });

    // The rows of "Reading a record".
    describe("given values that are a list of pairs", () => {
      it("keeps them by key, as saved", () => {
        expect(
          readOne({
            values: [
              { key: "title", value: "Partie" },
              { key: "selection", value: "linked_to_leader" },
              { key: "marker", value: null },
              { key: "visibleRows", value: 5 },
              { key: "isFolded", value: true },
            ],
          }).values,
        ).toStrictEqual({
          title: "Partie",
          selection: "linked_to_leader",
          marker: null,
          visibleRows: 5,
          isFolded: true,
        });
      });

      it.each([
        ["no key", { value: "Partie" }],
        ["a blank key", { key: " \n ", value: "Partie" }],
        ["a key that is not a text", { key: 7, value: "Partie" }],
        ["no value", { key: "title" }],
        [
          "a value that is an object",
          { key: "title", value: { pl: "Partie" } },
        ],
        ["a value that is a list", { key: "title", value: ["Partie"] }],
      ])("skips a pair with %s and keeps the others", (_, pair) => {
        expect(
          readOne({ values: [pair, { key: "marker", value: 20 }] }).values,
        ).toStrictEqual({ marker: 20 });
      });
    });

    describe("given the same key twice in one record", () => {
      it("counts the first", () => {
        expect(
          readOne({
            values: [
              { key: "marker", value: 20 },
              { key: "title", value: "Pierwszy" },
              { key: "marker", value: 80 },
              { key: "title", value: "Drugi" },
            ],
          }).values,
        ).toStrictEqual({ marker: 20, title: "Pierwszy" });
      });

      it("keeps the same key of another record apart", () => {
        expect(
          read([
            createRecord({ id: "a", values: [toTitle("Pierwszy")] }),
            createRecord({ id: "b", values: [toTitle("Drugi")], position: 1 }),
          ]).map(({ values }) => values.title),
        ).toEqual(["Pierwszy", "Drugi"]);
      });
    });

    describe("given values that are missing or are not a list", () => {
      it.each([
        [undefined],
        [null],
        [""],
        ["marker"],
        [7],
        [true],
        [{ marker: 20, title: "Partie" }],
        [{ 0: { key: "marker", value: 20 }, length: 1 }],
      ])("reads %j as no values", (values) => {
        expect(readOne({ values }).values).toStrictEqual({});
      });
    });

    describe("given a key the type of the record does not read, or one the app does not know", () => {
      const values = [
        { key: "marker", value: 250 },
        { key: "selection", value: "nobody" },
        { key: "label.centre", value: " \n " },
        { key: "label.link", value: "  Zobacz stronę\n" },
        { key: "color.topLeft", value: "url(https://example.com/a.png)" },
        { key: "sortBy", value: "name" },
      ];
      const byKey = {
        marker: 250,
        selection: "nobody",
        "label.centre": " \n ",
        "label.link": "  Zobacz stronę\n",
        "color.topLeft": "url(https://example.com/a.png)",
        sortBy: "name",
      };

      it.each([
        ["horizontal_bar"],
        ["header"],
        ["nolan_chart"],
        ["traits"],
      ])("keeps it on a %s record, and never interprets it: no value is checked, trimmed or dropped", (type) => {
        expect(readOne({ type, values }).values).toStrictEqual(byKey);
      });
    });

    describe("given a record that sends its title, description, parameters, labels or colours as fields, as the earlier versions of the contract had it", () => {
      const fields = {
        title: "Kompas",
        description: "Dwie osie.",
        params: { groupBy: "category", marker: null, visibleRows: 5 },
        labels: { centre: "Centrum", link: "Zobacz stronę" },
        colors: { topLeft: "#ef4444" },
        selection: "linked_to_leader",
        groupBy: "category",
        marker: null,
        visibleRows: 5,
      };

      it.each([
        ["nolan_chart"],
        ["header"],
        ["horizontal_bar"],
      ])("does not read them on a %s record that sends no values", (type) => {
        const record = readOne({ type, ...fields });

        expect(record).toStrictEqual(readOne({ type }));
        expect(record.values).toStrictEqual({});
        expect(Object.keys(record).sort()).toEqual([
          "axisIds",
          "column",
          "id",
          "orientationIds",
          "position",
          "type",
          "values",
        ]);
      });

      it("does not read them beside its values: only the values count", () => {
        const values = [
          { key: "groupBy", value: "none" },
          { key: "visibleRows", value: 2 },
        ];

        expect(readOne({ ...fields, values })).toStrictEqual(
          readOne({ values }),
        );
        expect(readOne({ ...fields, values }).values).toStrictEqual({
          groupBy: "none",
          visibleRows: 2,
        });
      });
    });

    describe("given lists of identifiers that are missing or not lists", () => {
      it.each([
        [undefined],
        [null],
        ["socialist"],
        [{ 0: "socialist" }],
        [7],
      ])("reads %j as empty lists", (ids) => {
        expect(readOne({ orientationIds: ids, axisIds: ids })).toMatchObject({
          orientationIds: [],
          axisIds: [],
        });
      });
    });

    describe("given an identifier the quiz does not have", () => {
      it("drops it and keeps the others in their order", () => {
        expect(
          readOne({
            orientationIds: ["liberal", "anarchist", "economy", 7, "socialist"],
            axisIds: ["society", "ecology", "liberal", null, "economy"],
          }),
        ).toMatchObject({
          orientationIds: ["liberal", "socialist"],
          axisIds: ["society", "economy"],
        });
      });
    });

    describe("given the same identifier twice in one list", () => {
      it("keeps it once, at its first place", () => {
        expect(
          readOne({
            orientationIds: ["liberal", "socialist", "liberal", "socialist"],
            axisIds: ["society", "society", "economy", "society"],
          }),
        ).toMatchObject({
          orientationIds: ["liberal", "socialist"],
          axisIds: ["society", "economy"],
        });
      });
    });

    describe("given an identifier of a hidden orientation", () => {
      it("keeps it", () => {
        expect(
          readOne({ orientationIds: ["hidden", "liberal"] }).orientationIds,
        ).toEqual(["hidden", "liberal"]);
      });
    });

    describe("given items that are not records", () => {
      it("never throws, and reads the records among them", () => {
        const response = [
          undefined,
          null,
          "header",
          7,
          true,
          [],
          [createRecord({ id: "nested" })],
          {},
          { id: {} },
          createRecord({
            id: "a",
            column: {},
            orientationIds: "liberal",
            values: "red",
            labels: [],
            colors: "red",
            marker: "50",
            visibleRows: [],
          }),
        ];

        expect(() => read(response)).not.toThrow();
        expect(read(response)).toStrictEqual([
          {
            id: "a",
            type: "single_axis",
            position: 0,
            column: "start",
            orientationIds: [],
            axisIds: [],
            values: {},
          },
        ]);
      });
    });
  });
});

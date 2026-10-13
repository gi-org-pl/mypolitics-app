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

describe("readResultModules()", () => {
  describe("given a list with one record of each type", () => {
    it("reads eight records, every field as the reading table says", () => {
      expect(read(resultModulesResponse)).toEqual([
        {
          id: "module-header",
          type: "header",
          position: 0,
          column: "start",
          description: "Tożsamość, do której jest ci najbliżej.",
          orientationIds: ["socialist", "liberal", "conservative"],
          axisIds: [],
          params: {},
          labels: { link: "Zobacz stronę" },
          colors: {},
        },
        {
          id: "module-single-axis",
          type: "single_axis",
          position: 1,
          column: "start",
          orientationIds: ["green"],
          axisIds: [],
          params: { marker: 60 },
          labels: {},
          colors: {},
        },
        {
          id: "module-double-axis",
          type: "double_axis",
          position: 2,
          column: "end",
          description: "Jak blisko ci do każdej ze stron osi.",
          orientationIds: [],
          axisIds: ["economy"],
          params: { marker: null },
          labels: {},
          colors: {},
        },
        {
          id: "module-multi-axis",
          type: "multi_axis",
          position: 3,
          column: "start",
          title: "Ideologie",
          orientationIds: [],
          axisIds: ["economy", "society"],
          params: { groupBy: "category" },
          labels: {},
          colors: {},
        },
        {
          id: "module-horizontal-bar",
          type: "horizontal_bar",
          position: 4,
          column: "end",
          title: "Partie",
          description: "Partie powiązane z twoją tożsamością.",
          orientationIds: ["party-left", "party-right"],
          axisIds: [],
          params: { selection: "linked_to_leader", visibleRows: 5 },
          labels: {},
          colors: {},
        },
        {
          id: "module-nolan-chart",
          type: "nolan_chart",
          position: 5,
          column: "start",
          orientationIds: [],
          axisIds: ["compass-x", "compass-y"],
          params: {},
          labels: {
            centre: "Centrum",
            horizontalStartModerate: "Umiarkowany socjalizm",
            horizontalEndExtreme: "Wolny rynek",
            verticalEndModerate: "Umiarkowany konserwatyzm",
            topLeftExtreme: "Autorytarna lewica",
            topLeftExtremeShort: "Aut. lewica",
          },
          colors: {
            topLeft: "#ef4444",
            topRight: "oklch(74.6% 0.16 232.661)",
            bottomLeft: "rgb(16 185 129)",
            bottomRight: "#7c3aed",
          },
        },
        {
          id: "module-archetype",
          type: "archetype",
          position: 6,
          column: "end",
          title: "Tożsamość",
          orientationIds: ["socialist", "liberal", "conservative"],
          axisIds: [],
          params: {},
          labels: {},
          colors: {},
        },
        {
          id: "module-traits",
          type: "traits",
          position: 7,
          column: "start",
          title: "Cechy",
          orientationIds: ["green", "hidden"],
          axisIds: [],
          params: {},
          labels: {},
          colors: {},
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
            createRecord({ id: "a", title: "Pierwszy", position: 5 }),
            createRecord({ id: "b", title: "Inny", position: 6 }),
            createRecord({ id: "a", title: "Drugi", position: 0 }),
          ]).map(({ id, title }) => [id, title]),
        ).toEqual([
          ["a", "Pierwszy"],
          ["b", "Inny"],
        ]);
      });

      it("keeps the first that can be read", () => {
        expect(
          read([
            createRecord({ id: "a", title: "Bez typu", type: "radar" }),
            createRecord({ id: "a", title: "Drugi" }),
          ]).map(({ id, title }) => [id, title]),
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

    describe("given parameters that are an object", () => {
      it("keeps them as sent, name by name", () => {
        const params = {
          selection: "linked_to_leader",
          marker: null,
          visibleRows: 5,
          isFolded: true,
          tags: ["a", 2, false, null],
        };

        expect(readOne({ params }).params).toEqual(params);
      });

      it.each([
        ["an object", { from: 1 }],
        ["a list that holds an object", ["a", {}]],
        ["a list that holds a list", [["a"]]],
      ])("drops a value that is %s and keeps the others", (_, value) => {
        expect(readOne({ params: { marker: 20, name: value } }).params).toEqual(
          { marker: 20 },
        );
      });
    });

    describe("given parameters that are missing or are not an object", () => {
      it.each([
        [undefined],
        [null],
        [""],
        ["marker"],
        [7],
        [true],
        [[["marker", 20]]],
      ])("reads %j as no parameters", (params) => {
        expect(readOne({ params }).params).toEqual({});
      });
    });

    describe("given a name the type of the record does not read, or one the app does not know", () => {
      it("keeps it on the record, and checks no value against its name", () => {
        const params = { marker: 250, selection: "nobody", sortBy: "name" };

        expect(readOne({ type: "horizontal_bar", params }).params).toEqual(
          params,
        );
        expect(readOne({ type: "header", params }).params).toEqual(params);
      });
    });

    describe("given a record that sends its settings as fields, as the first version of the contract had them", () => {
      const fields = {
        selection: "linked_to_leader",
        groupBy: "category",
        marker: null,
        visibleRows: 5,
      };

      it("does not read them when it sends no parameters", () => {
        expect(readOne(fields)).toEqual(readOne({}));
        expect(readOne(fields).params).toEqual({});
      });

      it("does not read them beside its parameters: only the parameters count", () => {
        const params = { groupBy: "none", visibleRows: 2 };

        expect(readOne({ ...fields, params })).toEqual(readOne({ params }));
      });
    });

    describe("given a title or a description that is missing, empty or only space", () => {
      it.each([
        [undefined],
        [null],
        [""],
        [" \n\t "],
        [7],
      ])("has neither for %j", (text) => {
        const record = readOne({ title: text, description: text });

        expect(record.title).toBeUndefined();
        expect(record.description).toBeUndefined();
      });
    });

    describe("given text with space or line breaks around it", () => {
      it("trims it", () => {
        expect(
          readOne({
            type: "header",
            title: "  Twój wynik\n",
            description: "\n\tNajbliższa ci tożsamość. ",
            labels: { link: " Zobacz stronę\n" },
          }),
        ).toMatchObject({
          title: "Twój wynik",
          description: "Najbliższa ci tożsamość.",
          labels: { link: "Zobacz stronę" },
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

    describe("given labels or colours that are missing or not an object", () => {
      it.each([
        [undefined],
        [null],
        ["link"],
        [7],
        [["Zobacz stronę"]],
      ])("reads %j as none", (slots) => {
        expect(
          readOne({ type: "header", labels: slots, colors: slots }),
        ).toMatchObject({ labels: {}, colors: {} });
      });
    });

    describe("given a slot the record's type does not have", () => {
      it("drops it and keeps the slots of the type", () => {
        expect(
          readOne({
            type: "header",
            labels: { link: "Zobacz stronę", centre: "Centrum", note: "x" },
            colors: { topLeft: "#ef4444" },
          }),
        ).toMatchObject({ labels: { link: "Zobacz stronę" }, colors: {} });
        expect(
          readOne({
            type: "nolan_chart",
            labels: { link: "Zobacz stronę", centre: "Centrum" },
            colors: { topLeft: "#ef4444", centre: "#ef4444" },
          }),
        ).toMatchObject({
          labels: { centre: "Centrum" },
          colors: { topLeft: "#ef4444" },
        });
        expect(
          readOne({
            type: "horizontal_bar",
            labels: { link: "Zobacz stronę", centre: "Centrum" },
            colors: { topLeft: "#ef4444" },
          }),
        ).toMatchObject({ labels: {}, colors: {} });
      });
    });

    describe("given a label that is not text, or blank", () => {
      it("drops it and keeps the others", () => {
        expect(
          readOne({
            type: "nolan_chart",
            labels: {
              centre: 7,
              topLeftModerate: null,
              topLeftExtreme: { pl: "Lewica" },
              topRightModerate: "",
              topRightExtreme: " \n ",
              bottomLeftModerate: "Lewica wolnościowa",
            },
          }).labels,
        ).toEqual({ bottomLeftModerate: "Lewica wolnościowa" });
      });
    });

    describe("given a colour that does not pass the colour check", () => {
      it("drops it and keeps the others", () => {
        expect(
          readOne({
            type: "nolan_chart",
            colors: {
              topLeft: "red",
              topRight: "var(--gi-red)",
              bottomLeft: "#12345",
              bottomRight: " #7c3aed ",
            },
          }).colors,
        ).toEqual({ bottomRight: "#7c3aed" });
        expect(
          readOne({
            type: "nolan_chart",
            colors: {
              topLeft: "url(https://example.com/a.png)",
              topRight: "#ef4444; background: red",
              bottomLeft: 7,
              bottomRight: null,
            },
          }).colors,
        ).toEqual({});
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
            labels: [],
            colors: "red",
            marker: "50",
            visibleRows: [],
          }),
        ];

        expect(() => read(response)).not.toThrow();
        expect(read(response)).toEqual([
          {
            id: "a",
            type: "single_axis",
            position: 0,
            column: "start",
            orientationIds: [],
            axisIds: [],
            params: {},
            labels: {},
            colors: {},
          },
        ]);
      });
    });
  });
});

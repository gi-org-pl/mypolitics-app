import { describe, expect, it } from "vitest";

import { resultModuleResponseSchema } from "@/services/api/schemas/resultModule";

import { toResultModule } from "./toResultModule";

const known = {
  orientationIds: new Set(["left", "right", "hidden"]),
  axisIds: new Set(["economy", "society"]),
};

const read = (
  response: Record<string, unknown>,
): ReturnType<typeof toResultModule> =>
  toResultModule(
    resultModuleResponseSchema.parse({
      id: "m1",
      type: "single_axis",
      position: 0,
      ...response,
    }),
    known,
  );

describe("toResultModule()", () => {
  describe("given a record with every field", () => {
    it("reads each field as sent, and the values by key", () => {
      expect(
        read({
          id: "0d6b0f7e",
          type: "horizontal_bar",
          position: 3,
          column: "end",
          orientationIds: ["right", "left"],
          axisIds: ["society"],
          values: [
            { key: "title", value: "Partie" },
            {
              key: "description",
              value: "Partie najbliższe twojej tożsamości.",
            },
            { key: "selection", value: "linked_to_leader" },
            { key: "groupBy", value: "category" },
            { key: "visibleRows", value: 5 },
          ],
        }),
      ).toStrictEqual({
        id: "0d6b0f7e",
        type: "horizontal_bar",
        position: 3,
        column: "end",
        orientationIds: ["right", "left"],
        axisIds: ["society"],
        values: {
          title: "Partie",
          description: "Partie najbliższe twojej tożsamości.",
          selection: "linked_to_leader",
          groupBy: "category",
          visibleRows: 5,
        },
      });
    });
  });

  describe("given only an identifier, a type and a position", () => {
    it("holds the default of every other field, and no values", () => {
      expect(read({})).toStrictEqual({
        id: "m1",
        type: "single_axis",
        position: 0,
        column: "start",
        orientationIds: [],
        axisIds: [],
        values: {},
      });
    });
  });

  describe("given values", () => {
    it("keeps them as saved, whatever the type of the record reads", () => {
      const values = [
        { key: "marker", value: null },
        { key: "selection", value: "nobody" },
        { key: "visibleRows", value: 0 },
        { key: "title", value: "  Partie\n" },
        { key: "label.centre", value: " \n " },
        { key: "color.topLeft", value: "red" },
        { key: "sortBy", value: "name" },
      ];
      const byKey = {
        marker: null,
        selection: "nobody",
        visibleRows: 0,
        title: "  Partie\n",
        "label.centre": " \n ",
        "color.topLeft": "red",
        sortBy: "name",
      };

      expect(read({ values }).values).toStrictEqual(byKey);
      expect(read({ type: "header", values }).values).toStrictEqual(byKey);
      expect(read({ type: "nolan_chart", values }).values).toStrictEqual(byKey);
    });

    it("skips a pair that cannot be read, and keeps the first of two with the same key", () => {
      expect(
        read({
          values: [
            { key: "marker", value: 20 },
            { key: "bounds", value: { min: 1 } },
            { value: "bez klucza" },
            { key: "marker", value: 80 },
          ],
        }).values,
      ).toStrictEqual({ marker: 20 });
    });

    it.each([
      [undefined],
      [null],
      ["title"],
      [7],
      [{ title: "Partie" }],
    ])("holds no values for %j, which is not a list", (values) => {
      expect(read({ values }).values).toStrictEqual({});
    });
  });

  describe("given a record that sends its title, description, parameters, labels or colours as fields", () => {
    it("reads none of them: they are neither fields nor values of the record", () => {
      const record = read({
        type: "nolan_chart",
        title: "Kompas",
        description: "Dwie osie.",
        params: { marker: 60 },
        labels: { centre: "Centrum" },
        colors: { topLeft: "#ef4444" },
      });

      expect(record).toStrictEqual({
        id: "m1",
        type: "nolan_chart",
        position: 0,
        column: "start",
        orientationIds: [],
        axisIds: [],
        values: {},
      });
    });
  });

  describe("given identifiers of orientations and axes", () => {
    it("keeps the ones the quiz has, in the order sent, a hidden one included", () => {
      expect(
        read({
          orientationIds: ["hidden", "right", "left"],
          axisIds: ["society", "economy"],
        }),
      ).toMatchObject({
        orientationIds: ["hidden", "right", "left"],
        axisIds: ["society", "economy"],
      });
    });

    it("drops the ones the quiz does not have, and anything that is not text", () => {
      expect(
        read({
          orientationIds: ["centre", "left", 7, null, "economy"],
          axisIds: ["left", "economy", {}, "ecology"],
        }),
      ).toMatchObject({ orientationIds: ["left"], axisIds: ["economy"] });
    });

    it("keeps a repeated one once, at its first place", () => {
      expect(
        read({
          orientationIds: ["right", "left", "right", "left", "hidden"],
          axisIds: ["society", "society", "economy", "society"],
        }),
      ).toMatchObject({
        orientationIds: ["right", "left", "hidden"],
        axisIds: ["society", "economy"],
      });
    });
  });
});

import { describe, expect, it } from "vitest";

import { RESULT_MODULE_SLOTS, RESULT_MODULE_TYPES } from "@/constants/results";
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

const EVERY_SLOT = Object.fromEntries(
  RESULT_MODULE_TYPES.flatMap((type) => [
    ...RESULT_MODULE_SLOTS[type].labels,
    ...RESULT_MODULE_SLOTS[type].colors,
  ]).map((slot) => [slot, "#123456"]),
);

describe("toResultModule()", () => {
  describe("given a record with every field", () => {
    it("reads each field as sent", () => {
      expect(
        read({
          id: "0d6b0f7e",
          type: "horizontal_bar",
          position: 3,
          column: "end",
          title: "Partie",
          description: "Partie najbliższe twojej tożsamości.",
          orientationIds: ["right", "left"],
          axisIds: ["society"],
          selection: "linked_to_leader",
          groupBy: "category",
          marker: 65,
          visibleRows: 5,
          labels: {},
          colors: {},
        }),
      ).toEqual({
        id: "0d6b0f7e",
        type: "horizontal_bar",
        position: 3,
        column: "end",
        title: "Partie",
        description: "Partie najbliższe twojej tożsamości.",
        orientationIds: ["right", "left"],
        axisIds: ["society"],
        selection: "linked_to_leader",
        groupBy: "category",
        marker: 65,
        visibleRows: 5,
        labels: {},
        colors: {},
      });
    });
  });

  describe("given only an identifier, a type and a position", () => {
    it("holds the default of every other field, and no title or description", () => {
      const record = read({});

      expect(record).toEqual({
        id: "m1",
        type: "single_axis",
        position: 0,
        column: "start",
        orientationIds: [],
        axisIds: [],
        selection: "all",
        groupBy: "none",
        marker: 50,
        visibleRows: 3,
        labels: {},
        colors: {},
      });
      expect(record.title).toBeUndefined();
      expect(record.description).toBeUndefined();
    });
  });

  describe("given a marker", () => {
    it("keeps a number as sent, the two ends included", () => {
      expect(read({ marker: 0 }).marker).toBe(0);
      expect(read({ marker: 100 }).marker).toBe(100);
    });

    it("reads null as no reference line", () => {
      expect(read({ marker: null }).marker).toBe(false);
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

  describe("given labels", () => {
    it("keeps the slots of the record's type, trimmed", () => {
      expect(
        read({ type: "header", labels: { link: "  Strona kandydata\n" } })
          .labels,
      ).toEqual({ link: "Strona kandydata" });
      expect(
        read({
          type: "nolan_chart",
          labels: {
            centre: "Centrum",
            horizontalEndExtreme: "Wolny rynek",
            topLeftModerateShort: "Lewica",
          },
        }).labels,
      ).toEqual({
        centre: "Centrum",
        horizontalEndExtreme: "Wolny rynek",
        topLeftModerateShort: "Lewica",
      });
    });

    it("drops a slot of another type", () => {
      expect(
        read({ type: "header", labels: { link: "Strona", centre: "Centrum" } })
          .labels,
      ).toEqual({ link: "Strona" });
      expect(
        read({
          type: "nolan_chart",
          labels: { link: "Strona", centre: "Centrum" },
        }).labels,
      ).toEqual({ centre: "Centrum" });
    });

    it("drops a blank label", () => {
      expect(
        read({
          type: "nolan_chart",
          labels: { centre: " \n ", topRightExtreme: "", topLeftExtreme: "A" },
        }).labels,
      ).toEqual({ topLeftExtreme: "A" });
    });
  });

  describe("given colours", () => {
    it("keeps the slots of the record's type that hold a plain colour", () => {
      expect(
        read({
          type: "nolan_chart",
          colors: {
            topLeft: "#ef4444",
            topRight: " oklch(74.6% 0.16 232.661) ",
            bottomLeft: "rgb(16 185 129 / 50%)",
            bottomRight: "#FFF",
          },
        }).colors,
      ).toEqual({
        topLeft: "#ef4444",
        topRight: "oklch(74.6% 0.16 232.661)",
        bottomLeft: "rgb(16 185 129 / 50%)",
        bottomRight: "#FFF",
      });
    });

    it("drops a colour that is not a plain colour value", () => {
      expect(
        read({
          type: "nolan_chart",
          colors: {
            topLeft: "red",
            topRight: "var(--gi-red)",
            bottomLeft: "url(https://example.com/a.png)",
            bottomRight: "#12345",
          },
        }).colors,
      ).toEqual({});
    });

    it("drops a slot of another type", () => {
      expect(
        read({
          type: "nolan_chart",
          colors: { topLeft: "#ef4444", centre: "#ef4444", link: "#ef4444" },
        }).colors,
      ).toEqual({ topLeft: "#ef4444" });
      expect(
        read({ type: "header", colors: { topLeft: "#ef4444" } }).colors,
      ).toEqual({});
    });
  });

  describe("given a type without slots", () => {
    it.each([
      ["single_axis"],
      ["double_axis"],
      ["multi_axis"],
      ["horizontal_bar"],
      ["archetype"],
      ["traits"],
    ])("reads no label and no colour for %s", (type) => {
      expect(
        read({ type, labels: EVERY_SLOT, colors: EVERY_SLOT }),
      ).toMatchObject({ labels: {}, colors: {} });
    });
  });
});

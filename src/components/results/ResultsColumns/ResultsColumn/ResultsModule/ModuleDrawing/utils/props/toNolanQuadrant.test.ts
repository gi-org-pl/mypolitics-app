import { describe, expect, it } from "vitest";

import { DEFAULT_COMPASS_QUADRANTS } from "@/constants/results";

import { toNolanQuadrant } from "./toNolanQuadrant";

const LABELS = {
  topLeftModerate: "Lewica autorytarna",
  topLeftExtreme: "Skrajna lewica autorytarna",
  topLeftModerateShort: "Lew. aut.",
  topLeftExtremeShort: "Skr. lew. aut.",
  bottomRightModerate: "Libertarianizm",
};
const COLORS = { topLeft: "#ff0000", bottomRight: "#7c3aed" };

describe("toNolanQuadrant()", () => {
  describe("given a corner with every slot filled", () => {
    it("hands over its colour and its four names", () => {
      expect(toNolanQuadrant("topLeft", LABELS, COLORS)).toEqual({
        color: "#ff0000",
        names: {
          moderate: "Lewica autorytarna",
          extreme: "Skrajna lewica autorytarna",
          moderateShort: "Lew. aut.",
          extremeShort: "Skr. lew. aut.",
        },
      });
    });
  });

  describe("given a corner with some slots missing", () => {
    it("leaves them empty, for the map to fall back on its own", () => {
      expect(toNolanQuadrant("bottomRight", LABELS, COLORS)).toEqual({
        color: "#7c3aed",
        names: {
          moderate: "Libertarianizm",
          extreme: undefined,
          moderateShort: undefined,
          extremeShort: undefined,
        },
      });
    });
  });

  describe("given a corner the record says nothing about", () => {
    it("is drawn in the default colour of that corner, and has no name", () => {
      expect(toNolanQuadrant("topRight", LABELS, COLORS)).toEqual({
        color: DEFAULT_COMPASS_QUADRANTS.topRight.color,
        names: {
          moderate: undefined,
          extreme: undefined,
          moderateShort: undefined,
          extremeShort: undefined,
        },
      });
    });
  });

  describe("given a record with no colour at all", () => {
    it.each([
      ["topLeft"],
      ["topRight"],
      ["bottomLeft"],
      ["bottomRight"],
    ] as const)("draws every corner in its own default colour: %s", (key) => {
      expect(toNolanQuadrant(key, LABELS, {}).color).toBe(
        DEFAULT_COMPASS_QUADRANTS[key].color,
      );
    });

    it("gives the four corners four different colours", () => {
      const colors = (
        ["topLeft", "topRight", "bottomLeft", "bottomRight"] as const
      ).map((key) => toNolanQuadrant(key, {}, {}).color);

      expect(new Set(colors).size).toBe(4);
    });
  });

  describe("given a record with a colour for one corner", () => {
    it("lets the colour of the record win, and falls back for the others", () => {
      const colors = { bottomLeft: "#16a34a" };

      expect(toNolanQuadrant("bottomLeft", {}, colors).color).toBe("#16a34a");
      expect(toNolanQuadrant("topLeft", {}, colors).color).toBe(
        DEFAULT_COMPASS_QUADRANTS.topLeft.color,
      );
    });
  });
});

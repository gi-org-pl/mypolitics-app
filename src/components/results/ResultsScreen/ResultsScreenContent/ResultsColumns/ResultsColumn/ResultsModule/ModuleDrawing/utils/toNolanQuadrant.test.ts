import { describe, expect, it } from "vitest";

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
    it("has no colour and no name", () => {
      expect(toNolanQuadrant("topRight", LABELS, COLORS)).toEqual({
        color: undefined,
        names: {
          moderate: undefined,
          extreme: undefined,
          moderateShort: undefined,
          extremeShort: undefined,
        },
      });
    });
  });
});

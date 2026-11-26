import { describe, expect, it } from "vitest";

import type { ResolvedAxis } from "@/types/results";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { toNolanAxis } from "./toNolanAxis";

const axis: ResolvedAxis = {
  id: "compass-x",
  name: "gospodarczo",
  start: {
    orientation: createOrientation("left", "Interwencjonizm"),
    value: 70,
  },
  end: { orientation: createOrientation("right", "Wolny rynek"), value: 30 },
};

const LABELS = {
  horizontalStartModerate: "Lewicowy gospodarczo",
  horizontalStartExtreme: "Skrajnie lewicowy gospodarczo",
  horizontalEndModerate: "Prawicowy gospodarczo",
  horizontalEndExtreme: "Skrajnie prawicowy gospodarczo",
  verticalStartModerate: "Postępowy",
  verticalEndExtreme: "Skrajnie konserwatywny",
};

describe("toNolanAxis()", () => {
  describe("given the horizontal axis", () => {
    it("hands over its name, its two entries and the names of a lean by pole and level", () => {
      expect(toNolanAxis(axis, "horizontal", LABELS)).toEqual({
        name: "gospodarczo",
        start: {
          entry: axis.start,
          names: {
            moderate: "Lewicowy gospodarczo",
            extreme: "Skrajnie lewicowy gospodarczo",
          },
        },
        end: {
          entry: axis.end,
          names: {
            moderate: "Prawicowy gospodarczo",
            extreme: "Skrajnie prawicowy gospodarczo",
          },
        },
      });
    });
  });

  describe("given the vertical axis", () => {
    it("reads the slots of the vertical axis, and leaves a missing slot empty", () => {
      const { start, end } = toNolanAxis(axis, "vertical", LABELS);

      expect(start.names).toEqual({
        moderate: "Postępowy",
        extreme: undefined,
      });
      expect(end.names).toEqual({
        moderate: undefined,
        extreme: "Skrajnie konserwatywny",
      });
    });
  });

  describe("given an axis with no name", () => {
    it("hands over an empty name", () => {
      expect(
        toNolanAxis({ ...axis, name: undefined }, "horizontal", {}).name,
      ).toBe("");
    });
  });
});

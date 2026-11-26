import { describe, expect, it } from "vitest";

import { AXIS_OTHER_SIDE_COLOR } from "@/constants/axis";
import type { AxisEntry } from "@/types/axis";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { toDistinctEnd } from "./toDistinctEnd";

const side = (id: string, color?: string): AxisEntry => ({
  orientation: createOrientation(id, id, color ? { color } : {}),
  value: 50,
});

describe("toDistinctEnd()", () => {
  describe("given two sides without a colour", () => {
    it("gives the end side the lighter grey, and keeps the rest of it", () => {
      const end = side("care");
      const distinct = toDistinctEnd(side("freedom"), end);

      expect(distinct.orientation.color).toBe(AXIS_OTHER_SIDE_COLOR);
      expect(distinct.orientation.id).toBe("care");
      expect(distinct.value).toBe(50);
      expect(end.orientation.color).toBeUndefined();
    });
  });

  describe("given two sides of the same colour", () => {
    it("gives the end side the lighter grey", () => {
      expect(
        toDistinctEnd(side("a", "#22a274"), side("b", " #22a274 ")).orientation
          .color,
      ).toBe(AXIS_OTHER_SIDE_COLOR);
    });
  });

  describe("given a colour on one side only", () => {
    it("keeps the end side as it is", () => {
      const end = side("b");

      expect(toDistinctEnd(side("a", "#22a274"), end)).toBe(end);
      expect(
        toDistinctEnd(side("a"), side("b", "#22a274")).orientation.color,
      ).toBe("#22a274");
    });
  });

  describe("given two different colours", () => {
    it("keeps the end side as it is", () => {
      const end = side("b", "#e43235");

      expect(toDistinctEnd(side("a", "#22a274"), end)).toBe(end);
    });
  });

  describe("given colours that cannot be drawn on either side", () => {
    it("treats them as no colour", () => {
      expect(
        toDistinctEnd(side("a", "red; x"), side("b", "url(x)")).orientation
          .color,
      ).toBe(AXIS_OTHER_SIDE_COLOR);
    });
  });
});

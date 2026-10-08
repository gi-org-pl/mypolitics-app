import { describe, expect, it } from "vitest";

import type { CompassPoint } from "@/types/checkpoint";
import { createCompassTrail } from "@/utils/vitest/createCompassTrail";

import { getPathPosition } from "./getPathPosition";

const TRAIL = createCompassTrail([
  [0.5, 0.5],
  [-0.2, 0.1],
  [-0.54, -0.34],
]);

const withLast = (last: unknown): CompassPoint[] => [
  ...TRAIL,
  last as CompassPoint,
];

describe("getPathPosition()", () => {
  it("returns the last point of the trail, as it is", () => {
    expect(getPathPosition(TRAIL)).toBe(TRAIL[2]);
  });

  it("returns the only point of a trail of one", () => {
    expect(getPathPosition([TRAIL[0]])).toBe(TRAIL[0]);
  });

  it("returns a last point in a corner or in the middle of the map", () => {
    const [corner] = createCompassTrail([[1, -1]]);
    const [middle] = createCompassTrail([[0, 0]]);

    expect(getPathPosition(withLast(corner))).toBe(corner);
    expect(getPathPosition(withLast(middle))).toBe(middle);
  });

  describe("given an empty or a missing trail", () => {
    it.each([
      [[]],
      [undefined],
      [null],
      ["trail"],
      [{ length: 1 }],
    ])("returns nothing: %j", (trail) => {
      expect(getPathPosition(trail as CompassPoint[])).toBeNull();
    });
  });

  describe("given a last point whose x or y is not a number", () => {
    it.each([
      [{ ...TRAIL[2], x: Number.NaN }],
      [{ ...TRAIL[2], y: Number.NaN }],
      [{ ...TRAIL[2], x: "0.5" }],
      [{ ...TRAIL[2], y: null }],
      [{ level: "moderate", quadrant: "topLeft", done: 4 }],
      [null],
      [undefined],
    ])("returns nothing, and does not fall back to an earlier point: %j", (last) => {
      expect(getPathPosition(withLast(last))).toBeNull();
    });
  });

  it("does not change the trail it was given", () => {
    const trail = [...TRAIL];

    getPathPosition(trail);

    expect(trail).toEqual(TRAIL);
  });
});

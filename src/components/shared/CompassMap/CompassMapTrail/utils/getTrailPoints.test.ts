import { describe, expect, it } from "vitest";

import type { CompassMapPoint } from "../../CompassMap.types";
import { getTrailPoints } from "./getTrailPoints";

const at = (x: number, y: number): CompassMapPoint => ({ x, y });

describe("getTrailPoints()", () => {
  it("keeps the points in the order given", () => {
    const trail = [at(0.5, 0.5), at(-0.2, 0.1), at(0.3, -0.7)];

    expect(getTrailPoints(trail)).toEqual(trail);
  });

  it("keeps a point as it was given, whatever else it holds", () => {
    const point = { x: 0.123_456, y: -0.5, level: "moderate", done: 3 };

    expect(getTrailPoints([point, at(1, 1)])[0]).toBe(point);
  });

  it("merges neighbouring points that are the same to two decimals", () => {
    expect(
      getTrailPoints([at(0.5, 0.5), at(0.501, 0.499), at(-0.2, 0.1)]),
    ).toHaveLength(2);
    expect(getTrailPoints([at(0.001, 0), at(-0.001, 0)])).toHaveLength(1);
  });

  it("keeps neighbouring points that differ in the second decimal", () => {
    expect(getTrailPoints([at(0.5, 0.5), at(0.51, 0.5)])).toHaveLength(2);
    expect(getTrailPoints([at(0.5, 0.5), at(0.5, 0.49)])).toHaveLength(2);
  });

  it("keeps the last point of a merged run", () => {
    const last = at(0.503, 0.5);

    expect(
      getTrailPoints([at(-1, -1), at(0.5, 0.5), at(0.502, 0.5), last]),
    ).toEqual([at(-1, -1), last]);
    expect(getTrailPoints([at(0.5, 0.5), last])).toEqual([last]);
  });

  it("keeps two equal points that are not neighbours", () => {
    const trail = [at(0.5, 0.5), at(-0.5, -0.5), at(0.5, 0.5)];

    expect(getTrailPoints(trail)).toEqual(trail);
  });

  it("leaves out a point whose x or y is not a number", () => {
    const trail = [
      at(0.5, 0.5),
      at(Number.NaN, 0),
      at(0, Number.NaN),
      { x: "0.1", y: 0 },
      { x: 0, y: null },
      { y: 0 },
      null,
      undefined,
      at(-0.5, -0.5),
    ] as unknown as CompassMapPoint[];

    expect(getTrailPoints(trail)).toEqual([at(0.5, 0.5), at(-0.5, -0.5)]);
  });

  it("merges two equal points left next to each other by a point that is not a number", () => {
    expect(
      getTrailPoints([at(0.5, 0.5), at(Number.NaN, 0), at(0.5, 0.5)]),
    ).toEqual([at(0.5, 0.5)]);
  });

  it("returns no points for a missing or an empty trail", () => {
    expect(getTrailPoints()).toEqual([]);
    expect(getTrailPoints(null)).toEqual([]);
    expect(getTrailPoints([])).toEqual([]);
    expect(getTrailPoints("trail" as unknown as CompassMapPoint[])).toEqual([]);
  });

  it("does not change the list it was given", () => {
    const trail = [at(0.5, 0.5), at(0.5, 0.5), at(Number.NaN, 0), at(1, 1)];
    const copy = trail.map((point) => ({ ...point }));

    const points = getTrailPoints(trail);

    expect(trail).toEqual(copy);
    expect(points).not.toBe(trail);
  });

  it("keeps every point of a long trail of distinct points", () => {
    const trail = Array.from({ length: 300 }, (_, index) =>
      at(((index % 20) - 10) / 10, (Math.floor(index / 20) - 7) / 10),
    );

    expect(getTrailPoints(trail)).toHaveLength(300);
  });
});

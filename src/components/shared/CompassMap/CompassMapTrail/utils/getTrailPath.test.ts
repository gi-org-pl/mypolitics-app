import { describe, expect, it } from "vitest";

import type { CompassMapPoint } from "../../CompassMap.types";
import { getPositionStyle } from "../../utils/getPositionStyle";
import { TRAIL_VIEW_SIZE } from "../CompassMapTrail.constants";
import { getTrailPath } from "./getTrailPath";

const at = (x: number, y: number): CompassMapPoint => ({ x, y });

const NUMBER = /-?\d+(?:\.\d+)?/g;

const toNumbers = (text: string): number[] =>
  (text.match(NUMBER) ?? []).map(Number);

// The path taken apart: where it starts, and the two handles and the end of
// each curve.
const readPath = (path: string) => {
  const [move, ...curves] = path.split("C");
  const [startX, startY] = toNumbers(move);

  return {
    start: at(startX, startY),
    curves: curves.map((curve) => {
      const [x1, y1, x2, y2, x, y] = toNumbers(curve);

      return { first: at(x1, y1), second: at(x2, y2), end: at(x, y) };
    }),
  };
};

// The cross product of the two steps: zero when the three places are in line.
const getTurn = (a: CompassMapPoint, b: CompassMapPoint, c: CompassMapPoint) =>
  (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

describe("getTrailPath()", () => {
  it("returns no path for fewer than two points", () => {
    expect(getTrailPath([])).toBe("");
    expect(getTrailPath([at(0.5, 0.5)])).toBe("");
  });

  it("starts at the first point and ends at the last", () => {
    const { start, curves } = readPath(
      getTrailPath([at(-1, 1), at(0, 0), at(1, -1)]),
    );

    expect(start).toEqual(at(0, 0));
    expect(curves.at(-1)?.end).toEqual(at(100, 100));
  });

  it("passes through every point in between", () => {
    const { curves } = readPath(
      getTrailPath([at(-1, 1), at(-0.5, -0.2), at(0.3, 0.6), at(1, -1)]),
    );

    expect(curves.map(({ end }) => end)).toEqual([
      at(25, 60),
      at(65, 20),
      at(100, 100),
    ]);
  });

  it("is a curve, not straight segments, for three points that are not in line", () => {
    const path = getTrailPath([at(-0.5, 0), at(0, 0.5), at(0.5, 0)]);
    const { start, curves } = readPath(path);

    expect(path).not.toContain("L");
    expect(curves).toHaveLength(2);
    expect(getTurn(start, curves[0].second, curves[0].end)).not.toBe(0);
    expect(getTurn(curves[0].end, curves[1].first, curves[1].end)).not.toBe(0);
  });

  it("keeps its direction through a point, so the bend is smooth", () => {
    const { curves } = readPath(
      getTrailPath([at(-0.5, 0), at(0, 0.5), at(0.5, 0)]),
    );
    const [into, out] = curves;

    // The handle before the point, the point and the handle after it are in
    // line, and the point lies between the two.
    expect(getTurn(into.second, into.end, out.first)).toBeCloseTo(0, 6);
    expect(into.second.x).toBeLessThan(into.end.x);
    expect(out.first.x).toBeGreaterThan(into.end.x);
  });

  it("is a straight stretch for two points", () => {
    const { start, curves } = readPath(getTrailPath([at(-1, -1), at(1, 1)]));
    const [{ first, second, end }] = curves;

    expect(curves).toHaveLength(1);
    expect(getTurn(start, first, end)).toBeCloseTo(0, 6);
    expect(getTurn(start, second, end)).toBeCloseTo(0, 6);
  });

  it("places a point with the mapping the dot uses", () => {
    const points = [at(-0.54, -0.34), at(0.25, 0.75), at(1, -1)];
    const { start, curves } = readPath(getTrailPath(points));
    const places = [start, ...curves.map(({ end }) => end)];

    expect(places.map(({ x, y }) => [`${x}%`, `${y}%`])).toEqual(
      points.map((point) => {
        const style = getPositionStyle(point) as Record<string, string>;

        return [style["--nolan-x"], style["--nolan-y"]];
      }),
    );
  });

  it("never bends further than the stretch the bend belongs to", () => {
    // A long step followed by short ones: the short stretch must not swing
    // out as far as the long one before it.
    const { curves } = readPath(
      getTrailPath([at(-1, -1), at(0.6, 0.6), at(0.62, 0.6), at(0.64, 0.62)]),
    );
    const [, short] = curves;

    expect(short.first.x).toBeGreaterThanOrEqual(80);
    expect(short.first.x).toBeLessThanOrEqual(81);
    expect(short.first.y).toBeLessThanOrEqual(20);
    expect(short.first.y).toBeGreaterThanOrEqual(19);
  });

  it("keeps every bend on the map for points on its edges and in its corners", () => {
    const path = getTrailPath([
      at(-1, 1),
      at(0, 1),
      at(1, 1),
      at(1, 0),
      at(1, -1),
      at(0, -0.9),
      at(-1, -1),
      at(-1, 0),
    ]);
    const numbers = toNumbers(path);

    expect(Math.min(...numbers)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...numbers)).toBeLessThanOrEqual(TRAIL_VIEW_SIZE);
  });

  it("turns on the spot where the route comes back the way it went", () => {
    const { curves } = readPath(
      getTrailPath([at(-0.5, 0), at(0.5, 0), at(-0.5, 0)]),
    );

    expect(curves[0].second).toEqual(curves[0].end);
    expect(curves[1].first).toEqual(curves[0].end);
  });

  it("holds numbers only, to two decimals at most", () => {
    const path = getTrailPath([at(-1 / 3, 1 / 3), at(1 / 7, -2 / 3), at(0, 0)]);

    expect(path).not.toMatch(/NaN|Infinity|e-/);
    expect(
      toNumbers(path).every((value) => /^-?\d+(\.\d{1,2})?$/.test(`${value}`)),
    ).toBe(true);
  });

  it("returns one path for three hundred points", () => {
    const points = Array.from({ length: 300 }, (_, index) =>
      at(Math.cos(index / 9) * 0.9, Math.sin(index / 7) * 0.9),
    );
    const path = getTrailPath(points);

    expect(path.match(/M/g)).toHaveLength(1);
    expect(path.match(/C/g)).toHaveLength(299);
    expect(path).not.toContain("Z");
  });
});

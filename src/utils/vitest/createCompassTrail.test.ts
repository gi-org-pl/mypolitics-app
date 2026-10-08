import { describe, expect, it } from "vitest";

import { createCompassTrail } from "./createCompassTrail";

describe("createCompassTrail()", () => {
  it("returns one point per pair, in the order given, with the coordinates as given", () => {
    expect(
      createCompassTrail([
        [0.5, 0.5],
        [-0.54, -0.34],
      ]),
    ).toEqual([
      { x: 0.5, y: 0.5, level: "moderate", quadrant: "topRight", done: 1 },
      {
        x: -0.54,
        y: -0.34,
        level: "moderate",
        quadrant: "bottomLeft",
        done: 2,
      },
    ]);
  });

  it("gives each point the level of the Nolan chart", () => {
    expect(
      createCompassTrail([
        [0.1, -0.2],
        [-0.4, 0.4],
        [1, 1],
        [1, 0],
      ]).map(({ level }) => level),
    ).toEqual(["centre", "moderate", "extreme", "extreme"]);
  });

  it("gives each point the quadrant it lies in", () => {
    expect(
      createCompassTrail([
        [-0.5, 0.5],
        [0.5, 0.5],
        [-0.5, -0.5],
        [0.5, -0.5],
      ]).map(({ quadrant }) => quadrant),
    ).toEqual(["topLeft", "topRight", "bottomLeft", "bottomRight"]);
  });

  it("numbers the boundaries from 1", () => {
    expect(
      createCompassTrail([
        [0, 0],
        [0.1, 0.1],
        [0.2, 0.2],
      ]).map(({ done }) => done),
    ).toEqual([1, 2, 3]);
  });

  it("gives no point for a pair that is not two numbers", () => {
    expect(
      createCompassTrail([
        [0.5, 0.5],
        [Number.NaN, 0],
        [0, Number.NaN],
        [-0.5, -0.5],
      ]).map(({ x, done }) => [x, done]),
    ).toEqual([
      [0.5, 1],
      [-0.5, 4],
    ]);
  });

  it("returns no points for no pairs", () => {
    expect(createCompassTrail([])).toEqual([]);
  });
});

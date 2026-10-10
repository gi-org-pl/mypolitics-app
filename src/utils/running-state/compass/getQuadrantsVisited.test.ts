import { describe, expect, it } from "vitest";

import type { CompassPoint } from "@/types/checkpoint";
import type { NolanLevel, NolanQuadrantKey } from "@/types/results";

import { getQuadrantsVisited } from "./getQuadrantsVisited";

const toPoint = (
  quadrant: NolanQuadrantKey,
  level: NolanLevel,
  done = 1,
): CompassPoint => ({ x: 0, y: 0, level, quadrant, done });

describe("getQuadrantsVisited()", () => {
  it("lists the quadrants of the points at the moderate or the extreme level", () => {
    expect(
      getQuadrantsVisited([
        toPoint("topLeft", "moderate"),
        toPoint("bottomRight", "extreme"),
      ]),
    ).toEqual(["topLeft", "bottomRight"]);
  });

  it("leaves out a quadrant only reached at the centre level", () => {
    expect(
      getQuadrantsVisited([
        toPoint("topLeft", "centre"),
        toPoint("bottomRight", "moderate"),
        toPoint("bottomLeft", "centre"),
      ]),
    ).toEqual(["bottomRight"]);
  });

  it("lists a quadrant once, where it was first visited", () => {
    expect(
      getQuadrantsVisited([
        toPoint("topRight", "moderate"),
        toPoint("topLeft", "extreme"),
        toPoint("topRight", "extreme"),
        toPoint("topLeft", "moderate"),
      ]),
    ).toEqual(["topRight", "topLeft"]);
  });

  it("returns an empty list for an empty trail", () => {
    expect(getQuadrantsVisited([])).toEqual([]);
  });
});

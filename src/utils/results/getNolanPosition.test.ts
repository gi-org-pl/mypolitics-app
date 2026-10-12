import { describe, expect, it } from "vitest";

import { MAP_EXTREME_RADIUS, MAP_MODERATE_RADIUS } from "@/constants/results";

import { getNolanPosition } from "./getNolanPosition";

const pair = (start?: number, end?: number) => ({ start, end });
const fromCoordinate = (coordinate: number) =>
  pair(50 - coordinate * 50, 50 + coordinate * 50);
const CENTRED = pair(50, 50);

describe("thresholds", () => {
  it("are the ones the spec names", () => {
    expect(MAP_MODERATE_RADIUS).toBeCloseTo(0.4714, 4);
    expect(MAP_EXTREME_RADIUS).toBe(1);
  });
});

describe("getNolanPosition()", () => {
  describe("coordinates", () => {
    it("returns (end - start) / 100 for each axis", () => {
      const position = getNolanPosition(pair(77, 23), pair(33, 67));

      expect(position?.x).toBeCloseTo(-0.54);
      expect(position?.y).toBeCloseTo(0.34);
      expect(position?.r).toBeCloseTo(Math.hypot(0.54, 0.34));
    });

    it("keeps the exact values, without rounding", () => {
      expect(getNolanPosition(pair(50.4, 49.6), CENTRED)?.x).toBeCloseTo(
        -0.008,
        10,
      );
    });

    it("clamps values to 0-100 first", () => {
      const position = getNolanPosition(pair(-40, 180), pair(250, -1));

      expect(position?.x).toBe(1);
      expect(position?.y).toBe(-1);
    });

    it("clamps infinite values", () => {
      const position = getNolanPosition(
        pair(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY),
        CENTRED,
      );

      expect(position?.x).toBe(1);
    });

    it("uses the difference even when a pair does not add up to 100", () => {
      const position = getNolanPosition(pair(47, 31), pair(10, 20));

      expect(position?.x).toBeCloseTo(-0.16);
      expect(position?.y).toBeCloseTo(0.1);
    });

    it("returns null when either value of an axis is absent or not a number", () => {
      expect(getNolanPosition(pair(undefined, 50), CENTRED)).toBeNull();
      expect(getNolanPosition(pair(50), CENTRED)).toBeNull();
      expect(getNolanPosition(CENTRED, pair(undefined, 50))).toBeNull();
      expect(getNolanPosition(CENTRED, pair(50))).toBeNull();
      expect(getNolanPosition(pair(Number.NaN, 50), CENTRED)).toBeNull();
      expect(
        getNolanPosition(pair("50" as unknown as number, 50), CENTRED),
      ).toBeNull();
      expect(
        getNolanPosition(pair(null as unknown as number, 50), CENTRED),
      ).toBeNull();
    });

    it("returns null when an axis is missing altogether", () => {
      expect(getNolanPosition(undefined, CENTRED)).toBeNull();
      expect(getNolanPosition(CENTRED)).toBeNull();
    });
  });

  describe("level", () => {
    it("returns centre at the very centre", () => {
      const position = getNolanPosition(CENTRED, CENTRED);

      expect(position).toMatchObject({ x: 0, y: 0, r: 0, level: "centre" });
    });

    it("returns centre below √2/3", () => {
      expect(
        getNolanPosition(fromCoordinate(0.33), fromCoordinate(0.33))?.level,
      ).toBe("centre");
      expect(getNolanPosition(fromCoordinate(0.47), CENTRED)?.level).toBe(
        "centre",
      );
    });

    it("returns moderate at √2/3", () => {
      expect(
        getNolanPosition(fromCoordinate(1 / 3), fromCoordinate(1 / 3))?.level,
      ).toBe("moderate");
      expect(
        getNolanPosition(fromCoordinate(-Math.SQRT2 / 3), CENTRED)?.level,
      ).toBe("moderate");
    });

    it("returns moderate just above √2/3", () => {
      expect(getNolanPosition(fromCoordinate(0.48), CENTRED)?.level).toBe(
        "moderate",
      );
    });

    it("returns moderate just below 1", () => {
      expect(getNolanPosition(fromCoordinate(0.99), CENTRED)?.level).toBe(
        "moderate",
      );
      expect(
        getNolanPosition(fromCoordinate(0.7), fromCoordinate(0.7))?.level,
      ).toBe("moderate");
    });

    it("returns extreme at 1", () => {
      expect(getNolanPosition(pair(0, 100), CENTRED)?.level).toBe("extreme");
      expect(getNolanPosition(CENTRED, pair(100, 0))?.level).toBe("extreme");
      expect(
        getNolanPosition(fromCoordinate(0.6), fromCoordinate(0.8))?.level,
      ).toBe("extreme");
    });

    it("returns extreme at a corner", () => {
      const position = getNolanPosition(pair(0, 100), pair(100, 0));

      expect(position?.r).toBeCloseTo(Math.SQRT2);
      expect(position?.level).toBe("extreme");
    });
  });

  describe("quadrant", () => {
    it("returns each of the four quadrants from the signs", () => {
      expect(getNolanPosition(pair(80, 20), pair(20, 80))?.quadrant).toBe(
        "topLeft",
      );
      expect(getNolanPosition(pair(20, 80), pair(20, 80))?.quadrant).toBe(
        "topRight",
      );
      expect(getNolanPosition(pair(80, 20), pair(80, 20))?.quadrant).toBe(
        "bottomLeft",
      );
      expect(getNolanPosition(pair(20, 80), pair(80, 20))?.quadrant).toBe(
        "bottomRight",
      );
    });

    it("returns each corner", () => {
      expect(getNolanPosition(pair(100, 0), pair(0, 100))).toMatchObject({
        x: -1,
        y: 1,
        quadrant: "topLeft",
      });
      expect(getNolanPosition(pair(0, 100), pair(0, 100))).toMatchObject({
        x: 1,
        y: 1,
        quadrant: "topRight",
      });
      expect(getNolanPosition(pair(100, 0), pair(100, 0))).toMatchObject({
        x: -1,
        y: -1,
        quadrant: "bottomLeft",
      });
      expect(getNolanPosition(pair(0, 100), pair(100, 0))).toMatchObject({
        x: 1,
        y: -1,
        quadrant: "bottomRight",
      });
    });

    it("returns the pole each axis leans to", () => {
      expect(getNolanPosition(pair(80, 20), pair(20, 80))?.poles).toEqual({
        horizontal: "start",
        vertical: "end",
      });
    });

    it("counts a coordinate of zero toward the end pole", () => {
      expect(getNolanPosition(CENTRED, CENTRED)?.quadrant).toBe("topRight");
      expect(getNolanPosition(CENTRED, pair(80, 20))?.quadrant).toBe(
        "bottomRight",
      );
      expect(getNolanPosition(pair(80, 20), CENTRED)?.quadrant).toBe("topLeft");
    });

    it("decides a tie on the rounded values", () => {
      expect(getNolanPosition(pair(50.4, 49.6), pair(80, 20))?.quadrant).toBe(
        "bottomRight",
      );
      expect(getNolanPosition(pair(50.6, 49.4), pair(80, 20))?.quadrant).toBe(
        "bottomLeft",
      );
    });
  });
});

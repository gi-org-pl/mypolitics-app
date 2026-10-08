import { describe, expect, it } from "vitest";

import { getMapPoint } from "./getMapPoint";

describe("getMapPoint()", () => {
  it("puts the centre in the middle of the map", () => {
    expect(getMapPoint({ x: 0, y: 0 })).toEqual({ x: 0.5, y: 0.5 });
  });

  it("runs the horizontal axis left to right", () => {
    expect(getMapPoint({ x: -1, y: 0 }).x).toBe(0);
    expect(getMapPoint({ x: 1, y: 0 }).x).toBe(1);
    expect(getMapPoint({ x: -0.5, y: 0 }).x).toBe(0.25);
  });

  it("runs the vertical axis bottom to top", () => {
    expect(getMapPoint({ x: 0, y: 1 }).y).toBe(0);
    expect(getMapPoint({ x: 0, y: -1 }).y).toBe(1);
    expect(getMapPoint({ x: 0, y: 0.5 }).y).toBe(0.25);
  });

  it("places the four corners", () => {
    expect(getMapPoint({ x: -1, y: 1 })).toEqual({ x: 0, y: 0 });
    expect(getMapPoint({ x: 1, y: 1 })).toEqual({ x: 1, y: 0 });
    expect(getMapPoint({ x: -1, y: -1 })).toEqual({ x: 0, y: 1 });
    expect(getMapPoint({ x: 1, y: -1 })).toEqual({ x: 1, y: 1 });
  });

  it("reads nothing but the two coordinates", () => {
    const position = { x: 0, y: 0, level: "centre", quadrant: "topRight" };

    expect(getMapPoint(position)).toEqual({ x: 0.5, y: 0.5 });
  });
});

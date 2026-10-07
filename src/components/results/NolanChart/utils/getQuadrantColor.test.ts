import { describe, expect, it } from "vitest";

import { getNolanPosition } from "./getNolanPosition";
import { getQuadrantColor } from "./getQuadrantColor";

const POSITION = getNolanPosition(
  { start: 77, end: 23 },
  { start: 67, end: 33 },
);

describe("getQuadrantColor()", () => {
  it("returns the colour of the quadrant the position is in", () => {
    expect(
      getQuadrantColor(
        { bottomLeft: { color: " #36db8b " }, topLeft: { color: "#eb5760" } },
        POSITION,
      ),
    ).toBe("#36db8b");
  });

  it("returns nothing for an unsafe or missing colour", () => {
    expect(
      getQuadrantColor({ bottomLeft: { color: "url(x)" } }, POSITION),
    ).toBeUndefined();
    expect(getQuadrantColor({ bottomLeft: {} }, POSITION)).toBeUndefined();
    expect(getQuadrantColor(undefined, POSITION)).toBeUndefined();
  });

  it("returns nothing without a position", () => {
    expect(
      getQuadrantColor({ bottomLeft: { color: "#36db8b" } }, null),
    ).toBeUndefined();
  });
});

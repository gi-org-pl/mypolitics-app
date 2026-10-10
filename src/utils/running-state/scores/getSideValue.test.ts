import { describe, expect, it } from "vitest";

import { getSideValue } from "./getSideValue";

describe("getSideValue()", () => {
  const scores = {
    x: { points: 12, maximum: 20 },
    y: { points: 3, maximum: 15 },
    z: { points: 0, maximum: 0 },
  };

  it("divides the sum of the points by the sum of the maximums", () => {
    expect(getSideValue(scores, ["x"])).toBe(60);
    expect(getSideValue(scores, ["y"])).toBe(20);
  });

  it("returns nothing while the sum of the maximums is 0", () => {
    expect(getSideValue(scores, ["z"])).toBeUndefined();
    expect(getSideValue(scores, [])).toBeUndefined();
    expect(getSideValue(scores, ["ghost"])).toBeUndefined();
  });

  it("gives one value for a side with several orientations", () => {
    expect(getSideValue(scores, ["x", "y", "z"])).toBe((15 / 35) * 100);
  });
});

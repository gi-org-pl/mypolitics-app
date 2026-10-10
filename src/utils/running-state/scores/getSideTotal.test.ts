import { describe, expect, it } from "vitest";

import { getSideTotal } from "./getSideTotal";

describe("getSideTotal()", () => {
  const scores = {
    x: { points: 12, maximum: 20 },
    y: { points: 3, maximum: 15 },
    z: { points: 0, maximum: 0 },
  };

  it("sums the points and the maximums of the side's orientations", () => {
    expect(getSideTotal(scores, ["x", "y"])).toEqual({
      points: 15,
      maximum: 35,
    });
  });

  it("returns the score of the one orientation of a side", () => {
    expect(getSideTotal(scores, ["y"])).toEqual({ points: 3, maximum: 15 });
  });

  it("counts an orientation listed twice once", () => {
    expect(getSideTotal(scores, ["x", "x"])).toEqual({
      points: 12,
      maximum: 20,
    });
  });

  it("adds nothing for an orientation without a score", () => {
    expect(getSideTotal(scores, ["x", "ghost", "constructor"])).toEqual({
      points: 12,
      maximum: 20,
    });
  });

  it("returns zero of zero for an empty side", () => {
    expect(getSideTotal(scores, [])).toEqual({ points: 0, maximum: 0 });
  });
});

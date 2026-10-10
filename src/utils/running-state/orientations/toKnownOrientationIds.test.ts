import { describe, expect, it } from "vitest";

import { toKnownOrientationIds } from "./toKnownOrientationIds";

describe("toKnownOrientationIds()", () => {
  const orientationIds = new Set(["x", "y", "z"]);

  it("keeps the orientations of the quiz, in the order listed", () => {
    expect(toKnownOrientationIds(["z", "x"], orientationIds)).toEqual([
      "z",
      "x",
    ]);
  });

  it("drops an orientation the quiz does not have", () => {
    expect(toKnownOrientationIds(["x", "ghost", "y"], orientationIds)).toEqual([
      "x",
      "y",
    ]);
  });

  it("keeps an orientation listed twice once", () => {
    expect(toKnownOrientationIds(["x", "y", "x"], orientationIds)).toEqual([
      "x",
      "y",
    ]);
  });

  it("returns an empty list for an empty list", () => {
    expect(toKnownOrientationIds([], orientationIds)).toEqual([]);
  });
});

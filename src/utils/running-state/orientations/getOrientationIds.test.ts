import { describe, expect, it } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";

import { getOrientationIds } from "./getOrientationIds";

describe("getOrientationIds()", () => {
  it("returns the identifiers of the quiz's orientations, in its order", () => {
    const orientationIds = getOrientationIds({
      orientations: [
        createOrientation("x"),
        createOrientation("y"),
        createOrientation("x"),
      ],
    });

    expect([...orientationIds]).toEqual(["x", "y"]);
  });

  it("returns nothing for a quiz without orientations", () => {
    expect(getOrientationIds({ orientations: [] }).size).toBe(0);
  });
});

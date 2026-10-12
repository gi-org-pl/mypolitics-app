import { describe, expect, it } from "vitest";

import { getSlicePath } from "./getSlicePath";

describe("getSlicePath()", () => {
  it("returns the path of a slice between two shares of the circle", () => {
    // From the top, clockwise: a quarter ends on the right, a half at the
    // bottom.
    expect(getSlicePath({ from: 0, to: 0.25 })).toBe(
      "M 48 48 L 48 0 A 48 48 0 0 1 96 48 Z",
    );
    expect(getSlicePath({ from: 0.25, to: 0.5 })).toBe(
      "M 48 48 L 96 48 A 48 48 0 0 1 48 96 Z",
    );
  });

  it("starts a slice where the one before it ends", () => {
    expect(getSlicePath({ from: 0, to: 0.1 })).toBe(
      "M 48 48 L 48 0 A 48 48 0 0 1 76.21 9.17 Z",
    );
    expect(getSlicePath({ from: 0.1, to: 0.7 })).toMatch(
      /^M 48 48 L 76\.21 9\.17 A /,
    );
  });

  it("goes the long way round for a slice of more than half the circle", () => {
    expect(getSlicePath({ from: 0.1, to: 0.7 })).toBe(
      "M 48 48 L 76.21 9.17 A 48 48 0 1 1 2.35 62.83 Z",
    );
    expect(getSlicePath({ from: 0, to: 0.5 })).toBe(
      "M 48 48 L 48 0 A 48 48 0 0 1 48 96 Z",
    );
  });

  it("closes the last slice at the top of the circle", () => {
    expect(getSlicePath({ from: 0.75, to: 1 })).toBe(
      "M 48 48 L 0 48 A 48 48 0 0 1 48 0 Z",
    );
  });

  it("returns a full circle for a slice from 0 to 1", () => {
    expect(getSlicePath({ from: 0, to: 1 })).toBe(
      "M 48 0 A 48 48 0 1 1 48 96 A 48 48 0 1 1 48 0 Z",
    );
  });
});

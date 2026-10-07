import { describe, expect, it } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";

import { getRowComparison } from "./getRowComparison";

const friend = createOrientation("friend", "Rafał", { type: "person" });

describe("getRowComparison()", () => {
  it("returns the other side with their value for the start pole", () => {
    expect(getRowComparison(friend, { start: 58, end: 42 })).toEqual({
      orientation: friend,
      value: 58,
    });
  });

  it("returns nothing without a start value", () => {
    expect(getRowComparison(friend, { end: 42 })).toBeUndefined();
    expect(getRowComparison(friend, { start: Number.NaN })).toBeUndefined();
    expect(getRowComparison(friend)).toBeUndefined();
  });

  it("returns nothing without the other side", () => {
    expect(getRowComparison(undefined, { start: 58 })).toBeUndefined();
  });
});

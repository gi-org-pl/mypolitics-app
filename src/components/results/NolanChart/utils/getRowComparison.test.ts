import { describe, expect, it } from "vitest";

import { getRowComparison } from "./getRowComparison";

const party = { id: "friend", name: "Rafał" };

describe("getRowComparison()", () => {
  it("returns the other party with their value for the start pole", () => {
    expect(getRowComparison(party, { start: 58, end: 42 })).toEqual({
      orientation: party,
      value: 58,
    });
  });

  it("returns nothing without a start value", () => {
    expect(getRowComparison(party, { end: 42 })).toBeUndefined();
    expect(getRowComparison(party, { start: Number.NaN })).toBeUndefined();
    expect(getRowComparison(party)).toBeUndefined();
  });

  it("returns nothing without the other party", () => {
    expect(getRowComparison(undefined, { start: 58 })).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";

import type { RankedComparison } from "@/types/results";
import { getComparisonEntry } from "./getComparisonEntry";

const party = { id: "friend", name: "Ania" };
const comparison: RankedComparison = { party, values: { a: 40, b: 0 } };

describe("getComparisonEntry()", () => {
  it("returns the other party with their value for the orientation", () => {
    expect(getComparisonEntry(comparison, "a")).toEqual({
      orientation: party,
      value: 40,
    });
    expect(getComparisonEntry(comparison, "b")).toEqual({
      orientation: party,
      value: 0,
    });
  });

  it("returns nothing for an orientation without a value", () => {
    expect(getComparisonEntry(comparison, "c")).toBeUndefined();
    expect(getComparisonEntry(comparison, "constructor")).toBeUndefined();
    expect(getComparisonEntry(comparison)).toBeUndefined();
  });

  it("returns nothing for a value that is not a number", () => {
    expect(
      getComparisonEntry({ party, values: { a: Number.NaN } }, "a"),
    ).toBeUndefined();
    expect(
      getComparisonEntry(
        { party, values: { a: "40" as unknown as number } },
        "a",
      ),
    ).toBeUndefined();
  });

  it("returns nothing without a comparison, a party or values", () => {
    expect(getComparisonEntry(undefined, "a")).toBeUndefined();
    expect(
      getComparisonEntry(
        { values: { a: 1 } } as unknown as RankedComparison,
        "a",
      ),
    ).toBeUndefined();
    expect(
      getComparisonEntry({ party } as RankedComparison, "a"),
    ).toBeUndefined();
  });
});

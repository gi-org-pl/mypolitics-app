import { describe, expect, it } from "vitest";

import type { RankedComparison } from "@/types/results";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { getComparisonEntry } from "./getComparisonEntry";

const friend = createOrientation("friend", "Ania", { type: "person" });
const comparison: RankedComparison = {
  orientation: friend,
  values: { a: 40, b: 0 },
};

describe("getComparisonEntry()", () => {
  it("returns the other side with their value for the orientation", () => {
    expect(getComparisonEntry(comparison, "a")).toEqual({
      orientation: friend,
      value: 40,
    });
    expect(getComparisonEntry(comparison, "b")).toEqual({
      orientation: friend,
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
      getComparisonEntry(
        { orientation: friend, values: { a: Number.NaN } },
        "a",
      ),
    ).toBeUndefined();
    expect(
      getComparisonEntry(
        { orientation: friend, values: { a: "40" as unknown as number } },
        "a",
      ),
    ).toBeUndefined();
  });

  it("returns nothing without a comparison, an orientation or values", () => {
    expect(getComparisonEntry(undefined, "a")).toBeUndefined();
    expect(
      getComparisonEntry(
        { values: { a: 1 } } as unknown as RankedComparison,
        "a",
      ),
    ).toBeUndefined();
    expect(
      getComparisonEntry({ orientation: friend } as RankedComparison, "a"),
    ).toBeUndefined();
  });
});

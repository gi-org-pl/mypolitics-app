import { describe, expect, it } from "vitest";

import type { RankedEntry } from "../../RankedRow/RankedRow.types";
import { getRankedValue, sortRankedEntries } from "./sortRankedEntries";

const entry = (id: string, value?: number): RankedEntry => ({
  orientation: { id, name: id },
  value,
});

const ids = (entries: RankedEntry[]): string[] =>
  entries.map(({ orientation }) => orientation.id);

describe("sortRankedEntries()", () => {
  it("sorts by value, highest first", () => {
    expect(
      ids(sortRankedEntries([entry("a", 20), entry("b", 90), entry("c", 55)])),
    ).toEqual(["b", "c", "a"]);
  });

  it("keeps the given order for equal values", () => {
    expect(
      ids(
        sortRankedEntries([
          entry("a", 50),
          entry("b", 70),
          entry("c", 50),
          entry("d", 50),
        ]),
      ),
    ).toEqual(["b", "a", "c", "d"]);
  });

  it("puts entries without a value last, in the given order", () => {
    expect(
      ids(
        sortRankedEntries([
          entry("a"),
          entry("b", 0),
          entry("c"),
          entry("d", 10),
        ]),
      ),
    ).toEqual(["d", "b", "a", "c"]);
  });

  it("treats a value that is not a number as absent", () => {
    expect(
      ids(
        sortRankedEntries([
          entry("a", Number.NaN),
          { ...entry("b"), value: "90" as unknown as number },
          entry("c", 5),
        ]),
      ),
    ).toEqual(["c", "a", "b"]);
  });

  it("ranks values outside 0-100 as the bar draws them", () => {
    expect(
      ids(
        sortRankedEntries([
          entry("a", -20),
          entry("b", 100),
          entry("c", 150),
          entry("d", 0),
        ]),
      ),
    ).toEqual(["b", "c", "a", "d"]);
  });

  it("does not mutate the input", () => {
    const input = [entry("a", 1), entry("b", 2)];
    const copy = [...input];

    const sorted = sortRankedEntries(input);

    expect(input).toEqual(copy);
    expect(sorted).not.toBe(input);
  });

  it("returns an empty list for a missing or malformed list", () => {
    expect(sortRankedEntries()).toEqual([]);
    expect(sortRankedEntries("x" as unknown as RankedEntry[])).toEqual([]);
    expect(
      ids(
        sortRankedEntries([
          null as unknown as RankedEntry,
          entry("a", 1),
          undefined as unknown as RankedEntry,
        ]),
      ),
    ).toEqual(["a"]);
  });
});

describe("getRankedValue()", () => {
  it("clamps a value to 0-100", () => {
    expect(getRankedValue(entry("a", 150))).toBe(100);
    expect(getRankedValue(entry("a", -1))).toBe(0);
    expect(getRankedValue(entry("a", 42.5))).toBe(42.5);
  });

  it("returns null for an absent value or entry", () => {
    expect(getRankedValue(entry("a"))).toBeNull();
    expect(getRankedValue(entry("a", Number.NaN))).toBeNull();
    expect(getRankedValue()).toBeNull();
  });
});

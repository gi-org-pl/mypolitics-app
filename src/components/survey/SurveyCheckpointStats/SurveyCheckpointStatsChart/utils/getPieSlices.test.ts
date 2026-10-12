import { describe, expect, it } from "vitest";

import type { StatsCheckpointCard } from "@/types/checkpoint";

import { MIN_SLICE_SHARE } from "../../SurveyCheckpointStats.constants";
import { getPieSlices } from "./getPieSlices";

const PRECISION = 10;

type Counts = StatsCheckpointCard["counts"];

const getSizes = (counts: Counts) =>
  getPieSlices(counts).map(({ id, from, to }) => [id, to - from] as const);

describe("getPieSlices()", () => {
  it("sizes the three slices by the three counts, in the order for, against, no answer", () => {
    const slices = getPieSlices({ for: 100, against: 600, noAnswer: 300 });

    expect(slices.map(({ id }) => id)).toEqual(["for", "against", "noAnswer"]);
    expect(slices[0]).toEqual({ id: "for", from: 0, to: 0.1 });
    expect(slices[1].from).toBe(0.1);
    expect(slices[1].to).toBeCloseTo(0.7, PRECISION);
    expect(slices[2].from).toBeCloseTo(0.7, PRECISION);
    expect(slices[2].to).toBe(1);
  });

  it("makes the slices fill the circle exactly", () => {
    const slices = getPieSlices({ for: 1, against: 1, noAnswer: 1 });

    expect(slices[0].from).toBe(0);
    expect(slices[1].from).toBe(slices[0].to);
    expect(slices[2].from).toBe(slices[1].to);
    expect(slices[2].to).toBe(1);
  });

  it("leaves out a count of zero", () => {
    expect(getPieSlices({ for: 0, against: 700, noAnswer: 300 })).toEqual([
      { id: "against", from: 0, to: 0.7 },
      { id: "noAnswer", from: 0.7, to: 1 },
    ]);
    expect(getPieSlices({ for: 80, against: 920, noAnswer: 0 })).toEqual([
      { id: "for", from: 0, to: 0.08 },
      { id: "against", from: 0.08, to: 1 },
    ]);
  });

  it("gives a tiny count at least the smallest share and takes it from the others", () => {
    const [tiny, against, noAnswer] = getSizes({
      for: 1,
      against: 2600,
      noAnswer: 399,
    });

    expect(tiny).toEqual(["for", MIN_SLICE_SHARE]);
    expect(against[1]).toBeLessThan(2600 / 3000);
    expect(noAnswer[1]).toBeLessThan(399 / 3000);
    expect(against[1]).toBeGreaterThan(noAnswer[1]);
    expect(tiny[1] + against[1] + noAnswer[1]).toBeCloseTo(1, PRECISION);
  });

  it("keeps every slice at the smallest share or above when two counts are tiny", () => {
    const sizes = getSizes({ for: 1, against: 9998, noAnswer: 1 });

    expect(sizes.map(([id]) => id)).toEqual(["for", "against", "noAnswer"]);
    expect(sizes[0][1]).toBe(MIN_SLICE_SHARE);
    expect(sizes[1][1]).toBeCloseTo(1 - 2 * MIN_SLICE_SHARE, PRECISION);
    expect(sizes[2][1]).toBeCloseTo(MIN_SLICE_SHARE, PRECISION);
  });

  it("leaves a slice that is exactly the smallest share as it is", () => {
    expect(getPieSlices({ for: 3, against: 97, noAnswer: 0 })).toEqual([
      { id: "for", from: 0, to: MIN_SLICE_SHARE },
      { id: "against", from: MIN_SLICE_SHARE, to: 1 },
    ]);
  });

  it("returns one slice from 0 to 1 when one count holds everything", () => {
    expect(getPieSlices({ for: 0, against: 1000, noAnswer: 0 })).toEqual([
      { id: "against", from: 0, to: 1 },
    ]);
    expect(getPieSlices({ for: 1, against: 0, noAnswer: 0 })).toEqual([
      { id: "for", from: 0, to: 1 },
    ]);
  });

  it("returns no slice for three counts of zero", () => {
    expect(getPieSlices({ for: 0, against: 0, noAnswer: 0 })).toEqual([]);
  });

  it.each([
    ["negative", { for: -1, against: 600, noAnswer: 300 }],
    ["not a number", { for: Number.NaN, against: 600, noAnswer: 300 }],
    ["infinite", { for: 100, against: Number.POSITIVE_INFINITY, noAnswer: 1 }],
    ["text", { for: "100", against: 600, noAnswer: 300 }],
    ["missing", { for: 100, against: 600 }],
  ])("returns no slice when a count is %s", (_, counts) => {
    expect(getPieSlices(counts as Counts)).toEqual([]);
  });

  it.each([
    undefined,
    null,
  ])("returns no slice and does not throw when the counts are %s", (counts) => {
    expect(getPieSlices(counts as unknown as Counts)).toEqual([]);
  });
});

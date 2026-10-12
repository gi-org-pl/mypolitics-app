import { describe, expect, it } from "vitest";

import type { CheckpointCard, RunningAxis } from "@/types/checkpoint";

import {
  axisPuzzleCard,
  createRecord,
  createSingleAxis,
  createTwoSidedAxis,
  doubleClosenessCard,
  halfwayCard,
  singleClosenessCard,
} from "@/utils/checkpoint/engine/getNextCheckpoint.fixtures";
import { getQualifyingAxes } from "./getQualifyingAxes";

const toIds = (axes: RunningAxis[], cards: CheckpointCard[] = []): string[] =>
  getQualifyingAxes(axes, createRecord(cards).cardsShown).map(({ id }) => id);

describe("getQualifyingAxes()", () => {
  it("needs at least 5 answered questions behind the axis", () => {
    expect(
      toIds([
        createTwoSidedAxis("four", 10, 90, 4),
        createTwoSidedAxis("five", 10, 90, 5),
        createSingleAxis("none", 95, 0),
        createSingleAxis("many", 95, 31),
      ]),
    ).toEqual(["five", "many"]);
  });

  it("takes a single axis at 70 and not at 69.6", () => {
    expect(
      toIds([createSingleAxis("under", 69.6), createSingleAxis("at", 70)]),
    ).toEqual(["at"]);
  });

  it("takes a two-sided axis at a lean of 15 and not at 14.99", () => {
    expect(
      toIds([
        createTwoSidedAxis("under", 60, 45.01),
        createTwoSidedAxis("at", 60, 45),
      ]),
    ).toEqual(["at"]);
  });

  it("leaves out a two-sided axis with an absent value", () => {
    expect(
      toIds([
        createTwoSidedAxis("no-end", 90),
        createTwoSidedAxis("no-start", undefined, 90),
        createTwoSidedAxis("equal", 50, 50),
      ]),
    ).toEqual([]);
  });

  it("leaves out an axis that has had a closeness card or a puzzle", () => {
    const axes = [
      createTwoSidedAxis("europe", 20, 60),
      createTwoSidedAxis("economy", 70, 30),
      createSingleAxis("decentralisation", 83),
      createTwoSidedAxis("free", 10, 80),
    ];

    expect(toIds(axes)).toHaveLength(4);
    expect(toIds(axes, [doubleClosenessCard])).not.toContain("europe");
    expect(toIds(axes, [halfwayCard, axisPuzzleCard])).not.toContain("economy");
    expect(toIds(axes, [singleClosenessCard])).not.toContain(
      "decentralisation",
    );
    expect(
      toIds(axes, [doubleClosenessCard, axisPuzzleCard, singleClosenessCard]),
    ).toEqual(["free"]);
  });

  it("leaves out an axis whose orientations a card was about, under another identifier", () => {
    const { start, end } = axisPuzzleCard;
    const sameOrientations = {
      ...createTwoSidedAxis("copy", 20, 70),
      start: { ...end, value: 20 },
      end: { ...start, value: 70 },
    } as RunningAxis;

    expect(toIds([sameOrientations])).toEqual(["copy"]);
    expect(toIds([sameOrientations], [axisPuzzleCard])).toEqual([]);
  });

  it("treats two axes with the same orientations as one", () => {
    const first = createTwoSidedAxis("first", 20, 70);
    const twin: RunningAxis = { ...first, id: "twin" };

    expect(toIds([first, twin, createTwoSidedAxis("other", 80, 20)])).toEqual([
      "other",
      "first",
    ]);
    expect(toIds([twin, first])).toEqual(["twin"]);
  });

  it("orders by lean, then by answered questions, then by the quiz's order", () => {
    expect(
      toIds([
        createTwoSidedAxis("lean-20", 40, 60),
        createTwoSidedAxis("lean-40-five", 60, 20, 5),
        createSingleAxis("lean-33", 83),
        createTwoSidedAxis("lean-40-nine", 20, 60, 9),
        createTwoSidedAxis("lean-20-later", 70, 50),
        createTwoSidedAxis("lean-40-nine-later", 55, 95, 9),
      ]),
    ).toEqual([
      "lean-40-nine",
      "lean-40-nine-later",
      "lean-40-five",
      "lean-33",
      "lean-20",
      "lean-20-later",
    ]);
  });

  it("does not change the axes it was given", () => {
    const axes = [
      createTwoSidedAxis("a", 40, 60),
      createTwoSidedAxis("b", 20, 90),
    ];
    const copy = structuredClone(axes);

    getQualifyingAxes(axes, []);

    expect(axes).toEqual(copy);
  });
});

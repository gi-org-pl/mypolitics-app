import { describe, expect, it } from "vitest";

import type {
  CheckpointCard,
  CheckpointTriggerInput,
  RunningAxis,
} from "@/types/checkpoint";

import { getAxisClosenessCandidate } from "./getAxisClosenessCandidate";
import {
  axisPuzzleCard,
  createRecord,
  createSingleAxis,
  createState,
  createTriggerInput,
  createTwoSidedAxis,
} from "./getNextCheckpoint.fixtures";

const toInput = (
  axes: RunningAxis[],
  cards: CheckpointCard[] = [],
): CheckpointTriggerInput =>
  createTriggerInput({
    state: createState(12, 60, { axes }),
    record: createRecord(cards),
  });

describe("getAxisClosenessCandidate()", () => {
  it("returns the single variant for a single axis, with its orientation and value", () => {
    const axis = createSingleAxis("scale", 83.4);

    expect(getAxisClosenessCandidate(toInput([axis]))).toEqual({
      type: "axis-closeness",
      boundary: 12,
      axisId: "scale",
      variant: "single",
      entry: (axis as Extract<RunningAxis, { kind: "single" }>).entry,
    });
  });

  it("returns the double variant for a two-sided axis, with both sides and the leading side", () => {
    const axis = createTwoSidedAxis("pair", 61.5, 20);
    const { start, end } = axis as Extract<RunningAxis, { kind: "two-sided" }>;

    expect(getAxisClosenessCandidate(toInput([axis]))).toEqual({
      type: "axis-closeness",
      boundary: 12,
      axisId: "pair",
      variant: "double",
      start,
      end,
      leadingSide: "start",
    });
    expect(start.value).toBe(61.5);
    expect(end.value).toBe(20);
  });

  it("keeps the sides of the quiz when the positive side leads", () => {
    const axis = createTwoSidedAxis("pair", 20, 61.5);
    const { start, end } = axis as Extract<RunningAxis, { kind: "two-sided" }>;

    expect(getAxisClosenessCandidate(toInput([axis]))).toMatchObject({
      variant: "double",
      start,
      end,
      leadingSide: "end",
    });
  });

  it("returns the axis with the clearest lean of those that qualify", () => {
    expect(
      getAxisClosenessCandidate(
        toInput([
          createTwoSidedAxis("lean-20", 40, 60),
          createSingleAxis("lean-33", 83),
          createTwoSidedAxis("lean-25", 70, 45),
        ]),
      ),
    ).toMatchObject({ axisId: "lean-33", variant: "single" });
  });

  it("returns the next axis once the best one has had a card", () => {
    const axes = [
      createTwoSidedAxis("economy", 80, 10),
      createTwoSidedAxis("lean-25", 70, 45),
    ];

    expect(getAxisClosenessCandidate(toInput(axes))?.axisId).toBe("economy");
    expect(
      getAxisClosenessCandidate(toInput(axes, [axisPuzzleCard]))?.axisId,
    ).toBe("lean-25");
  });

  it("returns nothing when no axis qualifies", () => {
    expect(getAxisClosenessCandidate(toInput([]))).toBeUndefined();
    expect(
      getAxisClosenessCandidate(
        toInput([
          createSingleAxis("low", 30),
          createTwoSidedAxis("flat", 50, 52),
          createTwoSidedAxis("thin", 10, 90, 4),
        ]),
      ),
    ).toBeUndefined();
  });
});

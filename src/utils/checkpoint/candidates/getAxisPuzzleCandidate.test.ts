import { describe, expect, it } from "vitest";

import type {
  CheckpointCard,
  CheckpointTriggerInput,
  RunningAxis,
} from "@/types/checkpoint";
import {
  axisPuzzleCard,
  createRecord,
  createSingleAxis,
  createState,
  createTriggerInput,
  createTwoSidedAxis,
  doubleClosenessCard,
} from "@/utils/checkpoint/engine/getNextCheckpoint.fixtures";
import { getAxisPuzzleCandidate } from "./getAxisPuzzleCandidate";

const toInput = (
  axes: RunningAxis[],
  cards: CheckpointCard[] = [],
): CheckpointTriggerInput =>
  createTriggerInput({
    state: createState(18, 60, { axes }),
    record: createRecord(cards),
  });

describe("getAxisPuzzleCandidate()", () => {
  it("returns the best two-sided axis with both poles and the leading side", () => {
    const best = createTwoSidedAxis("lean-45", 25, 70);
    const { start, end } = best as Extract<RunningAxis, { kind: "two-sided" }>;

    expect(
      getAxisPuzzleCandidate(
        toInput([createTwoSidedAxis("lean-20", 60, 40), best]),
      ),
    ).toEqual({
      type: "axis-puzzle",
      boundary: 18,
      axisId: "lean-45",
      start,
      end,
      leadingSide: "end",
    });
    expect(
      getAxisPuzzleCandidate(toInput([createTwoSidedAxis("pair", 60, 40)])),
    ).toMatchObject({ axisId: "pair", leadingSide: "start" });
  });

  it("never returns a single axis", () => {
    expect(
      getAxisPuzzleCandidate(toInput([createSingleAxis("scale", 99)])),
    ).toBeUndefined();
    expect(
      getAxisPuzzleCandidate(
        toInput([
          createSingleAxis("scale", 99),
          createTwoSidedAxis("pair", 60, 40),
        ]),
      )?.axisId,
    ).toBe("pair");
  });

  it("leaves out an axis that has had a card of either type", () => {
    const axes = [
      createTwoSidedAxis("europe", 10, 90),
      createTwoSidedAxis("economy", 80, 20),
      createTwoSidedAxis("pair", 60, 40),
    ];

    expect(getAxisPuzzleCandidate(toInput(axes))?.axisId).toBe("europe");
    expect(
      getAxisPuzzleCandidate(toInput(axes, [doubleClosenessCard]))?.axisId,
    ).toBe("economy");
    expect(
      getAxisPuzzleCandidate(
        toInput(axes, [doubleClosenessCard, axisPuzzleCard]),
      )?.axisId,
    ).toBe("pair");
  });

  it("returns nothing when no two-sided axis qualifies", () => {
    expect(getAxisPuzzleCandidate(toInput([]))).toBeUndefined();
    expect(
      getAxisPuzzleCandidate(
        toInput([
          createTwoSidedAxis("flat", 50, 60),
          createTwoSidedAxis("equal", 70, 70),
          createTwoSidedAxis("no-value", 90),
          createTwoSidedAxis("thin", 10, 90, 4),
        ]),
      ),
    ).toBeUndefined();
  });
});

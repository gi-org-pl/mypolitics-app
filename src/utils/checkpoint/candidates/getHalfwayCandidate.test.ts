import { describe, expect, it } from "vitest";

import type {
  CheckpointCard,
  CheckpointTriggerInput,
} from "@/types/checkpoint";
import {
  createRecord,
  createState,
  createTriggerInput,
  halfwayCard,
  newTraitCard,
} from "@/utils/checkpoint/engine/getNextCheckpoint.fixtures";
import { getHalfwayCandidate } from "./getHalfwayCandidate";

const toInput = (
  done: number,
  all: number,
  minutesLeft: number | undefined = 8,
  cards: CheckpointCard[] = [],
): CheckpointTriggerInput =>
  createTriggerInput({
    state: createState(done, all, {
      timing: { timedQuestions: 0, minutesLeft },
    }),
    record: createRecord(cards),
  });

describe("getHalfwayCandidate()", () => {
  it("returns a card at the midpoint boundary", () => {
    expect(getHalfwayCandidate(toInput(51, 102))).toEqual({
      type: "halfway",
      boundary: 51,
      percent: 50,
      minutes: 8,
    });
  });

  it("returns nothing at any other boundary", () => {
    for (const done of [0, 20, 50, 52, 80, 102]) {
      expect(getHalfwayCandidate(toInput(done, 102))).toBeUndefined();
    }
  });

  it("rounds the percent down: 5 of 9 is 55", () => {
    expect(getHalfwayCandidate(toInput(5, 9))?.percent).toBe(55);
    expect(getHalfwayCandidate(toInput(4, 9))).toBeUndefined();
    expect(getHalfwayCandidate(toInput(6, 11))?.percent).toBe(54);
  });

  it("is never below 50 percent, and exact for every length of a quiz", () => {
    for (let all = 1; all <= 300; all += 1) {
      const done = Math.ceil(all / 2);
      const percent = getHalfwayCandidate(toInput(done, all))?.percent;

      expect(percent).toBeGreaterThanOrEqual(50);
      // Whole numbers only: no rounding error of the share can cost a percent.
      expect(percent).toBe((done * 100 - ((done * 100) % all)) / all);
    }

    expect(getHalfwayCandidate(toInput(3, 5))?.percent).toBe(60);
    expect(getHalfwayCandidate(toInput(13, 25))?.percent).toBe(52);
  });

  it("returns nothing without minutes left", () => {
    expect(
      getHalfwayCandidate(
        createTriggerInput({
          state: createState(51, 102, { timing: { timedQuestions: 0 } }),
        }),
      ),
    ).toBeUndefined();
  });

  it("returns nothing above 99 minutes", () => {
    expect(getHalfwayCandidate(toInput(51, 102, 100))).toBeUndefined();
    expect(getHalfwayCandidate(toInput(51, 102, 99))?.minutes).toBe(99);
    expect(getHalfwayCandidate(toInput(51, 102, 1))?.minutes).toBe(1);
  });

  it("returns nothing once the card was shown", () => {
    expect(
      getHalfwayCandidate(toInput(51, 102, 8, [newTraitCard, halfwayCard])),
    ).toBeUndefined();
    expect(
      getHalfwayCandidate(toInput(51, 102, 8, [newTraitCard])),
    ).toBeDefined();
  });
});

import { describe, expect, it } from "vitest";

import type { CheckpointTriggerInput } from "@/types/checkpoint";
import {
  createArchetypes,
  createRecord,
  createState,
  createTriggerInput,
  halfwayCard,
  positionPuzzleCard,
  SEED,
} from "@/utils/checkpoint/engine/getNextCheckpoint.fixtures";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { getPositionPuzzleCandidate } from "./getPositionPuzzleCandidate";
import { getPositionPuzzleOptions } from "./getPositionPuzzleOptions";

// A state at boundary `done` of 60 questions, with archetypes of the
// closeness given, closest first.
const toInput = (
  values: (number | undefined)[],
  done = 30,
  overrides: Partial<CheckpointTriggerInput> = {},
): CheckpointTriggerInput =>
  createTriggerInput({
    state: createState(done, 60, { archetypes: createArchetypes(values) }),
    ...overrides,
  });

describe("getPositionPuzzleCandidate()", () => {
  it("returns a card with the leader, its closeness and the three options", () => {
    const input = toInput([72.5, 60, 41, 30, 12]);
    const { archetypes } = input.state;

    expect(getPositionPuzzleCandidate(input)).toEqual({
      type: "position-puzzle",
      boundary: 30,
      leader: archetypes[0].orientation,
      closeness: 72.5,
      options: getPositionPuzzleOptions(archetypes, SEED),
    });
  });

  it("returns nothing with fewer than 3 archetypes", () => {
    expect(getPositionPuzzleCandidate(toInput([80, 40]))).toBeUndefined();
    expect(getPositionPuzzleCandidate(toInput([80]))).toBeUndefined();
    expect(getPositionPuzzleCandidate(toInput([]))).toBeUndefined();
    expect(getPositionPuzzleCandidate(toInput([80, 40, 30]))).toBeDefined();
  });

  it("returns nothing before half the questions are done", () => {
    expect(
      getPositionPuzzleCandidate(toInput([80, 40, 30], 29)),
    ).toBeUndefined();
    expect(getPositionPuzzleCandidate(toInput([80, 40, 30], 30))).toBeDefined();
    expect(getPositionPuzzleCandidate(toInput([80, 40, 30], 45))).toBeDefined();
  });

  it("counts half of an odd number of questions from the first boundary past it", () => {
    const archetypes = createArchetypes([80, 40, 30]);

    expect(
      getPositionPuzzleCandidate(
        createTriggerInput({ state: createState(30, 61, { archetypes }) }),
      ),
    ).toBeUndefined();
    expect(
      getPositionPuzzleCandidate(
        createTriggerInput({ state: createState(31, 61, { archetypes }) }),
      ),
    ).toBeDefined();
  });

  it("returns nothing when the leader is under 50", () => {
    expect(getPositionPuzzleCandidate(toInput([49.9, 20, 10]))).toBeUndefined();
  });

  it("returns nothing when the leader is less than 5 points ahead", () => {
    expect(
      getPositionPuzzleCandidate(toInput([70, 65.01, 10])),
    ).toBeUndefined();
  });

  it("returns nothing when the two closest are equal", () => {
    expect(getPositionPuzzleCandidate(toInput([70, 70, 10]))).toBeUndefined();
  });

  it("returns a card at a separation of exactly 5 and a closeness of exactly 50", () => {
    expect(getPositionPuzzleCandidate(toInput([50, 45, 10]))).toMatchObject({
      type: "position-puzzle",
      closeness: 50,
    });
  });

  it("returns nothing for a leader or a runner-up without a value", () => {
    expect(
      getPositionPuzzleCandidate(toInput([undefined, undefined, undefined])),
    ).toBeUndefined();
    expect(
      getPositionPuzzleCandidate(toInput([80, undefined, undefined])),
    ).toBeUndefined();
    expect(
      getPositionPuzzleCandidate(toInput([80, 40, undefined])),
    ).toBeDefined();
  });

  it("returns nothing when two distractors cannot be drawn", () => {
    const [first, second, third] = createArchetypes([80, 40, 30]);
    const archetypes = [
      first,
      second,
      { ...third, orientation: createOrientation("twin", "Postać 2") },
    ];

    expect(
      getPositionPuzzleCandidate(
        createTriggerInput({ state: createState(30, 60, { archetypes }) }),
      ),
    ).toBeUndefined();
  });

  it("returns nothing once the card was shown", () => {
    expect(
      getPositionPuzzleCandidate(
        toInput([80, 40, 30], 40, {
          record: createRecord([positionPuzzleCard, halfwayCard]),
        }),
      ),
    ).toBeUndefined();
    expect(
      getPositionPuzzleCandidate(
        toInput([80, 40, 30], 40, { record: createRecord([halfwayCard]) }),
      ),
    ).toBeDefined();
  });

  it("returns the same card for the same seed, and may return another order for another", () => {
    const input = toInput([80, 70, 65, 60, 55, 50]);
    const orders = new Set(
      Array.from({ length: 40 }, (_, index) =>
        getPositionPuzzleCandidate({ ...input, seed: `seed-${index}` })
          ?.options.map(({ id }) => id)
          .join(),
      ),
    );

    expect(getPositionPuzzleCandidate(input)).toEqual(
      getPositionPuzzleCandidate(input),
    );
    expect(orders.size).toBeGreaterThan(1);
  });
});

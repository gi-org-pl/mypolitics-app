import { describe, expect, it } from "vitest";

import type { CheckpointCandidate, CheckpointCard } from "@/types/checkpoint";
import { drawCheckpointLine } from "@/utils/checkpoint/lines/drawCheckpointLine";
import { createOrientation } from "@/utils/vitest/createOrientation";
import {
  allCards,
  axisPuzzleCard,
  createRecord,
  halfwayCard,
  newTraitCard,
  positionPuzzleCard,
  SEED,
  statsForCard,
} from "./getNextCheckpoint.fixtures";
import { toCheckpointCard } from "./toCheckpointCard";

const toCandidate = ({ line, ...candidate }: CheckpointCard) =>
  candidate as CheckpointCandidate;

const nameless = createOrientation("nameless");

describe("toCheckpointCard()", () => {
  it("returns the candidate with the first line of its pool for a fresh record", () => {
    const record = createRecord();

    for (const card of allCards) {
      expect(toCheckpointCard(toCandidate(card), record, SEED)).toEqual({
        ...card,
        line: drawCheckpointLine(card.line.pool, record, SEED),
      });
    }
  });

  it("draws the next unused line of the pool", () => {
    const first = toCheckpointCard(
      toCandidate(newTraitCard),
      createRecord(),
      SEED,
    );
    const second = toCheckpointCard(
      toCandidate(newTraitCard),
      createRecord(first ? [first] : []),
      SEED,
    );

    expect(first?.line.pool).toBe("new-trait");
    expect(second?.line.pool).toBe("new-trait");
    expect(second?.line.index).not.toBe(first?.line.index);
  });

  it("draws the ask line of a puzzle", () => {
    expect(
      toCheckpointCard(toCandidate(axisPuzzleCard), createRecord(), SEED)?.line
        .pool,
    ).toBe("axis-puzzle-ask");
    expect(
      toCheckpointCard(toCandidate(positionPuzzleCard), createRecord(), SEED)
        ?.line.pool,
    ).toBe("position-puzzle-ask");
  });

  it("returns nothing when a slot of its pool cannot be filled", () => {
    expect(
      toCheckpointCard(
        {
          ...toCandidate(newTraitCard),
          trait: nameless,
        } as CheckpointCandidate,
        createRecord(),
        SEED,
      ),
    ).toBeUndefined();
    expect(
      toCheckpointCard(
        { ...toCandidate(halfwayCard), minutes: 0 } as CheckpointCandidate,
        createRecord(),
        SEED,
      ),
    ).toBeUndefined();
    expect(
      toCheckpointCard(
        { ...toCandidate(statsForCard), percent: 11 } as CheckpointCandidate,
        createRecord(),
        SEED,
      ),
    ).toBeUndefined();
  });

  it("returns nothing for a puzzle whose reveal could not be finished", () => {
    // Neither ask pool has a slot: only the reveal needs the names.
    expect(
      toCheckpointCard(
        {
          ...toCandidate(positionPuzzleCard),
          leader: nameless,
        } as CheckpointCandidate,
        createRecord(),
        SEED,
      ),
    ).toBeUndefined();
    expect(
      toCheckpointCard(
        {
          ...toCandidate(axisPuzzleCard),
          start: { orientation: nameless, value: 70 },
        } as CheckpointCandidate,
        createRecord(),
        SEED,
      ),
    ).toBeUndefined();
  });

  it("returns nothing for a candidate of a type that has no pool", () => {
    expect(
      toCheckpointCard(
        { type: "confetti", boundary: 20 } as unknown as CheckpointCandidate,
        createRecord(),
        SEED,
      ),
    ).toBeUndefined();
  });
});

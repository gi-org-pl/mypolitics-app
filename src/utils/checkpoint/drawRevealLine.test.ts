import { describe, expect, it } from "vitest";

import { CHECKPOINT_POOLS } from "@/constants/checkpoint";

import { drawRevealLine } from "./drawRevealLine";
import {
  axisPuzzleCard,
  createRecord,
  halfwayCard,
  positionPuzzleCard,
  SEED,
} from "./getNextCheckpoint.fixtures";
import { seededShuffle } from "./seededShuffle";

const PLACES = [0, 1, 2];

describe("drawRevealLine()", () => {
  it("draws a hit line from the hit pool of the puzzle that is up, and records it", () => {
    const record = createRecord([halfwayCard, axisPuzzleCard]);
    const [first] = seededShuffle(PLACES, SEED, "axis-puzzle-hit");
    const drawn = drawRevealLine(record, "hit", SEED);

    expect(drawn.line).toEqual({ pool: "axis-puzzle-hit", index: first });
    expect(drawn.record).toEqual({
      ...record,
      cardsShown: [
        { card: halfwayCard },
        { card: axisPuzzleCard, revealLines: { hit: drawn.line } },
      ],
    });
  });

  it("draws a miss line from the miss pool, and records it", () => {
    const record = createRecord([positionPuzzleCard]);
    const [first] = seededShuffle(PLACES, SEED, "position-puzzle-miss");
    const drawn = drawRevealLine(record, "miss", SEED);

    expect(drawn.line).toEqual({ pool: "position-puzzle-miss", index: first });
    expect(drawn.record.cardsShown).toEqual([
      { card: positionPuzzleCard, revealLines: { miss: drawn.line } },
    ]);
  });

  it("takes the next unused line of that pool", () => {
    const [first, second] = seededShuffle(PLACES, SEED, "axis-puzzle-miss");
    const record = createRecord([
      {
        card: axisPuzzleCard,
        revealLines: { miss: { pool: "axis-puzzle-miss", index: first } },
      },
      halfwayCard,
      { ...axisPuzzleCard, axisId: "another" },
    ]);

    expect(drawRevealLine(record, "miss", SEED).line?.index).toBe(second);
  });

  it("returns the recorded line and draws nothing when that outcome was revealed before", () => {
    const recordedLine = { pool: "axis-puzzle-hit", index: 2 } as const;
    const record = createRecord([
      { card: axisPuzzleCard, revealLines: { hit: recordedLine } },
    ]);
    const drawn = drawRevealLine(record, "hit", SEED);

    expect(drawn.line).toBe(recordedLine);
    expect(drawn.record).toBe(record);
  });

  it("keeps the line of the other outcome when it draws a second one", () => {
    const hit = { pool: "axis-puzzle-hit", index: 2 } as const;
    const record = createRecord([
      { card: axisPuzzleCard, revealLines: { hit } },
    ]);
    const drawn = drawRevealLine(record, "miss", SEED);

    expect(drawn.record.cardsShown[0].revealLines).toEqual({
      hit,
      miss: drawn.line,
    });
  });

  it("does not change the record it was given", () => {
    const record = createRecord([axisPuzzleCard]);
    const copy = structuredClone(record);

    drawRevealLine(record, "hit", SEED);

    expect(record).toEqual(copy);
  });

  it("returns no line when the card that is up is not a puzzle", () => {
    const record = createRecord([axisPuzzleCard, halfwayCard]);

    expect(drawRevealLine(record, "hit", SEED)).toEqual({ record });
  });

  it("returns no line for an empty record", () => {
    const record = createRecord();

    expect(drawRevealLine(record, "miss", SEED)).toEqual({ record });
  });

  it("returns no line when the pool has none", () => {
    const record = createRecord([axisPuzzleCard]);

    expect(
      drawRevealLine(record, "hit", SEED, {
        ...CHECKPOINT_POOLS,
        "axis-puzzle-hit": [],
      }),
    ).toEqual({ record });
  });

  it("returns the same line for the same seed and record", () => {
    const record = createRecord([positionPuzzleCard]);

    expect(drawRevealLine(record, "hit", SEED)).toEqual(
      drawRevealLine(record, "hit", SEED),
    );
  });
});

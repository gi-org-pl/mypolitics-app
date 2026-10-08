import { describe, expect, it } from "vitest";

import { CHECKPOINT_POOLS } from "@/constants/checkpoint";
import type {
  CheckpointPoolId,
  CheckpointPools,
  CheckpointRecord,
} from "@/types/checkpoint";

import { drawCheckpointLine } from "./drawCheckpointLine";
import {
  axisPuzzleCard,
  createRecord,
  halfwayCard,
  SEED,
} from "./getNextCheckpoint.fixtures";
import { seededShuffle } from "./seededShuffle";

const PLACES = [0, 1, 2];

// A session that draws from one pool `count` times: every line drawn goes
// into the record, as the line of a card shown.
const drawInTurn = (
  pool: CheckpointPoolId,
  count: number,
  seed = SEED,
  pools?: CheckpointPools,
  record: CheckpointRecord = createRecord(),
): number[] => {
  const line = drawCheckpointLine(pool, record, seed, pools);

  return count > 0 && line
    ? [
        line.index,
        ...drawInTurn(
          pool,
          count - 1,
          seed,
          pools,
          createRecord([...record.cardsShown, { ...halfwayCard, line }]),
        ),
      ]
    : [];
};

const withPool = (lines: number): CheckpointPools => ({
  ...CHECKPOINT_POOLS,
  halfway: CHECKPOINT_POOLS.halfway.slice(0, lines),
});

describe("drawCheckpointLine()", () => {
  it("returns the first line of the pool's order for a fresh record", () => {
    const [first] = seededShuffle(PLACES, SEED, "halfway");

    expect(drawCheckpointLine("halfway", createRecord(), SEED)).toEqual({
      pool: "halfway",
      index: first,
    });
  });

  it("returns the next unused line when the pool was used before", () => {
    const order = seededShuffle(PLACES, SEED, "axis-closeness-single");

    expect(drawInTurn("axis-closeness-single", 3)).toEqual(order);
  });

  it("counts reveal lines as used", () => {
    const [first, second] = seededShuffle(PLACES, SEED, "axis-puzzle-hit");
    const record = createRecord([
      {
        card: axisPuzzleCard,
        revealLines: { hit: { pool: "axis-puzzle-hit", index: first } },
      },
    ]);

    expect(drawCheckpointLine("axis-puzzle-hit", record, SEED)?.index).toBe(
      second,
    );
  });

  it("never returns a line twice within one round", () => {
    for (let index = 0; index < 100; index += 1) {
      const drawn = drawInTurn("new-trait", 9, `seed-${index}`);

      expect(drawn).toHaveLength(9);

      for (const round of [
        drawn.slice(0, 3),
        drawn.slice(3, 6),
        drawn.slice(6),
      ]) {
        expect([...round].sort()).toEqual(PLACES);
      }
    }
  });

  it("starts a new round with a new order when the pool is used up", () => {
    const firstRound = seededShuffle(PLACES, SEED, "axis-closeness-single");
    const secondRound = seededShuffle(PLACES, SEED, "axis-closeness-single", 1);

    // The second round does not open with the line the first one ended on, so
    // its order is drawn as it is.
    expect(secondRound[0]).not.toBe(firstRound[2]);
    expect(secondRound).not.toEqual(firstRound);
    expect(drawInTurn("axis-closeness-single", 6)).toEqual([
      ...firstRound,
      ...secondRound,
    ]);
  });

  it("swaps the first two lines of a new round when the first is the line used last", () => {
    const firstRound = seededShuffle(PLACES, SEED, "halfway");
    const [first, second, third] = seededShuffle(PLACES, SEED, "halfway", 1);

    expect(first).toBe(firstRound[2]);
    expect(drawInTurn("halfway", 6)).toEqual([
      ...firstRound,
      second,
      first,
      third,
    ]);
  });

  it("never returns the same line twice in a row", () => {
    for (let index = 0; index < 100; index += 1) {
      const drawn = drawInTurn("stats-for", 12, `seed-${index}`);

      expect(drawn).toHaveLength(12);

      for (const [place, line] of drawn.entries()) {
        expect(line).not.toBe(drawn[place - 1]);
      }
    }
  });

  it("returns the only line of a one-line pool every time", () => {
    expect(drawInTurn("halfway", 4, SEED, withPool(1))).toEqual([0, 0, 0, 0]);
  });

  it("returns nothing for a pool with no lines", () => {
    expect(
      drawCheckpointLine("halfway", createRecord(), SEED, withPool(0)),
    ).toBeUndefined();
  });

  it("returns nothing for a pool that does not exist", () => {
    expect(
      drawCheckpointLine("unknown" as CheckpointPoolId, createRecord(), SEED),
    ).toBeUndefined();
  });

  it("gives each pool an order that does not depend on the other pools", () => {
    const record = createRecord([
      halfwayCard,
      { ...halfwayCard, line: { pool: "stats-for", index: 1 } },
      {
        card: axisPuzzleCard,
        revealLines: { miss: { pool: "axis-puzzle-miss", index: 2 } },
      },
    ]);

    expect(drawCheckpointLine("new-trait", record, SEED)).toEqual(
      drawCheckpointLine("new-trait", createRecord(), SEED),
    );

    const orders = (Object.keys(CHECKPOINT_POOLS) as CheckpointPoolId[]).map(
      (pool) => drawInTurn(pool, 3).join(""),
    );

    expect(new Set(orders).size).toBeGreaterThan(1);
  });

  it("returns the same lines for the same seed and record", () => {
    expect(drawInTurn("nolan-path-partial", 7)).toEqual(
      drawInTurn("nolan-path-partial", 7),
    );
  });

  it("gives another session, with another seed, an order of its own", () => {
    const orders = Array.from({ length: 30 }, (_, index) =>
      drawInTurn("halfway", 3, `seed-${index}`).join(""),
    );

    expect(new Set(orders).size).toBeGreaterThan(1);
  });

  it("still draws, in a fixed order, without a seed", () => {
    expect(drawInTurn("halfway", 3, "")).toEqual(drawInTurn("halfway", 3, ""));
    expect(drawInTurn("halfway", 3, "")).toHaveLength(3);
  });
});

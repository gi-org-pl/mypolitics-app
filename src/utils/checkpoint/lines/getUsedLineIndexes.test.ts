import { describe, expect, it } from "vitest";

import {
  axisPuzzleCard,
  createRecord,
  halfwayCard,
  positionPuzzleCard,
  singleClosenessCard,
} from "@/utils/checkpoint/engine/getNextCheckpoint.fixtures";
import { getUsedLineIndexes } from "./getUsedLineIndexes";

describe("getUsedLineIndexes()", () => {
  it("returns the lines of the pool that the cards shown drew, in their order", () => {
    const { cardsShown } = createRecord([
      {
        ...singleClosenessCard,
        line: { pool: "axis-closeness-single", index: 2 },
      },
      halfwayCard,
      {
        ...singleClosenessCard,
        line: { pool: "axis-closeness-single", index: 0 },
      },
    ]);

    expect(getUsedLineIndexes(cardsShown, "axis-closeness-single")).toEqual([
      2, 0,
    ]);
    expect(getUsedLineIndexes(cardsShown, "halfway")).toEqual([0]);
  });

  it("counts the reveal lines of a puzzle for their own pools", () => {
    const { cardsShown } = createRecord([
      {
        card: axisPuzzleCard,
        revealLines: { hit: { pool: "axis-puzzle-hit", index: 2 } },
      },
      {
        card: positionPuzzleCard,
        revealLines: {
          hit: { pool: "position-puzzle-hit", index: 1 },
          miss: { pool: "position-puzzle-miss", index: 0 },
        },
      },
    ]);

    expect(getUsedLineIndexes(cardsShown, "axis-puzzle-ask")).toEqual([1]);
    expect(getUsedLineIndexes(cardsShown, "axis-puzzle-hit")).toEqual([2]);
    expect(getUsedLineIndexes(cardsShown, "axis-puzzle-miss")).toEqual([]);
    expect(getUsedLineIndexes(cardsShown, "position-puzzle-hit")).toEqual([1]);
    expect(getUsedLineIndexes(cardsShown, "position-puzzle-miss")).toEqual([0]);
  });

  it("returns nothing for a pool that was not used and for an empty record", () => {
    expect(
      getUsedLineIndexes(createRecord([halfwayCard]).cardsShown, "new-trait"),
    ).toEqual([]);
    expect(getUsedLineIndexes([], "halfway")).toEqual([]);
  });
});

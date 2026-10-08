import { describe, expect, it } from "vitest";

import { getCardPoolIds } from "./getCardPoolIds";
import {
  axisPuzzleCard,
  doubleClosenessCard,
  halfwayCard,
  positionPuzzleCard,
  statsAgainstCard,
} from "./getNextCheckpoint.fixtures";

describe("getCardPoolIds()", () => {
  it("returns the one pool of a card that is not a puzzle", () => {
    expect(getCardPoolIds(halfwayCard)).toEqual(["halfway"]);
    expect(getCardPoolIds(doubleClosenessCard)).toEqual([
      "axis-closeness-double",
    ]);
    expect(getCardPoolIds(statsAgainstCard)).toEqual(["stats-against"]);
  });

  it("returns the ask, the hit and the miss pool of a puzzle", () => {
    expect(getCardPoolIds(axisPuzzleCard)).toEqual([
      "axis-puzzle-ask",
      "axis-puzzle-hit",
      "axis-puzzle-miss",
    ]);
    expect(getCardPoolIds(positionPuzzleCard)).toEqual([
      "position-puzzle-ask",
      "position-puzzle-hit",
      "position-puzzle-miss",
    ]);
  });
});

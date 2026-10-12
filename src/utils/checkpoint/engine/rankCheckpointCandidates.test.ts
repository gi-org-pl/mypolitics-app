import { describe, expect, it } from "vitest";

import type { CheckpointCard } from "@/types/checkpoint";

import {
  axisPuzzleCard,
  createRecord,
  doubleClosenessCard,
  fullPathCard,
  halfwayCard,
  newTraitCard,
  partialPathCard,
  positionPuzzleCard,
  singleClosenessCard,
  statsForCard,
} from "./getNextCheckpoint.fixtures";
import { rankCheckpointCandidates } from "./rankCheckpointCandidates";

const rank = (
  candidates: CheckpointCard[],
  shown: CheckpointCard[] = [],
): CheckpointCard[] =>
  rankCheckpointCandidates(candidates, createRecord(shown).cardsShown);

describe("rankCheckpointCandidates()", () => {
  it("puts any personal candidate before halfway", () => {
    expect(rank([halfwayCard, axisPuzzleCard])).toEqual([
      axisPuzzleCard,
      halfwayCard,
    ]);
    // Also a personal type that was shown before, against halfway that was
    // not.
    expect(
      rank([halfwayCard, axisPuzzleCard], [axisPuzzleCard, statsForCard]),
    ).toEqual([axisPuzzleCard, halfwayCard]);
  });

  it("puts a type not yet shown before a type shown", () => {
    expect(
      rank(
        [singleClosenessCard, axisPuzzleCard],
        [doubleClosenessCard, statsForCard],
      ),
    ).toEqual([axisPuzzleCard, singleClosenessCard]);
    expect(
      rank(
        [newTraitCard, positionPuzzleCard, axisPuzzleCard],
        [newTraitCard, positionPuzzleCard, statsForCard],
      ),
    ).toEqual([axisPuzzleCard, newTraitCard, positionPuzzleCard]);
  });

  it("orders by priority within the same newness", () => {
    const candidates = [
      halfwayCard,
      axisPuzzleCard,
      singleClosenessCard,
      partialPathCard,
      positionPuzzleCard,
      newTraitCard,
      statsForCard,
    ];
    const byPriority = [...candidates].reverse();

    expect(rank(candidates)).toEqual(byPriority);
    // Every personal type was shown before: the order is the priority again.
    expect(rank(candidates, [...byPriority.slice(0, 6), halfwayCard])).toEqual(
      byPriority.slice(0, 6),
    );
  });

  it("counts the full Nolan version as not yet shown after the partial one", () => {
    expect(
      rank(
        [fullPathCard, singleClosenessCard, axisPuzzleCard],
        [partialPathCard, singleClosenessCard, statsForCard],
      ),
    ).toEqual([fullPathCard, axisPuzzleCard, singleClosenessCard]);
  });

  it("counts a type with two variants as shown whichever variant it was", () => {
    expect(
      rank(
        [doubleClosenessCard, axisPuzzleCard],
        [singleClosenessCard, statsForCard],
      ),
    ).toEqual([axisPuzzleCard, doubleClosenessCard]);
  });

  it("skips a winner of the same type as the previous card and takes the next of another type", () => {
    expect(
      rank([singleClosenessCard, halfwayCard], [doubleClosenessCard]),
    ).toEqual([halfwayCard]);
    expect(
      rank(
        [statsForCard, positionPuzzleCard, axisPuzzleCard],
        [newTraitCard, statsForCard],
      ),
    ).toEqual([positionPuzzleCard, axisPuzzleCard]);
  });

  it("only looks at the card shown last, however long ago that was", () => {
    expect(
      rank([singleClosenessCard], [doubleClosenessCard, halfwayCard]),
    ).toEqual([singleClosenessCard]);
    expect(
      rank([singleClosenessCard], [{ ...doubleClosenessCard, boundary: 1 }]),
    ).toEqual([]);
  });

  it("skips the full Nolan version when the partial one was the previous card", () => {
    expect(rank([fullPathCard, axisPuzzleCard], [partialPathCard])).toEqual([
      axisPuzzleCard,
    ]);
    expect(rank([fullPathCard], [partialPathCard])).toEqual([]);
  });

  it("returns nothing when every candidate is of the previous card's type", () => {
    expect(rank([halfwayCard], [halfwayCard])).toEqual([]);
    expect(rank([], [halfwayCard])).toEqual([]);
    expect(rank([])).toEqual([]);
  });

  it("does not change the list it was given", () => {
    const candidates = [halfwayCard, axisPuzzleCard, statsForCard];
    const copy = [...candidates];

    rank(candidates);

    expect(candidates).toEqual(copy);
  });
});

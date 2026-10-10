import { describe, expect, it } from "vitest";

import type { SurveyCheckpointRecord } from "@/types/survey";

import {
  allCards,
  axisPuzzleCard,
  halfwayCard,
  newTraitCard,
  positionPuzzleCard,
} from "@/utils/checkpoint/engine/getNextCheckpoint.fixtures";
import { readCheckpointRecord } from "./readCheckpointRecord";

const timeSamples = [
  { questionId: "q1", seconds: 4.2 },
  { questionId: "q2", seconds: 61 },
];

// A record as it comes back from the storage of the tab: plain JSON.
const toStored = (cardsShown: unknown): SurveyCheckpointRecord =>
  JSON.parse(JSON.stringify({ cardsShown, timeSamples }));

describe("readCheckpointRecord()", () => {
  it("returns the cards of a record written by this code, in their order", () => {
    const cardsShown = allCards.map((card) => ({ card }));

    expect(readCheckpointRecord(toStored(cardsShown)).cardsShown).toEqual(
      cardsShown,
    );
  });

  it("keeps the time samples as they are", () => {
    const stored = toStored([{ card: halfwayCard }]);

    expect(readCheckpointRecord(stored).timeSamples).toBe(stored.timeSamples);
    expect(readCheckpointRecord(toStored([])).timeSamples).toEqual(timeSamples);
  });

  it("keeps the reveal lines of a puzzle", () => {
    const cardsShown = [
      {
        card: axisPuzzleCard,
        revealLines: { miss: { pool: "axis-puzzle-miss", index: 1 } },
      },
      {
        card: positionPuzzleCard,
        revealLines: { hit: { pool: "position-puzzle-hit", index: 0 } },
      },
    ];

    expect(readCheckpointRecord(toStored(cardsShown)).cardsShown).toEqual(
      cardsShown,
    );
  });

  it("drops an item with no card, an unknown type, no boundary, a line that does not exist or a card that is not usable", () => {
    expect(
      readCheckpointRecord(
        toStored([
          {},
          null,
          "card",
          { card: { ...halfwayCard, type: "confetti" } },
          { card: { ...halfwayCard, boundary: undefined } },
          { card: { ...halfwayCard, line: { pool: "halfway", index: 3 } } },
          { card: { ...halfwayCard, line: undefined } },
          { card: { ...halfwayCard, line: { pool: "new-trait", index: 0 } } },
          { card: { ...newTraitCard, trait: undefined } },
        ]),
      ).cardsShown,
    ).toEqual([]);
  });

  it("keeps the other items when one is dropped", () => {
    expect(
      readCheckpointRecord(
        toStored([
          { card: halfwayCard },
          { card: { ...newTraitCard, line: { pool: "new-trait", index: 12 } } },
          { card: axisPuzzleCard },
        ]),
      ).cardsShown,
    ).toEqual([{ card: halfwayCard }, { card: axisPuzzleCard }]);
  });

  it("reads cardsShown that is not a list as no cards shown", () => {
    for (const cardsShown of [
      undefined,
      null,
      "cards",
      3,
      { 0: halfwayCard },
    ]) {
      expect(
        readCheckpointRecord({
          cardsShown,
          timeSamples,
        } as unknown as SurveyCheckpointRecord),
      ).toEqual({ cardsShown: [], timeSamples });
    }
  });

  it("never throws", () => {
    for (const stored of [undefined, null, "record", 5, [], {}]) {
      expect(
        readCheckpointRecord(stored as unknown as SurveyCheckpointRecord),
      ).toEqual({ cardsShown: [], timeSamples: [] });
    }
  });
});

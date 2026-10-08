import { describe, expect, it } from "vitest";

import {
  allCards,
  axisPuzzleCard,
  halfwayCard,
} from "./getNextCheckpoint.fixtures";
import { readShownCard } from "./readShownCard";

describe("readShownCard()", () => {
  it("returns a shown card of every type as it was stored", () => {
    for (const card of allCards) {
      expect(readShownCard(JSON.parse(JSON.stringify({ card })))).toEqual({
        card,
      });
    }
  });

  it("keeps the reveal lines of a puzzle", () => {
    const shownCard = {
      card: axisPuzzleCard,
      revealLines: {
        hit: { pool: "axis-puzzle-hit", index: 2 },
        miss: { pool: "axis-puzzle-miss", index: 0 },
      },
    };

    expect(readShownCard(shownCard)).toEqual(shownCard);
  });

  it("leaves out a reveal line that does not exist and keeps the other", () => {
    expect(
      readShownCard({
        card: axisPuzzleCard,
        revealLines: {
          hit: { pool: "axis-puzzle-hit", index: 9 },
          miss: { pool: "axis-puzzle-miss", index: 1 },
          later: { pool: "axis-puzzle-miss", index: 2 },
        },
      }),
    ).toEqual({
      card: axisPuzzleCard,
      revealLines: { miss: { pool: "axis-puzzle-miss", index: 1 } },
    });
    expect(
      readShownCard({ card: axisPuzzleCard, revealLines: "none" }),
    ).toEqual({ card: axisPuzzleCard });
    expect(readShownCard({ card: axisPuzzleCard, revealLines: {} })).toEqual({
      card: axisPuzzleCard,
    });
  });

  it("returns nothing for an item with no card", () => {
    for (const item of [undefined, null, 7, "card", [], {}, { card: null }]) {
      expect(readShownCard(item)).toBeUndefined();
    }

    // A card that was stored bare, not as an item.
    expect(readShownCard(halfwayCard)).toBeUndefined();
  });

  it("returns nothing for an unknown type", () => {
    expect(
      readShownCard({ card: { ...halfwayCard, type: "confetti" } }),
    ).toBeUndefined();
    expect(
      readShownCard({ card: { ...halfwayCard, type: undefined } }),
    ).toBeUndefined();
  });

  it("returns nothing without a whole-number boundary", () => {
    for (const boundary of [undefined, null, "20", 20.5, Number.NaN]) {
      expect(
        readShownCard({ card: { ...halfwayCard, boundary } }),
      ).toBeUndefined();
    }
  });

  it("returns nothing for a line that does not exist", () => {
    for (const line of [
      undefined,
      null,
      { pool: "halfway", index: 3 },
      { pool: "confetti", index: 0 },
      { pool: "halfway" },
    ]) {
      expect(readShownCard({ card: { ...halfwayCard, line } })).toBeUndefined();
    }
  });
});

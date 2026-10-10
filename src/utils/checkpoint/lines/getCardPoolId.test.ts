import { describe, expect, it } from "vitest";
import { allCards } from "@/utils/checkpoint/engine/getNextCheckpoint.fixtures";
import { getCardPoolId } from "./getCardPoolId";

describe("getCardPoolId()", () => {
  it("returns the pool of the card and its state", () => {
    expect(allCards.map(getCardPoolId)).toEqual([
      "stats-for",
      "stats-against",
      "new-trait",
      "position-puzzle-ask",
      "nolan-path-partial",
      "nolan-path-full",
      "axis-closeness-single",
      "axis-closeness-double",
      "axis-puzzle-ask",
      "halfway",
    ]);
  });

  it("is the pool the line of every card of the fixtures was drawn from", () => {
    for (const card of allCards) {
      expect(getCardPoolId(card)).toBe(card.line.pool);
    }
  });
});

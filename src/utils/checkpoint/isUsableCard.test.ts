import { describe, expect, it } from "vitest";

import type { CheckpointCard } from "@/types/checkpoint";
import { createOrientation } from "@/utils/vitest/createOrientation";

import {
  allCards,
  axisPuzzleCard,
  doubleClosenessCard,
  halfwayCard,
  newTraitCard,
  partialPathCard,
  positionPuzzleCard,
  singleClosenessCard,
  statsAgainstCard,
  statsForCard,
} from "./getNextCheckpoint.fixtures";
import { isUsableCard } from "./isUsableCard";

// A card as storage could hand it back: one of the fixtures with some of its
// fields replaced or gone.
const damage = (card: CheckpointCard, fields: Record<string, unknown>) =>
  ({ ...card, ...fields }) as unknown as CheckpointCard;

const nameless = createOrientation("nameless");

describe("isUsableCard()", () => {
  it("accepts a card of every type and variant, also after it was stored", () => {
    for (const card of allCards) {
      expect(isUsableCard(card)).toBe(true);
      expect(isUsableCard(JSON.parse(JSON.stringify(card)))).toBe(true);
    }
  });

  it("refuses a card that has not the shape of its variant", () => {
    expect(isUsableCard(damage(positionPuzzleCard, { options: [] }))).toBe(
      false,
    );
    expect(isUsableCard(damage(partialPathCard, { trail: undefined }))).toBe(
      false,
    );
    expect(isUsableCard(damage(axisPuzzleCard, { axisId: undefined }))).toBe(
      false,
    );
    expect(isUsableCard(damage(statsForCard, { counts: undefined }))).toBe(
      false,
    );
    expect(isUsableCard(damage(halfwayCard, { percent: undefined }))).toBe(
      false,
    );
  });

  it("refuses a card whose line comes from another pool", () => {
    expect(
      isUsableCard(
        damage(halfwayCard, { line: { pool: "new-trait", index: 0 } }),
      ),
    ).toBe(false);
    // The line of the other variant, of the other side, and of a reveal.
    expect(
      isUsableCard(
        damage(singleClosenessCard, {
          line: { pool: "axis-closeness-double", index: 0 },
        }),
      ),
    ).toBe(false);
    expect(
      isUsableCard(
        damage(partialPathCard, {
          line: { pool: "nolan-path-full", index: 0 },
        }),
      ),
    ).toBe(false);
    expect(
      isUsableCard(damage(statsForCard, { line: statsAgainstCard.line })),
    ).toBe(false);
    expect(
      isUsableCard(
        damage(axisPuzzleCard, { line: { pool: "axis-puzzle-hit", index: 0 } }),
      ),
    ).toBe(false);
  });

  it("refuses a card whose words cannot be finished", () => {
    expect(isUsableCard(damage(newTraitCard, { trait: nameless }))).toBe(false);
    expect(isUsableCard(damage(statsForCard, { thesis: " . " }))).toBe(false);
    expect(
      isUsableCard(
        damage(singleClosenessCard, {
          entry: { orientation: nameless, value: 83 },
        }),
      ),
    ).toBe(false);
    expect(
      isUsableCard(
        damage(doubleClosenessCard, {
          start: { orientation: nameless, value: 20 },
        }),
      ),
    ).toBe(false);
  });

  it("refuses a puzzle that could not finish its reveal", () => {
    // Neither ask line has a slot: only the reveal needs the names.
    expect(
      isUsableCard(
        damage(positionPuzzleCard, {
          leader: createOrientation(positionPuzzleCard.leader.id),
        }),
      ),
    ).toBe(false);
    expect(
      isUsableCard(
        damage(axisPuzzleCard, {
          start: { orientation: nameless, value: 70 },
        }),
      ),
    ).toBe(false);
  });

  it("refuses what is no card at all, without throwing", () => {
    for (const value of [null, undefined, "card", 7, [], {}]) {
      expect(isUsableCard(value as unknown as CheckpointCard)).toBe(false);
    }

    expect(isUsableCard(damage(halfwayCard, { type: "confetti" }))).toBe(false);
    expect(isUsableCard(damage(halfwayCard, { line: undefined }))).toBe(false);
  });
});

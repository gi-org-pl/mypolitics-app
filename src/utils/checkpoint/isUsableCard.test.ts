import { describe, expect, it } from "vitest";

import type { CheckpointCard } from "@/types/checkpoint";
import { createOrientation } from "@/utils/vitest/createOrientation";

import {
  allCards,
  axisPuzzleCard,
  doubleClosenessCard,
  fullPathCard,
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

const withoutId = { type: "ideology", name: "Bez identyfikatora" };

describe("isUsableCard()", () => {
  it("accepts a card of every type and variant, also after it was stored", () => {
    for (const card of allCards) {
      expect(isUsableCard(card)).toBe(true);
      expect(isUsableCard(JSON.parse(JSON.stringify(card)))).toBe(true);
    }
  });

  it("refuses a card whose line comes from another pool", () => {
    expect(
      isUsableCard(
        damage(halfwayCard, { line: { pool: "new-trait", index: 0 } }),
      ),
    ).toBe(false);
    // The line of the other variant, the other side and a reveal.
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
    const nameless = createOrientation("nameless");

    expect(isUsableCard(damage(halfwayCard, { minutes: 0 }))).toBe(false);
    expect(isUsableCard(damage(halfwayCard, { minutes: undefined }))).toBe(
      false,
    );
    expect(isUsableCard(damage(newTraitCard, { trait: nameless }))).toBe(false);
    expect(isUsableCard(damage(newTraitCard, { trait: undefined }))).toBe(
      false,
    );
    expect(isUsableCard(damage(statsForCard, { percent: 40 }))).toBe(false);
    expect(isUsableCard(damage(statsForCard, { thesis: undefined }))).toBe(
      false,
    );
    expect(isUsableCard(damage(partialPathCard, { count: 4 }))).toBe(false);
    expect(
      isUsableCard(damage(singleClosenessCard, { entry: undefined })),
    ).toBe(false);
    expect(
      isUsableCard(damage(doubleClosenessCard, { leadingSide: undefined })),
    ).toBe(false);
    // A puzzle that could not say what the taker hit.
    expect(isUsableCard(damage(positionPuzzleCard, { leader: nameless }))).toBe(
      false,
    );
    expect(
      isUsableCard(
        damage(axisPuzzleCard, { start: { orientation: nameless } }),
      ),
    ).toBe(false);
  });

  it("refuses a stats card without its question or with a count that is not one", () => {
    expect(isUsableCard(damage(statsForCard, { questionId: undefined }))).toBe(
      false,
    );
    expect(isUsableCard(damage(statsForCard, { counts: undefined }))).toBe(
      false,
    );
    expect(
      isUsableCard(damage(statsForCard, { counts: { for: 80, against: 900 } })),
    ).toBe(false);
    expect(
      isUsableCard(
        damage(statsForCard, {
          counts: { for: 80, against: -1, noAnswer: 20 },
        }),
      ),
    ).toBe(false);
  });

  it("refuses a new trait card whose trait has no identifier", () => {
    expect(isUsableCard(damage(newTraitCard, { trait: withoutId }))).toBe(
      false,
    );
  });

  it("refuses a position puzzle without its closeness or its options", () => {
    expect(
      isUsableCard(damage(positionPuzzleCard, { closeness: undefined })),
    ).toBe(false);
    expect(
      isUsableCard(damage(positionPuzzleCard, { options: undefined })),
    ).toBe(false);
    expect(
      isUsableCard(
        damage(positionPuzzleCard, {
          options: [positionPuzzleCard.leader, withoutId, null],
        }),
      ),
    ).toBe(false);
    expect(
      isUsableCard(
        damage(positionPuzzleCard, {
          leader: { ...withoutId, name: "Postać 1" },
        }),
      ),
    ).toBe(false);
  });

  it("refuses a Nolan path card without a trail of positions", () => {
    expect(isUsableCard(damage(partialPathCard, { trail: undefined }))).toBe(
      false,
    );
    expect(isUsableCard(damage(fullPathCard, { trail: "trail" }))).toBe(false);
    expect(
      isUsableCard(
        damage(fullPathCard, { trail: [{ x: 0.5, y: "0.5", done: 3 }] }),
      ),
    ).toBe(false);
    expect(isUsableCard(damage(fullPathCard, { trail: [null] }))).toBe(false);
    expect(isUsableCard(damage(fullPathCard, { trail: [] }))).toBe(true);
  });

  it("refuses an axis card without its axis or without an orientation on a side", () => {
    expect(
      isUsableCard(damage(singleClosenessCard, { axisId: undefined })),
    ).toBe(false);
    expect(
      isUsableCard(
        damage(singleClosenessCard, {
          entry: { orientation: { ...withoutId, name: "Decentralizacja" } },
        }),
      ),
    ).toBe(false);
    expect(isUsableCard(damage(doubleClosenessCard, { axisId: 7 }))).toBe(
      false,
    );
    expect(
      isUsableCard(
        damage(doubleClosenessCard, {
          start: { orientation: { ...withoutId, name: "Federalizm" } },
        }),
      ),
    ).toBe(false);
    expect(isUsableCard(damage(axisPuzzleCard, { axisId: undefined }))).toBe(
      false,
    );
    // The pole that does not lead is in no line, and still has to be there.
    expect(isUsableCard(damage(axisPuzzleCard, { end: undefined }))).toBe(
      false,
    );
    expect(
      isUsableCard(
        damage(axisPuzzleCard, { end: { orientation: withoutId, value: 30 } }),
      ),
    ).toBe(false);
  });

  it("refuses a halfway card without its percent", () => {
    expect(isUsableCard(damage(halfwayCard, { percent: undefined }))).toBe(
      false,
    );
    expect(isUsableCard(damage(halfwayCard, { percent: "50" }))).toBe(false);
  });

  it("refuses what is no card at all, without throwing", () => {
    for (const value of [null, undefined, "card", 7, [], {}]) {
      expect(isUsableCard(value as unknown as CheckpointCard)).toBe(false);
    }

    expect(isUsableCard(damage(halfwayCard, { type: "confetti" }))).toBe(false);
    expect(isUsableCard(damage(halfwayCard, { line: undefined }))).toBe(false);
  });
});

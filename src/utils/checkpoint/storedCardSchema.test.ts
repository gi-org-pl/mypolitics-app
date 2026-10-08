import { describe, expect, it } from "vitest";

import type { CheckpointCard } from "@/types/checkpoint";

import {
  allCards,
  axisPuzzleCard,
  createArchetypes,
  doubleClosenessCard,
  fullPathCard,
  halfwayCard,
  newTraitCard,
  partialPathCard,
  positionPuzzleCard,
  singleClosenessCard,
  statsForCard,
} from "./getNextCheckpoint.fixtures";
import { storedCardSchema } from "./storedCardSchema";

const isStoredCard = (value: unknown): boolean =>
  storedCardSchema.safeParse(value).success;

// Whether the card still passes with some of its fields replaced or gone.
const passesWith = (
  card: CheckpointCard,
  fields: Record<string, unknown>,
): boolean => isStoredCard({ ...card, ...fields });

const withoutId = { type: "identity", name: "Bez identyfikatora" };
const [first, second, third, fourth] = createArchetypes([72, 60, 41, 30]).map(
  ({ orientation }) => orientation,
);

describe("storedCardSchema", () => {
  it("accepts a card of every type and variant, also after it was stored", () => {
    for (const card of allCards) {
      expect(isStoredCard(card)).toBe(true);
      expect(isStoredCard(JSON.parse(JSON.stringify(card)))).toBe(true);
    }
  });

  it("accepts a card with a field it does not know", () => {
    expect(passesWith(halfwayCard, { later: "field" })).toBe(true);
  });

  it("refuses what is no card of a known type with a boundary and a line", () => {
    for (const value of [null, undefined, "card", 7, [], {}]) {
      expect(isStoredCard(value)).toBe(false);
    }

    expect(passesWith(halfwayCard, { type: "confetti" })).toBe(false);
    expect(passesWith(halfwayCard, { boundary: undefined })).toBe(false);
    expect(passesWith(halfwayCard, { boundary: 20.5 })).toBe(false);
    expect(passesWith(halfwayCard, { line: undefined })).toBe(false);
    expect(passesWith(halfwayCard, { line: { pool: "halfway" } })).toBe(false);
  });

  it("refuses a stats card without its question, its side, its counts or its percent", () => {
    expect(passesWith(statsForCard, { questionId: undefined })).toBe(false);
    expect(passesWith(statsForCard, { thesis: undefined })).toBe(false);
    expect(passesWith(statsForCard, { side: "neither" })).toBe(false);
    expect(passesWith(statsForCard, { counts: undefined })).toBe(false);
    expect(
      passesWith(statsForCard, { counts: { for: 80, against: 900 } }),
    ).toBe(false);
    expect(
      passesWith(statsForCard, {
        counts: { for: 80, against: -1, noAnswer: 20 },
      }),
    ).toBe(false);
    expect(passesWith(statsForCard, { percent: 0 })).toBe(false);
    expect(passesWith(statsForCard, { percent: 11 })).toBe(false);
    expect(passesWith(statsForCard, { percent: 10 })).toBe(true);
  });

  it("refuses a new trait card whose trait has no identifier", () => {
    expect(passesWith(newTraitCard, { trait: undefined })).toBe(false);
    expect(passesWith(newTraitCard, { trait: withoutId })).toBe(false);
  });

  it("refuses a position puzzle that has not three different rows with the leader among them", () => {
    const { leader } = positionPuzzleCard;

    expect(leader).toEqual(first);
    expect(passesWith(positionPuzzleCard, { options: undefined })).toBe(false);
    expect(passesWith(positionPuzzleCard, { options: [] })).toBe(false);
    expect(passesWith(positionPuzzleCard, { options: [first, second] })).toBe(
      false,
    );
    expect(
      passesWith(positionPuzzleCard, {
        options: [first, second, third, fourth],
      }),
    ).toBe(false);
    // The same row twice, a row that is no orientation, and no leader.
    expect(
      passesWith(positionPuzzleCard, { options: [first, second, second] }),
    ).toBe(false);
    expect(
      passesWith(positionPuzzleCard, { options: [first, second, withoutId] }),
    ).toBe(false);
    expect(
      passesWith(positionPuzzleCard, { options: [second, third, fourth] }),
    ).toBe(false);
    expect(
      passesWith(positionPuzzleCard, { options: [third, second, first] }),
    ).toBe(true);
  });

  it("refuses a position puzzle without a leader or with a closeness under 50", () => {
    expect(passesWith(positionPuzzleCard, { leader: withoutId })).toBe(false);
    expect(passesWith(positionPuzzleCard, { closeness: undefined })).toBe(
      false,
    );
    expect(passesWith(positionPuzzleCard, { closeness: 49.9 })).toBe(false);
    expect(passesWith(positionPuzzleCard, { closeness: 50 })).toBe(true);
  });

  it("refuses a position puzzle with a closeness above 100", () => {
    expect(passesWith(positionPuzzleCard, { closeness: 100 })).toBe(true);
    expect(passesWith(positionPuzzleCard, { closeness: 100.5 })).toBe(false);
  });

  it("refuses a Nolan path card without a trail of positions to stand on", () => {
    expect(passesWith(partialPathCard, { trail: undefined })).toBe(false);
    expect(passesWith(partialPathCard, { trail: "trail" })).toBe(false);
    expect(passesWith(partialPathCard, { trail: [] })).toBe(false);
    expect(passesWith(fullPathCard, { trail: [null] })).toBe(false);
    expect(
      passesWith(fullPathCard, {
        trail: [{ ...fullPathCard.trail[0], y: "0.5" }],
      }),
    ).toBe(false);
    expect(
      passesWith(fullPathCard, { trail: fullPathCard.trail.slice(0, 1) }),
    ).toBe(true);
  });

  it("refuses a Nolan path card with a position that is not one of the compass", () => {
    const [point] = fullPathCard.trail;
    const passesWithPoint = (fields: Record<string, unknown>): boolean =>
      passesWith(fullPathCard, { trail: [{ ...point, ...fields }] });

    expect(passesWithPoint({})).toBe(true);
    expect(passesWithPoint({ x: -1, y: 1 })).toBe(true);
    expect(passesWithPoint({ x: 1.2 })).toBe(false);
    expect(passesWithPoint({ y: -1.01 })).toBe(false);
    expect(passesWithPoint({ level: "far" })).toBe(false);
    expect(passesWithPoint({ level: undefined })).toBe(false);
    expect(passesWithPoint({ quadrant: "middle" })).toBe(false);
    expect(passesWithPoint({ done: 2.5 })).toBe(false);
    expect(passesWithPoint({ done: -1 })).toBe(false);

    for (const level of ["centre", "moderate", "extreme"]) {
      expect(passesWithPoint({ level })).toBe(true);
    }

    for (const quadrant of [
      "topLeft",
      "topRight",
      "bottomLeft",
      "bottomRight",
    ]) {
      expect(passesWithPoint({ quadrant })).toBe(true);
    }
  });

  it("refuses a Nolan path card whose count does not fit its version", () => {
    expect(passesWith(partialPathCard, { count: 3 })).toBe(true);
    expect(passesWith(partialPathCard, { count: 4 })).toBe(false);
    expect(passesWith(partialPathCard, { count: 1 })).toBe(false);
    expect(passesWith(fullPathCard, { count: 3 })).toBe(false);
    expect(passesWith(fullPathCard, { variant: "whole" })).toBe(false);
  });

  it("lets only the full Nolan path be a second path", () => {
    expect(passesWith(fullPathCard, { isSecondPath: true })).toBe(true);
    expect(passesWith(partialPathCard, { isSecondPath: true })).toBe(false);
    expect(passesWith(fullPathCard, { isSecondPath: undefined })).toBe(false);
  });

  it("refuses an axis card without its axis, a side or the side that leads", () => {
    expect(passesWith(singleClosenessCard, { axisId: undefined })).toBe(false);
    expect(passesWith(singleClosenessCard, { entry: undefined })).toBe(false);
    expect(passesWith(singleClosenessCard, { variant: "triple" })).toBe(false);
    expect(
      passesWith(singleClosenessCard, {
        entry: { orientation: withoutId, value: 83 },
      }),
    ).toBe(false);
    expect(
      passesWith(singleClosenessCard, {
        entry: { orientation: singleClosenessCard.entry.orientation },
      }),
    ).toBe(false);
    expect(passesWith(doubleClosenessCard, { axisId: 7 })).toBe(false);
    expect(passesWith(doubleClosenessCard, { start: undefined })).toBe(false);
    expect(passesWith(doubleClosenessCard, { leadingSide: "middle" })).toBe(
      false,
    );
    expect(passesWith(axisPuzzleCard, { end: undefined })).toBe(false);
    expect(passesWith(axisPuzzleCard, { leadingSide: undefined })).toBe(false);
    expect(
      passesWith(axisPuzzleCard, {
        end: { orientation: withoutId, value: 30 },
      }),
    ).toBe(false);
  });

  it("refuses an axis card with a value that is not one, or led by the lower side", () => {
    const { orientation } = singleClosenessCard.entry;
    const { start, end } = doubleClosenessCard;

    expect(
      passesWith(singleClosenessCard, { entry: { orientation, value: 100 } }),
    ).toBe(true);
    expect(
      passesWith(singleClosenessCard, { entry: { orientation, value: 100.5 } }),
    ).toBe(false);
    expect(
      passesWith(singleClosenessCard, { entry: { orientation, value: -1 } }),
    ).toBe(false);
    expect(
      passesWith(doubleClosenessCard, { end: { ...end, value: 140 } }),
    ).toBe(false);
    // The start is at 20 and the end at 60: the end leads.
    expect(passesWith(doubleClosenessCard, { leadingSide: "end" })).toBe(true);
    expect(passesWith(doubleClosenessCard, { leadingSide: "start" })).toBe(
      false,
    );
    expect(
      passesWith(doubleClosenessCard, { start: { ...start, value: 60 } }),
    ).toBe(false);
    expect(passesWith(axisPuzzleCard, { leadingSide: "end" })).toBe(false);
    expect(
      passesWith(axisPuzzleCard, {
        leadingSide: "end",
        start: axisPuzzleCard.end,
        end: axisPuzzleCard.start,
      }),
    ).toBe(true);
  });

  it("refuses a card with a boundary or a place in its pool below zero", () => {
    expect(passesWith(halfwayCard, { boundary: -1 })).toBe(false);
    expect(
      passesWith(halfwayCard, { line: { pool: "halfway", index: -1 } }),
    ).toBe(false);
  });

  it("refuses a halfway card whose percent or minutes are out of range", () => {
    expect(passesWith(halfwayCard, { percent: undefined })).toBe(false);
    expect(passesWith(halfwayCard, { percent: 49 })).toBe(false);
    expect(passesWith(halfwayCard, { percent: 101 })).toBe(false);
    expect(passesWith(halfwayCard, { percent: 55.5 })).toBe(false);
    expect(passesWith(halfwayCard, { percent: 100 })).toBe(true);
    expect(passesWith(halfwayCard, { minutes: 0 })).toBe(false);
    expect(passesWith(halfwayCard, { minutes: 100 })).toBe(false);
    expect(passesWith(halfwayCard, { minutes: 99 })).toBe(true);
  });
});

import { describe, expect, it } from "vitest";

import { CHECKPOINT_POOLS } from "@/constants/checkpoint";
import type { CheckpointCard, CheckpointPoolId } from "@/types/checkpoint";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { getCardPoolIds } from "./getCardPoolIds";
import { getCheckpointSlots } from "./getCheckpointSlots";
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

const POOL_IDS = Object.keys(CHECKPOINT_POOLS) as CheckpointPoolId[];

describe("getCheckpointSlots()", () => {
  it("returns the minutes for the halfway pool", () => {
    expect(getCheckpointSlots(halfwayCard, "halfway")).toEqual({ minutes: 7 });
  });

  it("returns the orientation name for the single axis pool", () => {
    expect(
      getCheckpointSlots(singleClosenessCard, "axis-closeness-single"),
    ).toEqual({ orientation: "Decentralizacja" });
  });

  it("returns the leading and the other name for the double axis pool", () => {
    expect(
      getCheckpointSlots(doubleClosenessCard, "axis-closeness-double"),
    ).toEqual({ leading: "Eurosceptycyzm", other: "Federalizm" });
    expect(
      getCheckpointSlots(
        { ...doubleClosenessCard, leadingSide: "start" },
        "axis-closeness-double",
      ),
    ).toEqual({ leading: "Federalizm", other: "Eurosceptycyzm" });
  });

  it("returns the trait name, the count, the percent and the thesis for their pools", () => {
    expect(getCheckpointSlots(newTraitCard, "new-trait")).toEqual({
      trait: "Monarchizm",
    });
    expect(getCheckpointSlots(partialPathCard, "nolan-path-partial")).toEqual({
      count: 2,
    });
    expect(getCheckpointSlots(statsForCard, "stats-for")).toEqual({
      percent: 8,
      thesis: "Podatki powinny być niższe",
    });
    expect(getCheckpointSlots(statsAgainstCard, "stats-against")).toEqual({
      percent: 8,
      thesis: "Podatki powinny być niższe",
    });
  });

  it("returns the leading pole for the axis puzzle hit and miss pools", () => {
    expect(getCheckpointSlots(axisPuzzleCard, "axis-puzzle-hit")).toEqual({
      leading: "Wolny rynek",
    });
    expect(
      getCheckpointSlots(
        { ...axisPuzzleCard, leadingSide: "end" },
        "axis-puzzle-miss",
      ),
    ).toEqual({ leading: "Interwencjonizm" });
  });

  it("returns the leader's name for the position puzzle hit pool", () => {
    expect(
      getCheckpointSlots(positionPuzzleCard, "position-puzzle-hit"),
    ).toEqual({ position: "Postać 1" });
  });

  it("returns no slots for the pools that have none", () => {
    expect(getCheckpointSlots(fullPathCard, "nolan-path-full")).toEqual({});
    expect(getCheckpointSlots(axisPuzzleCard, "axis-puzzle-ask")).toEqual({});
    expect(
      getCheckpointSlots(positionPuzzleCard, "position-puzzle-ask"),
    ).toEqual({});
    expect(
      getCheckpointSlots(positionPuzzleCard, "position-puzzle-miss"),
    ).toEqual({});
  });

  it("trims a name and keeps its case", () => {
    expect(
      getCheckpointSlots(
        {
          ...newTraitCard,
          trait: createOrientation("trait", "  państwo MINIMUM  "),
        },
        "new-trait",
      ),
    ).toEqual({ trait: "państwo MINIMUM" });
  });

  it("places a name that has quotation marks, braces or markup in it as it is", () => {
    const name = "„Trzecia” {droga} <b>RP</b>";

    expect(
      getCheckpointSlots(
        { ...newTraitCard, trait: createOrientation("trait", name) },
        "new-trait",
      ),
    ).toEqual({ trait: name });
  });

  it("removes one closing full stop from a thesis", () => {
    expect(
      getCheckpointSlots(
        { ...statsForCard, thesis: "Wielka Polska w silnej Europie." },
        "stats-for",
      )?.thesis,
    ).toBe("Wielka Polska w silnej Europie");
  });

  it("keeps a closing question mark, an exclamation mark and a full stop in the middle", () => {
    for (const thesis of [
      "Czy Polska powinna przyjąć euro?",
      "Precz z podatkami!",
      "Art. 5 powinien zostać",
    ]) {
      expect(
        getCheckpointSlots({ ...statsForCard, thesis }, "stats-for")?.thesis,
      ).toBe(thesis);
    }
  });

  it("returns nothing for a missing or empty name", () => {
    const nameless = createOrientation("nameless");
    const blank = createOrientation("blank", "  ");

    expect(
      getCheckpointSlots({ ...newTraitCard, trait: nameless }, "new-trait"),
    ).toBeUndefined();
    expect(
      getCheckpointSlots(
        {
          ...singleClosenessCard,
          entry: { orientation: blank, value: 80 },
        },
        "axis-closeness-single",
      ),
    ).toBeUndefined();
    expect(
      getCheckpointSlots(
        { ...doubleClosenessCard, start: { orientation: nameless } },
        "axis-closeness-double",
      ),
    ).toBeUndefined();
    expect(
      getCheckpointSlots(
        { ...doubleClosenessCard, end: { orientation: blank } },
        "axis-closeness-double",
      ),
    ).toBeUndefined();
    expect(
      getCheckpointSlots(
        { ...axisPuzzleCard, start: { orientation: nameless } },
        "axis-puzzle-hit",
      ),
    ).toBeUndefined();
    expect(
      getCheckpointSlots(
        { ...positionPuzzleCard, leader: blank },
        "position-puzzle-hit",
      ),
    ).toBeUndefined();
  });

  it("does not need the name of a pole the pool does not print", () => {
    const card = {
      ...axisPuzzleCard,
      end: { orientation: createOrientation("nameless") },
    };

    expect(getCheckpointSlots(card, "axis-puzzle-hit")).toEqual({
      leading: "Wolny rynek",
    });
    expect(getCheckpointSlots(card, "axis-puzzle-ask")).toEqual({});
  });

  it("returns nothing for minutes below 1, a count outside 2 and 3, a percent outside 1 to 10", () => {
    for (const minutes of [0, -2, 2.5]) {
      expect(
        getCheckpointSlots({ ...halfwayCard, minutes }, "halfway"),
      ).toBeUndefined();
    }

    for (const count of [1, 4, 5]) {
      expect(
        getCheckpointSlots(
          { ...partialPathCard, count: count as 2 },
          "nolan-path-partial",
        ),
      ).toBeUndefined();
    }

    for (const percent of [0, 11, 3.2]) {
      expect(
        getCheckpointSlots({ ...statsForCard, percent }, "stats-for"),
      ).toBeUndefined();
    }
  });

  it("takes the numbers at both ends of their range", () => {
    expect(
      getCheckpointSlots({ ...halfwayCard, minutes: 1 }, "halfway"),
    ).toEqual({ minutes: 1 });
    expect(
      getCheckpointSlots({ ...halfwayCard, minutes: 99 }, "halfway"),
    ).toEqual({ minutes: 99 });
    expect(
      getCheckpointSlots(
        { ...partialPathCard, count: 3 },
        "nolan-path-partial",
      ),
    ).toEqual({ count: 3 });
    expect(
      getCheckpointSlots({ ...statsForCard, percent: 1 }, "stats-for")?.percent,
    ).toBe(1);
    expect(
      getCheckpointSlots({ ...statsForCard, percent: 10 }, "stats-for")
        ?.percent,
    ).toBe(10);
  });

  it("returns nothing for an empty thesis", () => {
    for (const thesis of ["", "  ", "."]) {
      expect(
        getCheckpointSlots({ ...statsForCard, thesis }, "stats-for"),
      ).toBeUndefined();
    }
  });

  it("returns nothing for a pool that does not belong to the card", () => {
    for (const card of allCards) {
      const ownPools = getCardPoolIds(card);

      for (const pool of POOL_IDS) {
        expect(getCheckpointSlots(card, pool) !== undefined).toBe(
          ownPools.includes(pool),
        );
      }
    }

    expect(
      getCheckpointSlots(halfwayCard, "unknown" as CheckpointPoolId),
    ).toBeUndefined();
  });

  it("returns nothing for a card that cannot be read", () => {
    expect(
      getCheckpointSlots(
        {
          ...singleClosenessCard,
          entry: undefined,
        } as unknown as CheckpointCard,
        "axis-closeness-single",
      ),
    ).toBeUndefined();
    expect(
      getCheckpointSlots(
        { ...halfwayCard, type: "unknown" } as unknown as CheckpointCard,
        "halfway",
      ),
    ).toBeUndefined();
    expect(
      getCheckpointSlots(null as unknown as CheckpointCard, "halfway"),
    ).toBeUndefined();
  });
});

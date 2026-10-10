import { describe, expect, it } from "vitest";
import {
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
} from "@/utils/checkpoint/engine/getNextCheckpoint.fixtures";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { readSlotValues } from "./readSlotValues";

const nameless = createOrientation("nameless");

describe("readSlotValues()", () => {
  it("reads the slots of the pool of a card that has one pool", () => {
    expect(readSlotValues(halfwayCard, "halfway")).toEqual({ minutes: 7 });
    expect(
      readSlotValues(singleClosenessCard, "axis-closeness-single"),
    ).toEqual({ orientation: "Decentralizacja" });
    expect(
      readSlotValues(doubleClosenessCard, "axis-closeness-double"),
    ).toEqual({ leading: "Eurosceptycyzm", other: "Federalizm" });
    expect(readSlotValues(newTraitCard, "new-trait")).toEqual({
      trait: "Monarchizm",
    });
    expect(readSlotValues(partialPathCard, "nolan-path-partial")).toEqual({
      count: 2,
    });
    expect(readSlotValues(fullPathCard, "nolan-path-full")).toEqual({});
    expect(readSlotValues(statsForCard, "stats-for")).toEqual({
      percent: 8,
      thesis: "Podatki powinny być niższe",
    });
    expect(readSlotValues(statsAgainstCard, "stats-against")).toEqual({
      percent: 8,
      thesis: "Podatki powinny być niższe",
    });
  });

  it("names the side that leads first, whichever side of the axis it is", () => {
    expect(
      readSlotValues(
        { ...doubleClosenessCard, leadingSide: "start" },
        "axis-closeness-double",
      ),
    ).toEqual({ leading: "Federalizm", other: "Eurosceptycyzm" });
  });

  it("reads the slots of each pool of a puzzle", () => {
    expect(readSlotValues(axisPuzzleCard, "axis-puzzle-ask")).toEqual({});
    expect(readSlotValues(axisPuzzleCard, "axis-puzzle-hit")).toEqual({
      leading: "Wolny rynek",
    });
    expect(
      readSlotValues(
        { ...axisPuzzleCard, leadingSide: "end" },
        "axis-puzzle-miss",
      ),
    ).toEqual({ leading: "Interwencjonizm" });
    expect(readSlotValues(positionPuzzleCard, "position-puzzle-ask")).toEqual(
      {},
    );
    expect(readSlotValues(positionPuzzleCard, "position-puzzle-hit")).toEqual({
      position: "Postać 1",
    });
    expect(readSlotValues(positionPuzzleCard, "position-puzzle-miss")).toEqual(
      {},
    );
  });

  it("leaves a value the line may not print undefined", () => {
    expect(readSlotValues({ ...halfwayCard, minutes: 0 }, "halfway")).toEqual({
      minutes: undefined,
    });
    expect(
      readSlotValues({ ...newTraitCard, trait: nameless }, "new-trait"),
    ).toEqual({ trait: undefined });
    expect(
      readSlotValues(
        { ...doubleClosenessCard, start: { orientation: nameless } },
        "axis-closeness-double",
      ),
    ).toEqual({ leading: "Eurosceptycyzm", other: undefined });
    expect(
      readSlotValues({ ...partialPathCard, count: 4 }, "nolan-path-partial"),
    ).toEqual({ count: undefined });
    expect(
      readSlotValues(
        { ...statsForCard, percent: 11, thesis: "." },
        "stats-for",
      ),
    ).toEqual({ percent: undefined, thesis: undefined });
    expect(
      readSlotValues(
        { ...positionPuzzleCard, leader: nameless },
        "position-puzzle-hit",
      ),
    ).toEqual({ position: undefined });
  });
});

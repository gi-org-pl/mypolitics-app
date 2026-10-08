import { describe, expect, it } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";

import { getAxisOrientationKey } from "./getAxisOrientationKey";
import {
  axisPuzzleCard,
  createSingleAxis,
  createTwoSidedAxis,
  doubleClosenessCard,
  singleClosenessCard,
} from "./getNextCheckpoint.fixtures";

const toEntry = (id: string) => ({ orientation: createOrientation(id, id) });

describe("getAxisOrientationKey()", () => {
  it("gives two axes with the same orientations the same key", () => {
    expect(getAxisOrientationKey(createTwoSidedAxis("a", 10, 60))).toBe(
      getAxisOrientationKey(createTwoSidedAxis("a", 80, 5)),
    );
    expect(
      getAxisOrientationKey({ start: toEntry("left"), end: toEntry("right") }),
    ).toBe(
      getAxisOrientationKey({ start: toEntry("right"), end: toEntry("left") }),
    );
  });

  it("gives axes with other orientations other keys", () => {
    const keys = [
      getAxisOrientationKey(createTwoSidedAxis("a")),
      getAxisOrientationKey(createTwoSidedAxis("b")),
      getAxisOrientationKey(createSingleAxis("a")),
      getAxisOrientationKey({ entry: toEntry("a-start") }),
      getAxisOrientationKey({
        start: toEntry("a-start"),
        end: toEntry("b-end"),
      }),
      getAxisOrientationKey({ start: toEntry("a"), end: toEntry("b,c") }),
      getAxisOrientationKey({ start: toEntry("a,b"), end: toEntry("c") }),
    ];

    expect(new Set(keys).size).toBe(keys.length);
  });

  it("gives an axis card the key of the axis it was about", () => {
    const { start, end } = doubleClosenessCard;

    expect(getAxisOrientationKey(doubleClosenessCard)).toBe(
      getAxisOrientationKey({ start, end }),
    );
    expect(getAxisOrientationKey(singleClosenessCard)).toBe(
      getAxisOrientationKey({ entry: singleClosenessCard.entry }),
    );
    expect(getAxisOrientationKey(axisPuzzleCard)).toBe(
      getAxisOrientationKey({
        start: axisPuzzleCard.end,
        end: axisPuzzleCard.start,
      }),
    );
  });
});

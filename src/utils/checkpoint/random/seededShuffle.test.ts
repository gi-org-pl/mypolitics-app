import { describe, expect, it } from "vitest";

import { SEED } from "@/utils/checkpoint/engine/getNextCheckpoint.fixtures";
import { seededShuffle } from "./seededShuffle";

const ITEMS = [0, 1, 2, 3, 4, 5, 6, 7];

describe("seededShuffle()", () => {
  it("keeps every item exactly once", () => {
    for (let index = 0; index < 200; index += 1) {
      expect(
        seededShuffle(ITEMS, `seed-${index}`, "halfway").sort(
          (first, second) => first - second,
        ),
      ).toEqual(ITEMS);
    }
  });

  it("returns the same order for the same seed, purpose and round", () => {
    expect(seededShuffle(ITEMS, SEED, "halfway", 2)).toEqual(
      seededShuffle(ITEMS, SEED, "halfway", 2),
    );
    expect(seededShuffle(ITEMS, SEED, "halfway")).toEqual(
      seededShuffle(ITEMS, SEED, "halfway", 0),
    );
  });

  it("returns another order for another round", () => {
    expect(seededShuffle(ITEMS, SEED, "halfway", 1)).not.toEqual(
      seededShuffle(ITEMS, SEED, "halfway"),
    );
  });

  it("returns another order for another purpose and for another seed", () => {
    expect(seededShuffle(ITEMS, SEED, "new-trait")).not.toEqual(
      seededShuffle(ITEMS, SEED, "halfway"),
    );
    expect(seededShuffle(ITEMS, "another seed", "halfway")).not.toEqual(
      seededShuffle(ITEMS, SEED, "halfway"),
    );
  });

  it("does not change the list it was given", () => {
    const items = Object.freeze([...ITEMS]);

    expect(seededShuffle(items, SEED, "halfway")).not.toBe(items);
    expect(items).toEqual(ITEMS);
  });

  it("matches the orders written down in the test, so every browser agrees", () => {
    expect(seededShuffle(ITEMS, SEED, "halfway")).toEqual([
      1, 0, 4, 3, 2, 7, 6, 5,
    ]);
    expect(seededShuffle(ITEMS, SEED, "halfway", 1)).toEqual([
      2, 7, 1, 4, 3, 0, 5, 6,
    ]);
  });

  it("gives every order of three items its share", () => {
    const counts = new Map<string, number>();

    for (let index = 0; index < 6000; index += 1) {
      const order = seededShuffle([0, 1, 2], `seed-${index}`, "halfway").join(
        "",
      );

      counts.set(order, (counts.get(order) ?? 0) + 1);
    }

    expect(counts.size).toBe(6);

    for (const count of counts.values()) {
      expect(count).toBeGreaterThan(850);
      expect(count).toBeLessThan(1150);
    }
  });

  it("returns an empty list and a list of one as they are", () => {
    expect(seededShuffle([], SEED, "halfway")).toEqual([]);
    expect(seededShuffle(["only"], SEED, "halfway")).toEqual(["only"]);
  });
});

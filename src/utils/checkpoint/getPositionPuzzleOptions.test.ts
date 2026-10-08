import { describe, expect, it } from "vitest";

import type { ResultEntry } from "@/types/results";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { createArchetypes, SEED } from "./getNextCheckpoint.fixtures";
import { getPositionPuzzleOptions } from "./getPositionPuzzleOptions";
import { seededShuffle } from "./seededShuffle";

const toIds = (
  archetypes: readonly ResultEntry[],
  seed = SEED,
): string[] | undefined =>
  getPositionPuzzleOptions(archetypes, seed)?.map(({ id }) => id);

// Eight archetypes, closest first: archetype-1 ... archetype-8.
const archetypes = createArchetypes([80, 70, 65, 60, 55, 50, 40, 30]);

const withName = (entry: ResultEntry, name: string): ResultEntry => ({
  ...entry,
  orientation: createOrientation(entry.orientation.id, name),
});

describe("getPositionPuzzleOptions()", () => {
  it("draws two distractors from the four archetypes ranked right behind the leader", () => {
    const drawn = new Set<string>();

    for (let index = 0; index < 200; index += 1) {
      for (const id of toIds(archetypes, `seed-${index}`) ?? []) {
        drawn.add(id);
      }
    }

    expect([...drawn].sort()).toEqual([
      "archetype-1",
      "archetype-2",
      "archetype-3",
      "archetype-4",
      "archetype-5",
    ]);
  });

  it("draws from all the others when there are fewer than five archetypes", () => {
    const four = archetypes.slice(0, 4);
    const drawn = new Set<string>();

    for (let index = 0; index < 100; index += 1) {
      for (const id of toIds(four, `seed-${index}`) ?? []) {
        drawn.add(id);
      }
    }

    expect([...drawn].sort()).toEqual([
      "archetype-1",
      "archetype-2",
      "archetype-3",
      "archetype-4",
    ]);
    expect(toIds(archetypes.slice(0, 3))?.sort()).toEqual([
      "archetype-1",
      "archetype-2",
      "archetype-3",
    ]);
  });

  it("leaves out the later of two archetypes with the same name", () => {
    const [first, second, third, fourth] = archetypes;
    // The third reads like the second, and the fourth like the leader.
    const twins = [
      first,
      second,
      withName(third, " Postać   2 "),
      withName(fourth, "Postać 1"),
      ...archetypes.slice(4),
    ];
    const drawn = new Set<string>();

    for (let index = 0; index < 200; index += 1) {
      for (const id of toIds(twins, `seed-${index}`) ?? []) {
        drawn.add(id);
      }
    }

    // The four right behind the leader are now 2, 5, 6 and 7.
    expect([...drawn].sort()).toEqual([
      "archetype-1",
      "archetype-2",
      "archetype-5",
      "archetype-6",
      "archetype-7",
    ]);
  });

  it("returns nothing when fewer than two distractors are left", () => {
    const [first, second, third] = archetypes;

    expect(toIds([first, second])).toBeUndefined();
    expect(toIds([first])).toBeUndefined();
    expect(toIds([])).toBeUndefined();
    expect(toIds([first, second, withName(third, "Postać 2")])).toBeUndefined();
    expect(toIds([first, withName(second, "Postać 1"), third])).toBeUndefined();
  });

  it("returns three options that include the leader", () => {
    for (let index = 0; index < 100; index += 1) {
      const ids = toIds(archetypes, `seed-${index}`);

      expect(ids).toHaveLength(3);
      expect(new Set(ids).size).toBe(3);
      expect(ids).toContain("archetype-1");
    }
  });

  it("gives the leader no fixed place", () => {
    const places = new Set(
      Array.from({ length: 100 }, (_, index) =>
        toIds(archetypes, `seed-${index}`)?.indexOf("archetype-1"),
      ),
    );

    expect([...places].sort()).toEqual([0, 1, 2]);
  });

  it("returns the options as the orientations of the archetypes", () => {
    const options = getPositionPuzzleOptions(archetypes, SEED);

    for (const option of options ?? []) {
      expect(archetypes.map(({ orientation }) => orientation)).toContain(
        option,
      );
    }
  });

  it("returns the same options in the same order for the same seed", () => {
    expect(toIds(archetypes)).toEqual(toIds(archetypes));
    expect(toIds(archetypes)).toEqual(toIds(structuredClone(archetypes)));
  });

  it("is not changed by a draw made for another purpose", () => {
    const before = toIds(archetypes);

    seededShuffle([0, 1, 2], SEED, "position-puzzle-ask");
    seededShuffle([0, 1, 2], SEED, "halfway", 3);

    expect(toIds(archetypes)).toEqual(before);
    // What other archetypes the quiz has further down changes nothing either.
    expect(toIds(archetypes.slice(0, 5))).toEqual(before);
  });

  it("does not change the ranking it was given", () => {
    const copy = structuredClone(archetypes);

    getPositionPuzzleOptions(archetypes, SEED);

    expect(archetypes).toEqual(copy);
  });
});

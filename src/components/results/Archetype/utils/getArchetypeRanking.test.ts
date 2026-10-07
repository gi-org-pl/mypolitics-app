import { describe, expect, it } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";

import type { ArchetypeEntry } from "../Archetype.types";
import { getArchetypeRanking } from "./getArchetypeRanking";

const archetype = (id: string, match?: number): ArchetypeEntry => ({
  orientation: createOrientation(id, id),
  match,
});

const hidden = (id: string, match?: number): ArchetypeEntry => ({
  orientation: createOrientation(id, id, { isHidden: true }),
  match,
});

const ids = (archetypes: ArchetypeEntry[]): string[] =>
  archetypes.map(({ orientation }) => orientation.id);

describe("getArchetypeRanking()", () => {
  it("returns the archetype with the highest match as the leader", () => {
    const { leader } = getArchetypeRanking([
      archetype("a", 20),
      archetype("b", 90),
      archetype("c", 55),
    ]);

    expect(leader?.orientation.id).toBe("b");
    expect(leader?.match).toBe(90);
  });

  it("returns the first in the given order when matches are equal", () => {
    const { leader, rest } = getArchetypeRanking([
      archetype("a", 40),
      archetype("b", 70),
      archetype("c", 70),
      archetype("d", 40),
    ]);

    expect(leader?.orientation.id).toBe("b");
    expect(ids(rest)).toEqual(["c", "a", "d"]);
  });

  it("returns the rest sorted by match, highest first", () => {
    const { rest } = getArchetypeRanking([
      archetype("a", 20),
      archetype("b", 90),
      archetype("c", 55),
      archetype("d", 70),
    ]);

    expect(ids(rest)).toEqual(["d", "c", "a"]);
  });

  it("treats a missing match as zero and lists it last", () => {
    const { leader, rest } = getArchetypeRanking([
      archetype("a"),
      archetype("b", 0),
      archetype("c", Number.NaN),
      { ...archetype("d"), match: "90" as unknown as number },
      archetype("e", 10),
    ]);

    expect(leader?.orientation.id).toBe("e");
    expect(ids(rest)).toEqual(["b", "a", "c", "d"]);
    expect(rest.map(({ match }) => match)).toEqual([0, 0, 0, 0]);
  });

  it("leads with the first archetype when no match is a number", () => {
    const { leader, rest } = getArchetypeRanking([
      archetype("a"),
      archetype("b"),
    ]);

    expect(leader).toEqual({ ...archetype("a"), match: 0 });
    expect(ids(rest)).toEqual(["b"]);
  });

  it("clamps a match outside 0-100", () => {
    const { leader, rest } = getArchetypeRanking([
      archetype("a", -20),
      archetype("b", 100),
      archetype("c", 150),
    ]);

    expect(leader).toEqual({ ...archetype("b"), match: 100 });
    expect(rest).toEqual([
      { ...archetype("c"), match: 100 },
      { ...archetype("a"), match: 0 },
    ]);
  });

  it("keeps the descriptions of every archetype", () => {
    const { leader } = getArchetypeRanking([
      {
        orientation: createOrientation("a", "a", {
          description: "s",
          fullDescription: "f",
        }),
        match: 80,
      },
    ]);

    expect(leader?.orientation).toMatchObject({
      description: "s",
      fullDescription: "f",
    });
  });

  describe("given a hidden archetype", () => {
    it("leads with the best archetype that is shown", () => {
      const { leader } = getArchetypeRanking([
        archetype("a", 20),
        hidden("b", 90),
        archetype("c", 55),
      ]);

      expect(leader?.orientation.id).toBe("c");
    });

    it("leaves the hidden one out of the rest", () => {
      const { rest } = getArchetypeRanking([
        archetype("a", 20),
        hidden("b", 40),
        archetype("c", 55),
        archetype("d", 30),
      ]);

      expect(ids(rest)).toEqual(["d", "a"]);
    });

    it("returns no leader when every archetype is hidden", () => {
      expect(getArchetypeRanking([hidden("a", 80), hidden("b", 60)])).toEqual({
        leader: null,
        rest: [],
      });
    });
  });

  it("does not mutate the input", () => {
    const input = [archetype("a", 1), archetype("b", 150)];
    const copy = structuredClone(input);

    getArchetypeRanking(input);

    expect(input).toEqual(copy);
  });

  it("returns no leader for an empty list", () => {
    expect(getArchetypeRanking([])).toEqual({ leader: null, rest: [] });
  });

  it("returns no leader for a missing or malformed list", () => {
    expect(getArchetypeRanking()).toEqual({ leader: null, rest: [] });
    expect(getArchetypeRanking("x" as unknown as ArchetypeEntry[])).toEqual({
      leader: null,
      rest: [],
    });
    expect(
      ids(
        getArchetypeRanking([
          null as unknown as ArchetypeEntry,
          archetype("a", 1),
          undefined as unknown as ArchetypeEntry,
          archetype("b", 2),
        ]).rest,
      ),
    ).toEqual(["a"]);
  });
});

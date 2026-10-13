import { describe, expect, it } from "vitest";

import type { Orientation } from "@/types/orientation";
import { createOrientation } from "@/utils/vitest/createOrientation";

import type { ArchetypeEntry } from "../Archetype.types";
import { getArchetypeContent } from "./getArchetypeContent";

const archetype = (
  id: string,
  match: number,
  orientation: Partial<Orientation> = {},
): ArchetypeEntry => ({
  orientation: createOrientation(id, id, orientation),
  match,
});

const REST = [archetype("b", 70), archetype("c", 20)];

describe("getArchetypeContent()", () => {
  describe("given a leader that is a match or a partial match", () => {
    it("returns both descriptions and the rest as the ranking", () => {
      const leader = archetype("a", 50, {
        description: " Krótki. ",
        fullDescription: "Pełny.\n\n\nDrugi.",
      });

      expect(getArchetypeContent(leader, REST)).toEqual({
        isMatched: true,
        shortDescription: "Krótki.",
        fullDescription: "Pełny.\n\nDrugi.",
        ranking: REST,
        hasDescription: true,
        hasRanking: true,
      });
    });

    it("has no description to open without a full description", () => {
      const content = getArchetypeContent(
        archetype("a", 90, { description: "Krótki." }),
        REST,
      );

      expect(content.hasDescription).toBe(false);
      expect(content.shortDescription).toBe("Krótki.");
    });

    it("has no description to open when the full one equals the short one", () => {
      const content = getArchetypeContent(
        archetype("a", 90, {
          description: "  Opis.\n",
          fullDescription: "Opis.",
        }),
        REST,
      );

      expect(content.hasDescription).toBe(false);
    });

    it("has a description to open with only a full description", () => {
      const content = getArchetypeContent(
        archetype("a", 90, { fullDescription: "Pełny." }),
        REST,
      );

      expect(content.shortDescription).toBe("");
      expect(content.hasDescription).toBe(true);
    });

    it("treats a description that is only whitespace as missing", () => {
      const content = getArchetypeContent(
        archetype("a", 90, { description: " \n ", fullDescription: "  " }),
        REST,
      );

      expect(content.shortDescription).toBe("");
      expect(content.fullDescription).toBe("");
      expect(content.hasDescription).toBe(false);
    });

    it("has no ranking without other archetypes", () => {
      const content = getArchetypeContent(archetype("a", 90), []);

      expect(content.ranking).toEqual([]);
      expect(content.hasRanking).toBe(false);
    });
  });

  describe("given a leader that is no match", () => {
    const leader = archetype("a", 49, {
      description: "Krótki.",
      fullDescription: "Pełny.",
    });

    it("returns no descriptions", () => {
      expect(getArchetypeContent(leader, REST)).toMatchObject({
        isMatched: false,
        shortDescription: "",
        fullDescription: "",
        hasDescription: false,
      });
    });

    it("puts the leader first in the ranking", () => {
      const content = getArchetypeContent(leader, REST);

      expect(content.ranking).toEqual([leader, ...REST]);
      expect(content.hasRanking).toBe(true);
    });

    it("has no ranking to open without other archetypes", () => {
      const content = getArchetypeContent(leader, []);

      expect(content.ranking).toEqual([leader]);
      expect(content.hasRanking).toBe(false);
    });
  });

  describe("given a leader without an orientation", () => {
    it("returns no descriptions", () => {
      const leader = { match: 90 } as unknown as ArchetypeEntry;

      expect(getArchetypeContent(leader, REST)).toMatchObject({
        isMatched: true,
        shortDescription: "",
        fullDescription: "",
        hasDescription: false,
      });
    });
  });

  describe("given no leader", () => {
    it("returns nothing to show", () => {
      expect(getArchetypeContent(null, [])).toEqual({
        isMatched: false,
        shortDescription: "",
        fullDescription: "",
        ranking: [],
        hasDescription: false,
        hasRanking: false,
      });
    });
  });
});

describe("getArchetypeContent()", () => {
  describe("given a card set to name a leader below a partial match", () => {
    const leader = archetype("a", 43.67, {
      description: "Krótki.",
      fullDescription: "Pełny.",
    });

    it("treats the leader as matched: both descriptions, and the rest alone as the ranking", () => {
      expect(getArchetypeContent(leader, REST, "named")).toEqual({
        isMatched: true,
        shortDescription: "Krótki.",
        fullDescription: "Pełny.",
        ranking: REST,
        hasDescription: true,
        hasRanking: true,
      });
    });

    it("does so for a leader at zero as well", () => {
      expect(
        getArchetypeContent(archetype("a", 0), REST, "named").isMatched,
      ).toBe(true);
    });

    it("has nothing matched without a leader", () => {
      expect(getArchetypeContent(null, [], "named")).toMatchObject({
        isMatched: false,
        ranking: [],
      });
    });
  });

  describe("given a card set to say that nothing matches", () => {
    it("leaves a leader below a partial match unnamed, in the ranking with the rest", () => {
      const leader = archetype("a", 43.67, { description: "Krótki." });

      expect(getArchetypeContent(leader, REST, "no_match")).toMatchObject({
        isMatched: false,
        shortDescription: "",
        ranking: [leader, ...REST],
      });
    });
  });
});

describe("getArchetypeContent()", () => {
  describe("given a card set to name a leader below a partial match, and a leader with no match of its own", () => {
    const leader = archetype("a", 0, {
      description: "Krótki.",
      fullDescription: "Pełny.",
    });

    it("names nobody: no descriptions, and the first archetype in the ranking with the rest", () => {
      expect(getArchetypeContent(leader, REST, "named", false)).toEqual({
        isMatched: false,
        shortDescription: "",
        fullDescription: "",
        ranking: [leader, ...REST],
        hasDescription: false,
        hasRanking: true,
      });
    });

    it("still names a leader that is scored, whatever its match", () => {
      expect(getArchetypeContent(leader, REST, "named", true).isMatched).toBe(
        true,
      );
    });
  });
});

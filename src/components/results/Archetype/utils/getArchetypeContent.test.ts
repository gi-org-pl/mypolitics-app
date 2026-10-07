import { describe, expect, it } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";

import type { ArchetypeEntry } from "../Archetype.types";
import { getArchetypeContent } from "./getArchetypeContent";

const archetype = (
  id: string,
  match: number,
  rest: Partial<ArchetypeEntry> = {},
): ArchetypeEntry => ({
  orientation: createOrientation(id, id),
  match,
  ...rest,
});

const REST = [archetype("b", 70), archetype("c", 20)];

describe("getArchetypeContent()", () => {
  describe("given a leader that is a match or a partial match", () => {
    it("returns both descriptions and the rest as the ranking", () => {
      const leader = archetype("a", 50, {
        shortDescription: " Krótki. ",
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
        archetype("a", 90, { shortDescription: "Krótki." }),
        REST,
      );

      expect(content.hasDescription).toBe(false);
      expect(content.shortDescription).toBe("Krótki.");
    });

    it("has no description to open when the full one equals the short one", () => {
      const content = getArchetypeContent(
        archetype("a", 90, {
          shortDescription: "  Opis.\n",
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
        archetype("a", 90, { shortDescription: " \n ", fullDescription: "  " }),
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
      shortDescription: "Krótki.",
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

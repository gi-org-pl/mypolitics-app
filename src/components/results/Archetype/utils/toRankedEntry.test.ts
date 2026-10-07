import { describe, expect, it } from "vitest";

import { MATCH_BAND_COLORS } from "@/constants/results";

import type { ArchetypeEntry } from "../Archetype.types";
import { toRankedEntry } from "./toRankedEntry";

const archetype = (match?: number): ArchetypeEntry => ({
  orientation: {
    id: "a",
    type: "ideology",
    name: "Alfa",
    imageUrl: "a.png",
    color: "#123456",
  },
  match,
});

describe("toRankedEntry()", () => {
  it("returns the orientation with its match as the value", () => {
    expect(toRankedEntry(archetype(64))).toEqual({
      orientation: {
        id: "a",
        type: "ideology",
        name: "Alfa",
        imageUrl: "a.png",
        color: MATCH_BAND_COLORS.partial,
      },
      value: 64,
    });
  });

  it.each([
    [100, "match"],
    [80, "match"],
    [79.9, "partial"],
    [50, "partial"],
    [49.9, "none"],
    [0, "none"],
  ] as const)("colours a match of %s by the %s band", (match, band) => {
    expect(toRankedEntry(archetype(match)).orientation.color).toBe(
      MATCH_BAND_COLORS[band],
    );
  });

  it("never keeps the archetype own colour", () => {
    expect(toRankedEntry(archetype(90)).orientation.color).not.toBe("#123456");
    expect(toRankedEntry(archetype()).orientation.color).toBe(
      MATCH_BAND_COLORS.none,
    );
  });

  it("keeps a missing match missing", () => {
    expect(toRankedEntry(archetype()).value).toBeUndefined();
  });

  it("does not mutate the archetype", () => {
    const input = archetype(90);

    toRankedEntry(input);

    expect(input.orientation.color).toBe("#123456");
  });

  it("does not fail for an archetype without an orientation", () => {
    expect(toRankedEntry({ match: 30 } as unknown as ArchetypeEntry)).toEqual({
      orientation: { color: MATCH_BAND_COLORS.none },
      value: 30,
    });
  });
});

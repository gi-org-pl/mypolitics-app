import { describe, expect, it } from "vitest";

import type { NolanQuadrants } from "../NolanChart.types";
import { getNolanPosition } from "./getNolanPosition";
import { getQuadrantName } from "./getQuadrantName";

const CENTRE = getNolanPosition({ start: 50, end: 50 }, { start: 50, end: 50 });
const MODERATE = getNolanPosition(
  { start: 77, end: 23 },
  { start: 67, end: 33 },
);
const EXTREME = getNolanPosition(
  { start: 100, end: 0 },
  { start: 100, end: 0 },
);

const withNames = (
  names?: NolanQuadrants["bottomLeft"]["names"],
): Partial<NolanQuadrants> => ({ bottomLeft: { names } });

const NAMES = {
  moderate: " Umiarkowana\nzielona ",
  moderateShort: " Um.  zielona ",
  extreme: "Skrajna zielona",
  extremeShort: "Skr. zielona",
};

describe("getQuadrantName()", () => {
  it("returns the name and the short name for the level, on one line", () => {
    expect(getQuadrantName(withNames(NAMES), MODERATE)).toEqual({
      name: "Umiarkowana zielona",
      shortName: "Um. zielona",
    });
    expect(getQuadrantName(withNames(NAMES), EXTREME)).toEqual({
      name: "Skrajna zielona",
      shortName: "Skr. zielona",
    });
  });

  it("returns no short name when none was supplied", () => {
    expect(
      getQuadrantName(withNames({ moderate: "Umiarkowana zielona" }), MODERATE),
    ).toEqual({ name: "Umiarkowana zielona", shortName: "" });
  });

  it("falls back to the other level, with that level's short name", () => {
    expect(
      getQuadrantName(
        withNames({ extreme: "Skrajna zielona", extremeShort: "Skr. zielona" }),
        MODERATE,
      ),
    ).toEqual({ name: "Skrajna zielona", shortName: "Skr. zielona" });
    expect(
      getQuadrantName(
        withNames({ moderate: "Zielona", extremeShort: "Skr. zielona" }),
        EXTREME,
      ),
    ).toEqual({ name: "Zielona", shortName: "" });
  });

  it("ignores a short name whose full name is missing", () => {
    expect(
      getQuadrantName(withNames({ moderateShort: "Um. zielona" }), MODERATE),
    ).toEqual({ name: "", shortName: "" });
  });

  it("returns no name at the centre, without a position or without names", () => {
    const noName = { name: "", shortName: "" };

    expect(getQuadrantName(withNames(NAMES), CENTRE)).toEqual(noName);
    expect(getQuadrantName(withNames(NAMES), null)).toEqual(noName);
    expect(getQuadrantName(withNames(), MODERATE)).toEqual(noName);
    expect(getQuadrantName({}, MODERATE)).toEqual(noName);
    expect(getQuadrantName(undefined, MODERATE)).toEqual(noName);
  });
});

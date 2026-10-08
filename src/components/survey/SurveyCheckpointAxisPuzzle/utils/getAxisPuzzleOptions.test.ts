import { describe, expect, it } from "vitest";

import type { AxisPuzzleCheckpointCard } from "@/types/checkpoint";
import { createAxisPair } from "@/utils/vitest/createAxisPair";

import { getAxisPuzzleOptions } from "./getAxisPuzzleOptions";

const createCard = (
  startName?: string,
  endName?: string,
  leadingSide: "start" | "end" = "end",
): AxisPuzzleCheckpointCard => {
  const { start, end } = createAxisPair(
    "economy",
    startName as string,
    endName as string,
    44,
    56,
  );

  return {
    type: "axis-puzzle",
    boundary: 11,
    axisId: "economy",
    start,
    end,
    leadingSide,
    line: { pool: "axis-puzzle-ask", index: 0 },
  };
};

describe("getAxisPuzzleOptions()", () => {
  it("gives the start pole first and the end pole second", () => {
    const card = createCard("Interwencjonizm", "Wolny rynek");

    expect(getAxisPuzzleOptions(card)).toEqual([
      card.start.orientation,
      card.end.orientation,
    ]);
  });

  it("keeps that order whichever side leads", () => {
    const card = createCard("Interwencjonizm", "Wolny rynek", "start");

    expect(getAxisPuzzleOptions(card)?.map(({ name }) => name)).toEqual([
      "Interwencjonizm",
      "Wolny rynek",
    ]);
  });

  it("gives the orientations as the card has them", () => {
    const card = createCard("Wolny \n rynek", "Interwencjonizm");
    const options = getAxisPuzzleOptions(card);

    expect(options?.[0]).toBe(card.start.orientation);
    expect(options?.[1]).toBe(card.end.orientation);
  });

  it("gives nothing when a pole has no name, or a name of only space", () => {
    expect(
      getAxisPuzzleOptions(createCard(undefined, "Wolny rynek")),
    ).toBeUndefined();
    expect(
      getAxisPuzzleOptions(createCard("Interwencjonizm", "")),
    ).toBeUndefined();
    expect(
      getAxisPuzzleOptions(createCard(" \n ", "Wolny rynek")),
    ).toBeUndefined();
  });

  it("gives nothing, without throwing, for a card that cannot be read", () => {
    const broken = {
      ...createCard("Interwencjonizm", "Wolny rynek"),
      end: undefined,
    } as unknown as AxisPuzzleCheckpointCard;

    expect(getAxisPuzzleOptions(broken)).toBeUndefined();
  });
});

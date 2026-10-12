import { describe, expect, it } from "vitest";

import type { StatsCheckpointCard } from "@/types/checkpoint";

import { getStatsShares } from "./getStatsShares";

const createCard = (
  overrides: Partial<StatsCheckpointCard> = {},
): StatsCheckpointCard => ({
  type: "stats",
  boundary: 5,
  line: { pool: "stats-for", index: 0 },
  questionId: "q5",
  thesis: "Podatki powinny być niższe.",
  side: "for",
  counts: { for: 100, against: 600, noAnswer: 300 },
  percent: 10,
  ...overrides,
});

describe("getStatsShares()", () => {
  it("gives each count as a whole percent of the three together", () => {
    expect(getStatsShares(createCard())).toEqual({
      for: 10,
      against: 60,
      noAnswer: 30,
    });
  });

  it("gives the taker's side the percent of the card", () => {
    // 81 of 1000 is 8.1%: the card rounds its side up, the description
    // repeats the card.
    expect(
      getStatsShares(
        createCard({
          counts: { for: 81, against: 619, noAnswer: 300 },
          percent: 9,
        }),
      ),
    ).toMatchObject({ for: 9 });
    expect(
      getStatsShares(
        createCard({
          side: "against",
          counts: { for: 619, against: 81, noAnswer: 300 },
          percent: 9,
        }),
      ),
    ).toEqual({ for: 62, against: 9, noAnswer: 30 });
  });

  it("gives the taker's side 1 for a count of zero, as the statement does", () => {
    expect(
      getStatsShares(
        createCard({
          counts: { for: 0, against: 700, noAnswer: 300 },
          percent: 1,
        }),
      ),
    ).toEqual({ for: 1, against: 70, noAnswer: 30 });
  });

  it("rounds the other two to the nearest whole percent", () => {
    expect(
      getStatsShares(
        createCard({
          counts: { for: 1, against: 2, noAnswer: 3 },
          percent: 10,
        }),
      ),
    ).toEqual({ for: 10, against: 33, noAnswer: 50 });
    expect(
      getStatsShares(
        createCard({
          counts: { for: 10, against: 665, noAnswer: 325 },
          percent: 1,
        }),
      ),
    ).toEqual({ for: 1, against: 67, noAnswer: 33 });
  });

  it("gives 0 for a count of zero that is not the taker's side", () => {
    expect(
      getStatsShares(
        createCard({
          counts: { for: 80, against: 920, noAnswer: 0 },
          percent: 8,
        }),
      ),
    ).toEqual({ for: 8, against: 92, noAnswer: 0 });
  });

  it.each([
    ["three counts of zero", { for: 0, against: 0, noAnswer: 0 }],
    ["a negative count", { for: -1, against: 600, noAnswer: 300 }],
    [
      "a count that is not a number",
      { for: Number.NaN, against: 600, noAnswer: 300 },
    ],
    ["a missing count", { for: 100, against: 600 }],
    ["no counts", undefined],
  ])("returns nothing when the counts cannot be drawn: %s", (_, counts) => {
    expect(
      getStatsShares(
        createCard({ counts: counts as StatsCheckpointCard["counts"] }),
      ),
    ).toBeUndefined();
  });
});

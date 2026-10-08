import { describe, expect, it } from "vitest";

import { FALLBACK_SEED } from "@/constants/checkpoint";

import { SEED } from "./getNextCheckpoint.fixtures";
import { getSeededRandom } from "./getSeededRandom";

describe("getSeededRandom()", () => {
  it("returns a number from 0 up to, not including, 1", () => {
    for (let draw = 0; draw < 2000; draw += 1) {
      const random = getSeededRandom(SEED, "range", draw);

      expect(random).toBeGreaterThanOrEqual(0);
      expect(random).toBeLessThan(1);
    }
  });

  it("returns the same number for the same seed, purpose and draw", () => {
    expect(getSeededRandom(SEED, "halfway", 3)).toBe(
      getSeededRandom(SEED, "halfway", 3),
    );
    expect(getSeededRandom(SEED, "halfway")).toBe(
      getSeededRandom(SEED, "halfway", 0),
    );
  });

  it("returns another number for another purpose", () => {
    expect(getSeededRandom(SEED, "new-trait")).not.toBe(
      getSeededRandom(SEED, "halfway"),
    );
  });

  it("returns another number for another draw", () => {
    const numbers = Array.from({ length: 50 }, (_, draw) =>
      getSeededRandom(SEED, "halfway", draw),
    );

    expect(new Set(numbers).size).toBe(50);
  });

  it("returns another number for another seed", () => {
    expect(getSeededRandom("another seed", "halfway")).not.toBe(
      getSeededRandom(SEED, "halfway"),
    );
  });

  it("keeps a seed and a purpose apart, wherever the one ends and the other begins", () => {
    expect(getSeededRandom("ab", "c")).not.toBe(getSeededRandom("a", "bc"));
    expect(getSeededRandom("a:b", "c")).not.toBe(getSeededRandom("a", "b:c"));
  });

  it("uses a fixed seed when the seed is missing or empty", () => {
    const fixed = getSeededRandom(FALLBACK_SEED, "halfway", 2);

    expect(getSeededRandom("", "halfway", 2)).toBe(fixed);
    expect(getSeededRandom(undefined as unknown as string, "halfway", 2)).toBe(
      fixed,
    );
    expect(getSeededRandom(null as unknown as string, "halfway", 2)).toBe(
      fixed,
    );
  });

  it("matches a list of numbers written down in the test, so every browser agrees", () => {
    expect(
      [0, 1, 2, 3, 4].map((draw) => getSeededRandom(SEED, "halfway", draw)),
    ).toEqual([
      0.817_998_174_345_120_8, 0.379_047_249_676_659_7, 0.825_945_584_103_465_1,
      0.908_175_766_700_878_7, 0.814_094_618_428_498_5,
    ]);
    expect(
      [0, 1, 2].map((draw) => getSeededRandom("", "halfway", draw)),
    ).toEqual([
      0.261_784_363_538_026_8, 0.398_179_652_635_008_1, 0.832_961_886_655_539_3,
    ]);
    expect(
      [0, 1, 2].map((draw) =>
        getSeededRandom("zażółć gęślą jaźń 🙂", "ćwiartki", draw),
      ),
    ).toEqual([
      0.585_057_952_441_275_1, 0.301_811_616_169_288_75,
      0.339_747_831_458_225_85,
    ]);
  });

  it("spreads its numbers evenly", () => {
    const tenths = Array.from({ length: 10 }, () => 0);

    for (let index = 0; index < 10_000; index += 1) {
      tenths[Math.floor(getSeededRandom(`seed-${index}`, "even") * 10)] += 1;
    }

    for (const count of tenths) {
      expect(count).toBeGreaterThan(900);
      expect(count).toBeLessThan(1100);
    }
  });
});

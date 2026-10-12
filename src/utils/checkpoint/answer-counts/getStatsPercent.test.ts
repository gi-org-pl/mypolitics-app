import { describe, expect, it } from "vitest";

import { getStatsPercent } from "./getStatsPercent";

describe("getStatsPercent()", () => {
  describe("given a share that is a whole percent", () => {
    it("returns it", () => {
      expect(
        getStatsPercent({ for: 80, against: 900, noAnswer: 20 }, "for"),
      ).toBe(8);
      expect(
        getStatsPercent({ for: 900, against: 100, noAnswer: 0 }, "against"),
      ).toBe(10);
    });
  });

  describe("given a share between two whole percents", () => {
    it("rounds it up", () => {
      expect(
        getStatsPercent({ for: 81, against: 900, noAnswer: 19 }, "for"),
      ).toBe(9);
    });
  });

  describe("given a share below one percent", () => {
    it("returns 1", () => {
      expect(
        getStatsPercent({ for: 1, against: 400, noAnswer: 599 }, "for"),
      ).toBe(1);
      expect(
        getStatsPercent({ for: 400, against: 0, noAnswer: 600 }, "against"),
      ).toBe(1);
    });
  });

  describe("given the takers the question was shown to and who chose neither side", () => {
    it("counts them in the whole", () => {
      // 100 of the 900 who answered is more than 11%, of the 1000 it was
      // shown to exactly 10%.
      expect(
        getStatsPercent({ for: 100, against: 800, noAnswer: 100 }, "for"),
      ).toBe(10);
    });
  });
});

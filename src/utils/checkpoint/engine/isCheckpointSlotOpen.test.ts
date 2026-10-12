import { describe, expect, it } from "vitest";

import type { CheckpointShownCard } from "@/types/checkpoint";

import { createState, halfwayCard } from "./getNextCheckpoint.fixtures";
import { isCheckpointSlotOpen } from "./isCheckpointSlotOpen";

// Cards shown at the boundaries given, oldest first.
const shownAt = (...boundaries: number[]): CheckpointShownCard[] =>
  boundaries.map((boundary) => ({ card: { ...halfwayCard, boundary } }));

const isOpen = (done: number, all: number, ...boundaries: number[]): boolean =>
  isCheckpointSlotOpen(createState(done, all).progress, shownAt(...boundaries));

// The first boundary of the quiz at which the slot is open.
const firstOpen = (all: number, ...boundaries: number[]): number | undefined =>
  Array.from({ length: all + 1 }, (_, done) => done).find((done) =>
    isOpen(done, all, ...boundaries),
  );

describe("isCheckpointSlotOpen()", () => {
  describe("given fewer than 5 done questions", () => {
    it("is closed", () => {
      for (const done of [0, 1, 2, 3, 4]) {
        expect(isOpen(done, 40)).toBe(false);
      }

      expect(isOpen(5, 40)).toBe(true);
    });
  });

  describe("given fewer than 4 questions left", () => {
    it("is closed", () => {
      for (const done of [37, 38, 39, 40]) {
        expect(isOpen(done, 40)).toBe(false);
      }

      expect(isOpen(36, 40)).toBe(true);
    });
  });

  describe("given a quiz of fewer than 9 questions", () => {
    it("is closed at every boundary", () => {
      for (let all = 1; all < 9; all += 1) {
        expect(firstOpen(all)).toBeUndefined();
      }

      expect(firstOpen(9)).toBe(5);
    });
  });

  describe("given a card shown at boundary 20", () => {
    it("is closed at boundary 23", () => {
      expect(isOpen(23, 60, 20)).toBe(false);
      expect(isOpen(25, 60, 20)).toBe(false);
    });

    it("is open at boundary 26 when the rate allows", () => {
      expect(isOpen(26, 60, 20)).toBe(true);
      // The third card of a quiz of 102 questions needs boundary 34.
      expect(isOpen(26, 102, 5, 20)).toBe(false);
    });
  });

  describe("given a quiz of 102 questions", () => {
    it("opens for cards 1 to 6 from boundaries 5, 17, 34, 51, 68 and 85", () => {
      expect(firstOpen(102)).toBe(5);
      expect(firstOpen(102, 5)).toBe(17);
      expect(firstOpen(102, 5, 17)).toBe(34);
      expect(firstOpen(102, 5, 17, 34)).toBe(51);
      expect(firstOpen(102, 5, 17, 34, 51)).toBe(68);
      expect(firstOpen(102, 5, 17, 34, 51, 68)).toBe(85);
    });

    it("is closed after boundary 98", () => {
      expect(isOpen(98, 102, 5, 17, 34, 51, 68)).toBe(true);

      for (const done of [99, 100, 101, 102]) {
        expect(isOpen(done, 102, 5, 17, 34, 51, 68)).toBe(false);
      }
    });
  });

  describe("given a quiz of 30 questions", () => {
    it("opens for the second card at 10, or at 11 when the first came at 5", () => {
      expect(firstOpen(30, 4)).toBe(10);
      expect(firstOpen(30, 5)).toBe(11);
    });

    it("opens for the third card at 20", () => {
      expect(firstOpen(30, 5, 11)).toBe(20);
    });

    it("never opens for a fourth card", () => {
      expect(isOpen(26, 30, 5, 11)).toBe(true);
      expect(firstOpen(30, 5, 11, 20)).toBeUndefined();
    });
  });

  describe("given a quiz of 100 questions", () => {
    it("opens for the second card at 17, the third at 34 and the fourth at exactly 50", () => {
      expect(firstOpen(100, 5)).toBe(17);
      expect(firstOpen(100, 5, 17)).toBe(34);
      expect(firstOpen(100, 5, 17, 34)).toBe(50);
    });
  });

  describe("given a quiz of 60 questions or fewer", () => {
    it("lets card number k in from boundary (k - 1) x 10", () => {
      expect(firstOpen(60, 2)).toBe(10);
      expect(firstOpen(60, 2, 10)).toBe(20);
      expect(firstOpen(60, 2, 10, 20)).toBe(30);
    });
  });

  describe("given 6 cards shown", () => {
    it("is closed", () => {
      expect(isOpen(100, 120, 5, 20, 40, 60, 80)).toBe(true);
      expect(isOpen(110, 120, 5, 20, 40, 60, 80, 100)).toBe(false);
      expect(firstOpen(120, 5, 20, 40, 60, 80, 100)).toBeUndefined();
    });
  });

  describe("given the taker stepped back behind the boundary of the last card", () => {
    it("stays closed until 6 questions past that boundary", () => {
      for (let done = 5; done < 26; done += 1) {
        expect(isOpen(done, 60, 20)).toBe(false);
      }

      expect(isOpen(26, 60, 20)).toBe(true);
    });

    it("counts from the furthest boundary a card was shown at", () => {
      expect(isOpen(26, 60, 30, 20)).toBe(false);
      expect(isOpen(36, 60, 30, 20)).toBe(true);
    });
  });
});

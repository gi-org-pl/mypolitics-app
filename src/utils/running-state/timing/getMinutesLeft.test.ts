import { describe, expect, it } from "vitest";

import { getMinutesLeft } from "./getMinutesLeft";

describe("getMinutesLeft()", () => {
  describe("given 5 or more timed questions", () => {
    it("multiplies the questions left by the pace and rounds up to a minute", () => {
      expect(
        getMinutesLeft({
          all: 102,
          left: 51,
          timedQuestions: 40,
          averagePace: 9.2,
        }),
      ).toBe(8);
      expect(
        getMinutesLeft({
          all: 102,
          left: 51,
          timedQuestions: 5,
          averagePace: 8.2,
        }),
      ).toBe(7);
    });

    it("is never below 1", () => {
      expect(
        getMinutesLeft({
          all: 102,
          left: 4,
          timedQuestions: 9,
          averagePace: 6,
        }),
      ).toBe(1);
      expect(
        getMinutesLeft({
          all: 102,
          left: 0,
          timedQuestions: 9,
          averagePace: 6,
        }),
      ).toBe(1);
      expect(
        getMinutesLeft({ all: 9, left: 4, timedQuestions: 5, averagePace: 0 }),
      ).toBe(1);
    });

    it("keeps a whole number of minutes as it is", () => {
      expect(
        getMinutesLeft({
          all: 40,
          left: 20,
          timedQuestions: 5,
          averagePace: 6,
        }),
      ).toBe(2);
    });

    it("uses the pace even when the survey has an average", () => {
      expect(
        getMinutesLeft({
          all: 102,
          left: 51,
          timedQuestions: 5,
          averagePace: 9.2,
          averageFinishTime: 60,
        }),
      ).toBe(8);
    });
  });

  describe("given fewer than 5 timed questions", () => {
    it("takes the share of the survey average that the questions left make", () => {
      expect(
        getMinutesLeft({
          all: 102,
          left: 51,
          timedQuestions: 3,
          averagePace: 2,
          averageFinishTime: 15,
        }),
      ).toBe(8);
      expect(
        getMinutesLeft({
          all: 102,
          left: 102,
          timedQuestions: 0,
          averageFinishTime: 15,
        }),
      ).toBe(15);
    });

    it("is never below 1", () => {
      expect(
        getMinutesLeft({
          all: 102,
          left: 1,
          timedQuestions: 4,
          averagePace: 5,
          averageFinishTime: 15,
        }),
      ).toBe(1);
    });

    it.each([
      ["missing", undefined],
      ["zero", 0],
      ["negative", -15],
      ["not a number", Number.NaN],
    ])("returns nothing when the survey average is %s", (_name, averageFinishTime) => {
      expect(
        getMinutesLeft({
          all: 102,
          left: 51,
          timedQuestions: 4,
          averagePace: 9.2,
          averageFinishTime,
        }),
      ).toBeUndefined();
    });
  });

  describe("given a quiz with no questions", () => {
    it("returns nothing", () => {
      expect(
        getMinutesLeft({
          all: 0,
          left: 0,
          timedQuestions: 0,
          averageFinishTime: 15,
        }),
      ).toBeUndefined();
    });
  });
});

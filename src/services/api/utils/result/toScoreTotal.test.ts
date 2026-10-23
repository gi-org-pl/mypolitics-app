import { describe, expect, it } from "vitest";

import { toScoreTotal } from "./toScoreTotal";

describe("toScoreTotal()", () => {
  describe("given the points and the maximum of an orientation", () => {
    it("reads points as the points and maxPossible as the maximum", () => {
      expect(toScoreTotal({ id: "left", points: 10, maxPossible: 20 })).toEqual(
        { points: 10, maximum: 20 },
      );
    });

    it("keeps zero and a fraction as they are", () => {
      expect(toScoreTotal({ id: "left", points: 0, maxPossible: 0 })).toEqual({
        points: 0,
        maximum: 0,
      });
      expect(
        toScoreTotal({ id: "left", points: 2.5, maxPossible: 7.25 }),
      ).toEqual({ points: 2.5, maximum: 7.25 });
    });

    it("carries nothing else of the item", () => {
      expect(
        Object.keys(toScoreTotal({ id: "left", points: 1, maxPossible: 2 })),
      ).toEqual(["points", "maximum"]);
    });
  });

  describe("given a negative number", () => {
    it("reads negative points as 0", () => {
      expect(toScoreTotal({ id: "left", points: -3, maxPossible: 20 })).toEqual(
        { points: 0, maximum: 20 },
      );
    });

    it("reads a negative maximum as 0", () => {
      expect(
        toScoreTotal({ id: "left", points: 10, maxPossible: -20 }),
      ).toEqual({ points: 10, maximum: 0 });
    });
  });
});

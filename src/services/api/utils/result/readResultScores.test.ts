import { describe, expect, it } from "vitest";

import { readResultScores } from "./readResultScores";

describe("readResultScores()", () => {
  describe("given the orientations of a calculation", () => {
    it("holds the points and the maximum of each, by its identifier", () => {
      expect(
        readResultScores([
          { id: "left", points: 10, maxPossible: 20 },
          { id: "right", points: 0, maxPossible: 12.5 },
        ]),
      ).toEqual({
        left: { points: 10, maximum: 20 },
        right: { points: 0, maximum: 12.5 },
      });
    });

    it("is empty for an empty list", () => {
      expect(readResultScores([])).toEqual({});
    });
  });

  describe("given an item that cannot be read", () => {
    it.each([
      ["no identifier", { points: 10, maxPossible: 20 }],
      ["an empty identifier", { id: "", points: 10, maxPossible: 20 }],
      [
        "an identifier that is not text",
        { id: 7, points: 10, maxPossible: 20 },
      ],
      ["no points", { id: "bad", maxPossible: 20 }],
      ["no maximum", { id: "bad", points: 10 }],
      ["points as text", { id: "bad", points: "10", maxPossible: 20 }],
      ["a maximum as text", { id: "bad", points: 10, maxPossible: "20" }],
      ["points that are null", { id: "bad", points: null, maxPossible: 20 }],
      [
        "points that are not a number",
        { id: "bad", points: Number.NaN, maxPossible: 20 },
      ],
      [
        "a maximum that is not a number",
        { id: "bad", points: 10, maxPossible: Number.NaN },
      ],
      [
        "points without end",
        { id: "bad", points: Number.POSITIVE_INFINITY, maxPossible: 20 },
      ],
      [
        "a maximum without end",
        { id: "bad", points: 10, maxPossible: Number.NEGATIVE_INFINITY },
      ],
      ["nothing", null],
      ["text", "left"],
      ["a number", 7],
      ["a list", [{ id: "bad", points: 10, maxPossible: 20 }]],
    ])("drops an item with %s and keeps the others", (_, item) => {
      expect(
        readResultScores([
          { id: "left", points: 10, maxPossible: 20 },
          item,
          { id: "right", points: 5, maxPossible: 20 },
        ]),
      ).toEqual({
        left: { points: 10, maximum: 20 },
        right: { points: 5, maximum: 20 },
      });
    });
  });

  describe("given a negative number", () => {
    it("reads negative points and a negative maximum as 0", () => {
      expect(
        readResultScores([
          { id: "left", points: -1, maxPossible: 20 },
          { id: "right", points: 5, maxPossible: -20 },
        ]),
      ).toEqual({
        left: { points: 0, maximum: 20 },
        right: { points: 5, maximum: 0 },
      });
    });
  });

  describe("given the same orientation twice", () => {
    it("keeps the first", () => {
      expect(
        readResultScores([
          { id: "left", points: 10, maxPossible: 20 },
          { id: "left", points: 1, maxPossible: 2 },
        ]),
      ).toEqual({ left: { points: 10, maximum: 20 } });
    });

    it("keeps the first that can be read", () => {
      expect(
        readResultScores([
          { id: "left", points: "10", maxPossible: 20 },
          { id: "left", points: 1, maxPossible: 2 },
          { id: "left", points: 3, maxPossible: 4 },
        ]),
      ).toEqual({ left: { points: 1, maximum: 2 } });
    });
  });

  describe("given an identifier that is the name of something every object has", () => {
    it("holds it like any other", () => {
      const scores = readResultScores([
        { id: "__proto__", points: 1, maxPossible: 2 },
        { id: "constructor", points: 3, maxPossible: 4 },
      ]);

      expect(Object.keys(scores)).toEqual(["__proto__", "constructor"]);
      expect(scores.constructor).toEqual({ points: 3, maximum: 4 });
      expect(Object.getPrototypeOf(scores)).toBe(Object.prototype);
    });
  });

  describe("given something that is not a list", () => {
    it.each([
      [undefined],
      [null],
      [""],
      ["orientations"],
      [7],
      [{}],
      [{ left: { points: 10, maxPossible: 20 } }],
    ])("is empty for %j", (orientations) => {
      expect(readResultScores(orientations)).toEqual({});
    });
  });
});

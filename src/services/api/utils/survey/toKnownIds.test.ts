import { describe, expect, it } from "vitest";

import { toKnownIds } from "./toKnownIds";

const knownIds = new Set(["a", "b", "c"]);

describe("toKnownIds()", () => {
  describe("given identifiers the quiz has", () => {
    it("keeps them in the order they were sent in", () => {
      expect(toKnownIds(["c", "a"], knownIds)).toEqual(["c", "a"]);
    });
  });

  describe("given an identifier the quiz does not have", () => {
    it("drops it and keeps the others", () => {
      expect(toKnownIds(["a", "x", "b"], knownIds)).toEqual(["a", "b"]);
    });
  });

  describe("given something that is not text", () => {
    it("drops it", () => {
      expect(
        toKnownIds(["a", 7, null, undefined, {}, ["b"]], knownIds),
      ).toEqual(["a"]);
    });
  });

  describe("given no list", () => {
    it("returns an empty list", () => {
      expect(toKnownIds(undefined, knownIds)).toEqual([]);
      expect(toKnownIds([], knownIds)).toEqual([]);
    });
  });
});

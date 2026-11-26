import { describe, expect, it } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";

import { getRankedEntries } from "./getRankedEntries";

const official = createOrientation("party-left", "Lewica", {
  isOfficial: true,
});
const unofficial = createOrientation("party-right", "Prawica", {
  isOfficial: false,
});
const unmarked = createOrientation("party-green", "Zieloni");

const scores = {
  "party-left": { points: 3, maximum: 4 },
  "party-right": { points: 0, maximum: 0 },
};

describe("getRankedEntries()", () => {
  describe("given orientations and scores", () => {
    it("returns one entry per orientation, in the order given, with its value", () => {
      expect(getRankedEntries([unmarked, official], scores)).toEqual([
        { orientation: unmarked, value: undefined, isOfficial: false },
        { orientation: official, value: 75, isOfficial: true },
      ]);
    });

    it("gives no value to an orientation with no score, or no maximum", () => {
      expect(
        getRankedEntries([unofficial, unmarked], scores).map(
          ({ value }) => value,
        ),
      ).toEqual([undefined, undefined]);
    });
  });

  describe("given an orientation marked official", () => {
    it("marks its entry official", () => {
      expect(getRankedEntries([official], scores)[0].isOfficial).toBe(true);
    });
  });

  describe("given an orientation that is not marked official", () => {
    it("does not mark its entry official", () => {
      expect(
        getRankedEntries([unofficial, unmarked], scores).map(
          ({ isOfficial }) => isOfficial,
        ),
      ).toEqual([false, false]);
    });
  });

  describe("given no orientations", () => {
    it("returns an empty list", () => {
      expect(getRankedEntries([], scores)).toEqual([]);
    });
  });
});

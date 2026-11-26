import { describe, expect, it } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";

import { getLinkedOrientations } from "./getLinkedOrientations";

const left = createOrientation("party-left", "Lewica");
const right = createOrientation("party-right", "Prawica");
const green = createOrientation("party-green", "Zieloni");
const parties = [left, right, green];

describe("getLinkedOrientations()", () => {
  describe("given a leader that lists linked orientations", () => {
    it("returns the ones of the list it names, in the leader's order", () => {
      expect(
        getLinkedOrientations(parties, {
          linkedOrientationIds: ["party-green", "party-left"],
        }),
      ).toEqual([green, left]);
    });

    it("leaves out a linked orientation that is not on the list", () => {
      expect(
        getLinkedOrientations([left, right], {
          linkedOrientationIds: ["party-green", "ghost", "party-right"],
        }),
      ).toEqual([right]);
    });
  });

  describe("given a leader that links nothing", () => {
    it("returns an empty list", () => {
      expect(
        getLinkedOrientations(parties, { linkedOrientationIds: [] }),
      ).toEqual([]);
      expect(getLinkedOrientations(parties, {})).toEqual([]);
    });
  });

  describe("given no leader", () => {
    it("returns an empty list", () => {
      expect(getLinkedOrientations(parties)).toEqual([]);
    });
  });
});

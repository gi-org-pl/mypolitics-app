import { describe, expect, it } from "vitest";

import type { ResultEntry, ResultModuleSelection } from "@/types/results";
import { moduleQuiz } from "@/utils/result-modules/resolveResult.fixtures";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { getSelectedOrientations } from "./getSelectedOrientations";

const PARTY_IDS = ["party-left", "anarchist", "party-right", "party-green"];

const socialist: ResultEntry = {
  orientation: createOrientation("socialist", "Socjalista", {
    linkedOrientationIds: ["party-green", "party-left"],
  }),
  value: 100,
};

const getIds = (
  selection: ResultModuleSelection,
  leader?: ResultEntry,
): string[] =>
  getSelectedOrientations(
    { orientationIds: PARTY_IDS, selection },
    { survey: moduleQuiz, leader },
  ).map(({ id }) => id);

describe("getSelectedOrientations()", () => {
  describe("given a record that selects all", () => {
    it("returns every shown orientation of the record, in the author's order", () => {
      expect(getIds("all")).toEqual([
        "party-left",
        "party-right",
        "party-green",
      ]);
    });

    it("returns the same whoever leads", () => {
      expect(getIds("all", socialist)).toEqual([
        "party-left",
        "party-right",
        "party-green",
      ]);
    });
  });

  describe("given a record that selects the ones linked to the leader", () => {
    it("returns the ones the leader links, in the leader's order", () => {
      expect(getIds("linked_to_leader", socialist)).toEqual([
        "party-green",
        "party-left",
      ]);
    });

    it("leaves out a linked orientation the record does not list, and a hidden one", () => {
      const leader: ResultEntry = {
        orientation: createOrientation("liberal", "Liberał", {
          linkedOrientationIds: ["green", "anarchist", "party-right"],
        }),
        value: 60,
      };

      expect(getIds("linked_to_leader", leader)).toEqual(["party-right"]);
    });

    it("returns none when there is no leader", () => {
      expect(getIds("linked_to_leader")).toEqual([]);
    });
  });

  describe("given an orientation whose name has two forms", () => {
    it("returns it in the form of the declared gender", () => {
      const [orientation] = getSelectedOrientations(
        { orientationIds: ["socialist"], selection: "all" },
        { survey: moduleQuiz, gender: "female" },
      );

      expect(orientation.name).toBe("Socjalistka");
    });
  });
});

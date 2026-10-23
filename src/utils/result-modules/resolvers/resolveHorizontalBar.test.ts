import { describe, expect, it } from "vitest";

import type { ResolutionContext, ResultModule } from "@/types/results";
import { getLeader } from "@/utils/result-modules/leader/getLeader";
import { resolveHeader } from "@/utils/result-modules/leader/resolveHeader";
import {
  moduleQuiz,
  moduleQuizContext,
} from "@/utils/result-modules/resolveResult.fixtures";
import { createResultModule } from "@/utils/vitest/results/createResultModule";

import { resolveHorizontalBar } from "./resolveHorizontalBar";

const PARTY_IDS = ["party-left", "party-right", "party-green"];

// The socialist leads, and links the green party and the left party.
const leaderContext: ResolutionContext = {
  ...moduleQuizContext,
  leader: getLeader(resolveHeader(moduleQuizContext)),
};

const resolve = (
  overrides: Partial<ResultModule>,
  context: ResolutionContext = leaderContext,
) =>
  resolveHorizontalBar(
    createResultModule("ranking", "horizontal_bar", overrides),
    context,
  );

describe("resolveHorizontalBar()", () => {
  describe("given a record that selects all and does not group", () => {
    it("returns every shown orientation with its value and official mark, and the visible rows", () => {
      expect(
        resolve({
          orientationIds: ["liberal", "anarchist", "socialist", "party-left"],
          visibleRows: 5,
        }),
      ).toMatchObject({
        type: "horizontal_bar",
        entries: [
          { orientation: { id: "liberal" }, value: 20, isOfficial: false },
          { orientation: { id: "socialist" }, value: 100, isOfficial: false },
          { orientation: { id: "party-left" }, isOfficial: true },
        ],
        visibleRows: 5,
      });
    });

    it("returns no categories", () => {
      expect(resolve({ orientationIds: PARTY_IDS })).not.toHaveProperty(
        "categories",
      );
    });
  });

  describe("given a record that selects the ones linked to the leader", () => {
    it("returns the ones the leader links, in the leader's order", () => {
      expect(
        resolve({ orientationIds: PARTY_IDS, selection: "linked_to_leader" }),
      ).toMatchObject({
        entries: [
          { orientation: { id: "party-green" }, isOfficial: false },
          { orientation: { id: "party-left" }, isOfficial: true },
        ],
      });
    });

    it("returns nothing when there is no leader", () => {
      expect(
        resolve(
          { orientationIds: PARTY_IDS, selection: "linked_to_leader" },
          moduleQuizContext,
        ),
      ).toBeUndefined();
    });

    it("returns nothing when the leader links none of the record's orientations", () => {
      expect(
        resolve({
          orientationIds: ["party-right"],
          selection: "linked_to_leader",
        }),
      ).toBeUndefined();
    });
  });

  describe("given a record that groups by category", () => {
    const resolved = resolve({
      orientationIds: ["liberal", "socialist"],
      groupBy: "category",
      visibleRows: 1,
    });

    it("returns one category per category of the quiz that is not hidden, and the visible rows", () => {
      expect(resolved).toMatchObject({
        type: "horizontal_bar",
        categories: [
          { id: "economy", name: "Gospodarka" },
          { id: "society", name: "Społeczeństwo" },
        ],
        visibleRows: 1,
      });
    });

    it("gives each orientation its value inside the category", () => {
      expect(resolved).toMatchObject({
        categories: [
          {
            entries: [
              { orientation: { id: "liberal" }, value: 0 },
              { orientation: { id: "socialist" }, value: 100 },
            ],
          },
          {
            entries: [
              { orientation: { id: "liberal" }, value: 50 },
              { orientation: { id: "socialist" }, value: 100 },
            ],
          },
        ],
      });
    });

    it("returns no entries beside the categories", () => {
      expect(resolved).not.toHaveProperty("entries");
    });

    it("groups the selected orientations only", () => {
      expect(
        resolve({
          orientationIds: PARTY_IDS,
          selection: "linked_to_leader",
          groupBy: "category",
        }),
      ).toMatchObject({
        categories: [
          {
            entries: [
              { orientation: { id: "party-green" } },
              { orientation: { id: "party-left" } },
            ],
          },
          {
            entries: [
              { orientation: { id: "party-green" } },
              { orientation: { id: "party-left" } },
            ],
          },
        ],
      });
    });

    it("returns nothing when the quiz has no category to show", () => {
      expect(
        resolve(
          { orientationIds: ["liberal"], groupBy: "category" },
          { ...leaderContext, survey: { ...moduleQuiz, categories: [] } },
        ),
      ).toBeUndefined();
    });
  });

  describe("given a record left with no shown orientation", () => {
    it("returns nothing, grouped or not", () => {
      expect(resolve({ orientationIds: [] })).toBeUndefined();
      expect(resolve({ orientationIds: ["anarchist"] })).toBeUndefined();
      expect(
        resolve({ orientationIds: ["anarchist"], groupBy: "category" }),
      ).toBeUndefined();
    });
  });
});

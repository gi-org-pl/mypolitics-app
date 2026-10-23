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
          values: { visibleRows: 5 },
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
        resolve({
          orientationIds: PARTY_IDS,
          values: { selection: "linked_to_leader" },
        }),
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
          {
            orientationIds: PARTY_IDS,
            values: { selection: "linked_to_leader" },
          },
          moduleQuizContext,
        ),
      ).toBeUndefined();
    });

    it("returns nothing when the leader links none of the record's orientations", () => {
      expect(
        resolve({
          orientationIds: ["party-right"],
          values: { selection: "linked_to_leader" },
        }),
      ).toBeUndefined();
    });
  });

  describe("given a record with a text for a selection that leaves nothing", () => {
    const values = {
      selection: "linked_to_leader",
      "label.empty": "Brak najbliższej partii",
    };

    it("returns no rows and the text when there is no leader", () => {
      expect(
        resolve({ orientationIds: PARTY_IDS, values }, moduleQuizContext),
      ).toEqual({
        type: "horizontal_bar",
        entries: [],
        visibleRows: 3,
        emptyLabel: "Brak najbliższej partii",
      });
    });

    it("returns no rows and the text when the leader links none of the record's orientations", () => {
      expect(
        resolve({ orientationIds: ["party-right"], values }),
      ).toMatchObject({ entries: [], emptyLabel: "Brak najbliższej partii" });
    });

    it("returns the rows, and the text unused, when the selection leaves some", () => {
      const resolved = resolve({ orientationIds: PARTY_IDS, values });

      expect(resolved).not.toHaveProperty("emptyLabel");
      expect(resolved).toMatchObject({
        entries: [
          { orientation: { id: "party-green" } },
          { orientation: { id: "party-left" } },
        ],
      });
    });

    it("returns nothing for a text that is blank", () => {
      expect(
        resolve(
          {
            orientationIds: PARTY_IDS,
            values: { selection: "linked_to_leader", "label.empty": "  " },
          },
          moduleQuizContext,
        ),
      ).toBeUndefined();
    });
  });

  describe("given a record that groups by category", () => {
    const resolved = resolve({
      orientationIds: ["liberal", "socialist"],
      values: { groupBy: "category", visibleRows: 1 },
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
          values: { selection: "linked_to_leader", groupBy: "category" },
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
          { orientationIds: ["liberal"], values: { groupBy: "category" } },
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
        resolve({
          orientationIds: ["anarchist"],
          values: { groupBy: "category" },
        }),
      ).toBeUndefined();
    });
  });

  describe("given a record whose settings are left out or are not allowed", () => {
    it("selects all, does not group, and returns three visible rows", () => {
      const resolved = resolve({ orientationIds: PARTY_IDS });

      expect(resolved).toMatchObject({
        entries: [
          { orientation: { id: "party-left" } },
          { orientation: { id: "party-right" } },
          { orientation: { id: "party-green" } },
        ],
        visibleRows: 3,
      });
      expect(
        resolve({
          orientationIds: PARTY_IDS,
          values: { selection: "leader", groupBy: true, visibleRows: 0 },
        }),
      ).toEqual(resolved);
    });
  });

  describe("given a record that holds a setting of another type", () => {
    it("does not read it", () => {
      expect(
        resolve({ orientationIds: PARTY_IDS, values: { marker: 20 } }),
      ).toEqual(resolve({ orientationIds: PARTY_IDS }));
    });
  });
});

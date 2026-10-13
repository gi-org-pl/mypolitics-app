import { describe, expect, it } from "vitest";

import type { ResultModule } from "@/types/results";
import { moduleQuizContext } from "@/utils/result-modules/resolveResult.fixtures";
import { createResultModule } from "@/utils/vitest/results/createResultModule";

import { resolveMultiAxis } from "./resolveMultiAxis";

const resolve = (overrides: Partial<ResultModule>) =>
  resolveMultiAxis(
    createResultModule("ideologies", "multi_axis", overrides),
    moduleQuizContext,
  );

describe("resolveMultiAxis()", () => {
  describe("given a record that groups its axes by category", () => {
    it("returns one group per category with the axes of that category, and the marker", () => {
      expect(
        resolve({
          axisIds: ["society-axis", "economy-axis"],
          groupBy: "category",
          marker: 30,
        }),
      ).toMatchObject({
        type: "multi_axis",
        groups: [
          {
            name: "Gospodarka",
            axes: [
              {
                id: "economy-axis",
                start: { orientation: { id: "left" }, value: 100 },
                end: { orientation: { id: "right" }, value: 0 },
              },
            ],
          },
          {
            name: "Społeczeństwo",
            axes: [
              {
                id: "society-axis",
                start: { orientation: { id: "progress" }, value: 100 },
                end: { orientation: { id: "tradition" }, value: 0 },
              },
            ],
          },
        ],
        marker: 30,
      });
    });
  });

  describe("given a record that does not group", () => {
    it("returns one group with no name holding every axis", () => {
      const resolved = resolve({ axisIds: ["society-axis", "economy-axis"] });

      expect(resolved?.groups).toHaveLength(1);
      expect(resolved?.groups[0].name).toBeUndefined();
      expect(resolved?.groups[0].axes.map(({ id }) => id)).toEqual([
        "society-axis",
        "economy-axis",
      ]);
    });
  });

  describe("given an axis that lacks a side among the others", () => {
    it("leaves it out", () => {
      expect(
        resolve({ axisIds: ["one-sided", "economy-axis"] })?.groups[0].axes.map(
          ({ id }) => id,
        ),
      ).toEqual(["economy-axis"]);
    });
  });

  describe("given a record left with no axis that has both sides", () => {
    it("returns nothing", () => {
      expect(resolve({ axisIds: [] })).toBeUndefined();
      expect(resolve({ axisIds: ["one-sided"] })).toBeUndefined();
      expect(
        resolve({ axisIds: ["one-sided"], groupBy: "category" }),
      ).toBeUndefined();
    });
  });
});

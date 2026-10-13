import { describe, expect, it } from "vitest";

import type { ResultModule } from "@/types/results";
import { moduleQuizContext } from "@/utils/result-modules/resolveResult.fixtures";
import { createResultModule } from "@/utils/vitest/results/createResultModule";

import { resolveDoubleAxis } from "./resolveDoubleAxis";

const resolve = (overrides: Partial<ResultModule>) =>
  resolveDoubleAxis(
    createResultModule("economy", "double_axis", overrides),
    moduleQuizContext,
  );

describe("resolveDoubleAxis()", () => {
  describe("given a record that lists an axis with both sides", () => {
    it("returns the axis with both entries, and the marker", () => {
      expect(
        resolve({ axisIds: ["economy-axis"], values: { marker: 40 } }),
      ).toMatchObject({
        type: "double_axis",
        axis: {
          id: "economy-axis",
          name: "Gospodarka",
          start: { orientation: { id: "left" }, value: 100 },
          end: { orientation: { id: "right" }, value: 0 },
        },
        marker: 40,
      });
    });

    it("returns a marker that is switched off as it is", () => {
      expect(
        resolve({ axisIds: ["economy-axis"], values: { marker: null } })
          ?.marker,
      ).toBe(false);
    });
  });

  describe("given a record that lists several axes", () => {
    it("returns the first one", () => {
      expect(
        resolve({ axisIds: ["society-axis", "economy-axis"] })?.axis.id,
      ).toBe("society-axis");
    });

    it("returns nothing when the first one lacks a side, whatever follows", () => {
      expect(
        resolve({ axisIds: ["one-sided", "economy-axis"] }),
      ).toBeUndefined();
    });
  });

  describe("given a record with no axis", () => {
    it("returns nothing", () => {
      expect(resolve({ axisIds: [] })).toBeUndefined();
      expect(resolve({ axisIds: ["ghost"] })).toBeUndefined();
    });
  });

  describe("given an axis that lacks a side", () => {
    it("returns nothing", () => {
      expect(resolve({ axisIds: ["one-sided"] })).toBeUndefined();
    });
  });

  describe("given a record whose marker is left out, is not allowed, or is not the only setting", () => {
    it("returns the default marker for the first two, and reads no setting of another type", () => {
      expect(resolve({ axisIds: ["economy-axis"] })?.marker).toBe(50);
      expect(
        resolve({ axisIds: ["economy-axis"], values: { marker: "40" } })
          ?.marker,
      ).toBe(50);
      expect(
        resolve({
          axisIds: ["economy-axis"],
          values: { marker: 40, groupBy: "category", sortBy: "name" },
        }),
      ).toEqual({ type: "double_axis", axis: expect.anything(), marker: 40 });
    });
  });
});

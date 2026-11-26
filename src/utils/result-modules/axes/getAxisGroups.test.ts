import { describe, expect, it } from "vitest";

import type { ResultModuleGrouping } from "@/types/results";
import { moduleQuizContext } from "@/utils/result-modules/resolveResult.fixtures";

import { getAxisGroups } from "./getAxisGroups";

const getGroups = (
  axisIds: string[],
  groupBy: ResultModuleGrouping,
): [string | undefined, string[]][] =>
  getAxisGroups({ axisIds, groupBy }, moduleQuizContext).map(
    ({ name, axes }) => [name, axes.map(({ id }) => id)],
  );

describe("getAxisGroups()", () => {
  describe("given a record that groups by category", () => {
    it("returns one group per category, in the quiz's order, with the record's axes of that category", () => {
      expect(
        getGroups(["society-axis", "mixed", "economy-axis"], "category"),
      ).toEqual([
        ["Gospodarka", ["mixed", "economy-axis"]],
        ["Społeczeństwo", ["society-axis"]],
      ]);
    });

    it("returns each axis with its two poles", () => {
      const [economy] = getAxisGroups(
        { axisIds: ["economy-axis"], groupBy: "category" },
        moduleQuizContext,
      );

      expect(economy).toMatchObject({
        name: "Gospodarka",
        axes: [
          {
            id: "economy-axis",
            name: "Gospodarka",
            start: { orientation: { id: "left" }, value: 100 },
            end: { orientation: { id: "right" }, value: 0 },
          },
        ],
      });
    });

    it("puts an axis whose category matches no category of the quiz in a last group with no name", () => {
      expect(getGroups(["loose", "economy-axis"], "category")).toEqual([
        ["Gospodarka", ["economy-axis"]],
        [undefined, ["loose"]],
      ]);
    });

    it("leaves out a category none of the record's axes belongs to", () => {
      expect(getGroups(["society-axis"], "category")).toEqual([
        ["Społeczeństwo", ["society-axis"]],
      ]);
    });
  });

  describe("given a record that does not group", () => {
    it("returns one group with no name holding every axis, in the author's order", () => {
      expect(
        getGroups(["society-axis", "loose", "economy-axis"], "none"),
      ).toEqual([[undefined, ["society-axis", "loose", "economy-axis"]]]);
    });
  });

  describe("given an axis that lacks a side", () => {
    it("leaves it out of its group", () => {
      expect(getGroups(["one-sided", "economy-axis"], "category")).toEqual([
        ["Gospodarka", ["economy-axis"]],
      ]);
      expect(getGroups(["one-sided", "economy-axis"], "none")).toEqual([
        [undefined, ["economy-axis"]],
      ]);
    });

    it("does not return a group left empty", () => {
      expect(getGroups(["one-sided", "society-axis"], "category")).toEqual([
        ["Społeczeństwo", ["society-axis"]],
      ]);
    });
  });

  describe("given a record left with no axis that has both sides", () => {
    it("returns no group", () => {
      expect(getGroups([], "none")).toEqual([]);
      expect(getGroups([], "category")).toEqual([]);
      expect(getGroups(["one-sided", "ghost"], "none")).toEqual([]);
      expect(getGroups(["one-sided"], "category")).toEqual([]);
    });
  });
});

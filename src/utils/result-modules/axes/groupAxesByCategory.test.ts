import { describe, expect, it } from "vitest";

import type { SurveyAxis } from "@/types/survey";
import { createSurveyAxis } from "@/utils/vitest/survey/createSurveyAxis";
import { createSurveyCategory } from "@/utils/vitest/survey/createSurveyCategory";

import { groupAxesByCategory } from "./groupAxesByCategory";

const categories = [
  createSurveyCategory("economy", { name: "Gospodarka" }),
  createSurveyCategory("society", { name: "Społeczeństwo" }),
  createSurveyCategory("control", { name: "Kontrolne", isHidden: true }),
];

const toAxis = (id: string, categoryName?: string): SurveyAxis =>
  createSurveyAxis(id, ["left"], ["right"], { categoryName });

const group = (axes: SurveyAxis[]): [string | undefined, string[]][] =>
  groupAxesByCategory(axes, categories).map(({ name, axes: grouped }) => [
    name,
    grouped.map(({ id }) => id),
  ]);

describe("groupAxesByCategory()", () => {
  describe("given axes of the categories of the quiz", () => {
    it("returns one group per category that is not hidden, in the quiz's order, named after it", () => {
      expect(
        group([
          toAxis("society-axis", "Społeczeństwo"),
          toAxis("economy-axis", "Gospodarka"),
        ]),
      ).toEqual([
        ["Gospodarka", ["economy-axis"]],
        ["Społeczeństwo", ["society-axis"]],
        [undefined, []],
      ]);
    });

    it("keeps the axes of a group in the order given", () => {
      expect(
        group([
          toAxis("taxes", "Gospodarka"),
          toAxis("society-axis", "Społeczeństwo"),
          toAxis("economy-axis", "Gospodarka"),
        ])[0],
      ).toEqual(["Gospodarka", ["taxes", "economy-axis"]]);
    });

    it("returns a category none of the axes belongs to as an empty group", () => {
      expect(group([toAxis("economy-axis", "Gospodarka")])[1]).toEqual([
        "Społeczeństwo",
        [],
      ]);
    });
  });

  describe("given an axis whose category matches no category of the quiz", () => {
    it("puts it in a last group with no name", () => {
      expect(
        group([
          toAxis("loose", "Ekologia"),
          toAxis("economy-axis", "Gospodarka"),
          toAxis("free"),
        ]),
      ).toEqual([
        ["Gospodarka", ["economy-axis"]],
        ["Społeczeństwo", []],
        [undefined, ["loose", "free"]],
      ]);
    });
  });

  describe("given an axis of a hidden category", () => {
    it("puts it in no group", () => {
      expect(group([toAxis("control-axis", "Kontrolne")])).toEqual([
        ["Gospodarka", []],
        ["Społeczeństwo", []],
        [undefined, []],
      ]);
    });
  });

  describe("given a quiz with no category", () => {
    it("returns every axis in the one group with no name", () => {
      expect(
        groupAxesByCategory([toAxis("economy-axis", "Gospodarka")], []).map(
          ({ name, axes }) => [name, axes.map(({ id }) => id)],
        ),
      ).toEqual([[undefined, ["economy-axis"]]]);
    });
  });

  describe("given no axes", () => {
    it("returns only empty groups", () => {
      expect(group([])).toEqual([
        ["Gospodarka", []],
        ["Społeczeństwo", []],
        [undefined, []],
      ]);
    });
  });
});

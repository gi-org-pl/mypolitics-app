import { describe, expect, it } from "vitest";

import type { SurveyAxis, SurveyCategory } from "@/types/survey";
import { createSurveyAxis } from "@/utils/vitest/survey/createSurveyAxis";
import { createSurveyCategory } from "@/utils/vitest/survey/createSurveyCategory";

import { getCategoryAxes } from "./getCategoryAxes";

const economy = createSurveyCategory("economy", { name: "Gospodarka" });
const society = createSurveyCategory("society", { name: "Społeczeństwo" });
const categories = [economy, society];

const toAxis = (id: string, categoryName?: string): SurveyAxis =>
  createSurveyAxis(id, ["left"], ["right"], { categoryName });

const axes = [
  toAxis("taxes", "Gospodarka"),
  toAxis("loose", "Ekologia"),
  toAxis("society-axis", "Społeczeństwo"),
  toAxis("economy-axis", "Gospodarka"),
  toAxis("free"),
];

const getIds = (category?: SurveyCategory): string[] =>
  getCategoryAxes(axes, categories, category).map(({ id }) => id);

describe("getCategoryAxes()", () => {
  describe("given a category of the quiz", () => {
    it("returns the axes that belong to it, in the order given", () => {
      expect(getIds(economy)).toEqual(["taxes", "economy-axis"]);
      expect(getIds(society)).toEqual(["society-axis"]);
    });

    it("returns an empty list when none of the axes belongs to it", () => {
      expect(getCategoryAxes([axes[1]], categories, economy)).toEqual([]);
    });
  });

  describe("given no category", () => {
    it("returns the axes that belong to no category of the quiz", () => {
      expect(getIds()).toEqual(["loose", "free"]);
    });
  });

  describe("given a category the quiz does not have", () => {
    it("returns an empty list", () => {
      const ecology = createSurveyCategory("ecology", { name: "Ekologia" });

      expect(getIds(ecology)).toEqual([]);
    });
  });
});

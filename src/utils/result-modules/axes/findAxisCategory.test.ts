import { describe, expect, it } from "vitest";

import { createSurveyCategory } from "@/utils/vitest/survey/createSurveyCategory";

import { findAxisCategory } from "./findAxisCategory";

const economy = createSurveyCategory("economy", { name: "Gospodarka" });
const control = createSurveyCategory("control", {
  name: "Kontrolne",
  isHidden: true,
});
const nameless = createSurveyCategory("nameless", { name: undefined });
const categories = [nameless, economy, control];

describe("findAxisCategory()", () => {
  describe("given an axis that names a category of the quiz", () => {
    it("returns that category", () => {
      expect(findAxisCategory({ categoryName: "Gospodarka" }, categories)).toBe(
        economy,
      );
    });

    it("returns it when it is hidden as well", () => {
      expect(findAxisCategory({ categoryName: "Kontrolne" }, categories)).toBe(
        control,
      );
    });

    it("returns the first of two categories with that name", () => {
      const second = createSurveyCategory("economy-2", { name: "Gospodarka" });

      expect(
        findAxisCategory({ categoryName: "Gospodarka" }, [economy, second]),
      ).toBe(economy);
    });
  });

  describe("given an axis that names a category the quiz does not have", () => {
    it("returns nothing", () => {
      expect(
        findAxisCategory({ categoryName: "Ekologia" }, categories),
      ).toBeUndefined();
      expect(
        findAxisCategory({ categoryName: "Gospodarka" }, []),
      ).toBeUndefined();
    });
  });

  describe("given an axis that names no category", () => {
    it("returns nothing, even when a category has no name", () => {
      expect(findAxisCategory({}, categories)).toBeUndefined();
    });
  });
});

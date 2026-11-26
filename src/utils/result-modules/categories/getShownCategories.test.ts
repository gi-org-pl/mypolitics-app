import { describe, expect, it } from "vitest";

import { createSurveyCategory } from "@/utils/vitest/survey/createSurveyCategory";

import { getShownCategories } from "./getShownCategories";

describe("getShownCategories()", () => {
  describe("given the categories of a quiz", () => {
    it("returns the ones that are not hidden, in the quiz's order", () => {
      const economy = createSurveyCategory("economy");
      const society = createSurveyCategory("society");

      expect(
        getShownCategories([
          society,
          createSurveyCategory("control", { isHidden: true }),
          economy,
        ]),
      ).toEqual([society, economy]);
    });

    it("keeps a category that has no name", () => {
      const nameless = createSurveyCategory("nameless", { name: undefined });

      expect(getShownCategories([nameless])).toEqual([nameless]);
    });
  });

  describe("given no category, or only hidden ones", () => {
    it("returns an empty list", () => {
      expect(getShownCategories([])).toEqual([]);
      expect(
        getShownCategories([
          createSurveyCategory("control", { isHidden: true }),
        ]),
      ).toEqual([]);
    });
  });
});

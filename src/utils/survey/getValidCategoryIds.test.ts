import { describe, expect, it } from "vitest";

import { createSurvey } from "@/utils/vitest/createSurvey";
import { createSurveyCategory } from "@/utils/vitest/createSurveyCategory";

import { getValidCategoryIds } from "./getValidCategoryIds";

// Five visible categories and a hidden one: the limit is three.
const survey = createSurvey({
  categories: [
    ...["a", "b", "c", "d", "e"].map((id) => createSurveyCategory(id)),
    createSurveyCategory("hidden", { isHidden: true }),
    createSurveyCategory("unnamed", { name: undefined }),
  ],
});

describe("getValidCategoryIds()", () => {
  describe("given identifiers of visible categories", () => {
    it("keeps them in the order given, not in the order of the quiz", () => {
      expect(getValidCategoryIds(survey, ["c", "a"])).toEqual(["c", "a"]);
    });

    it("keeps each of them once, where it came first", () => {
      expect(getValidCategoryIds(survey, ["b", "a", "b", "a", "c"])).toEqual([
        "b",
        "a",
        "c",
      ]);
    });

    it("cuts them to the limit and keeps the first ones", () => {
      expect(getValidCategoryIds(survey, ["e", "d", "c", "b", "a"])).toEqual([
        "e",
        "d",
        "c",
      ]);
    });

    it("cuts them to one in a quiz with two visible categories", () => {
      expect(
        getValidCategoryIds(createSurvey(), ["ecology", "economy"]),
      ).toEqual(["ecology"]);
    });
  });

  describe("given identifiers that are not visible categories", () => {
    it("drops a hidden category, a category without a name and an unknown one", () => {
      expect(
        getValidCategoryIds(survey, ["hidden", "a", "unnamed", "unknown", "b"]),
      ).toEqual(["a", "b"]);
    });

    it("does not count a dropped identifier towards the limit", () => {
      expect(
        getValidCategoryIds(survey, ["unknown", "hidden", "a", "b", "c", "d"]),
      ).toEqual(["a", "b", "c"]);
    });

    it("drops anything that is not text", () => {
      expect(
        getValidCategoryIds(survey, [
          7,
          null,
          undefined,
          { id: "a" },
          ["a"],
          "a",
        ]),
      ).toEqual(["a"]);
    });
  });

  describe("given nothing to keep", () => {
    it("returns an empty list for no identifiers", () => {
      expect(getValidCategoryIds(survey, [])).toEqual([]);
    });

    it("returns an empty list in a quiz without category select", () => {
      const withOne = createSurvey({ categories: [createSurveyCategory("a")] });

      expect(getValidCategoryIds(withOne, ["a"])).toEqual([]);
    });
  });
});

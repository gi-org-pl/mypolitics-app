import { describe, expect, it } from "vitest";

import {
  moduleQuiz,
  moduleQuizContext,
} from "@/utils/result-modules/resolveResult.fixtures";

import { getRankedCategories } from "./getRankedCategories";
import { getShownOrientations } from "./getShownOrientations";

const getOrientations = (orientationIds: string[]) =>
  getShownOrientations(orientationIds, moduleQuizContext);

describe("getRankedCategories()", () => {
  describe("given orientations and a quiz with categories", () => {
    const categories = getRankedCategories(
      getOrientations(["liberal", "socialist"]),
      moduleQuizContext,
    );

    it("returns one ranking per category that is not hidden, in the quiz's order", () => {
      expect(categories.map(({ id, name }) => [id, name])).toEqual([
        ["economy", "Gospodarka"],
        ["society", "Społeczeństwo"],
      ]);
    });

    it("lists the same orientations in every category, in the order given", () => {
      expect(
        categories.map(({ entries }) =>
          entries.map(({ orientation }) => orientation.id),
        ),
      ).toEqual([
        ["liberal", "socialist"],
        ["liberal", "socialist"],
      ]);
    });

    it("gives each orientation its value inside the category", () => {
      expect(
        categories.map(({ entries }) => entries.map(({ value }) => value)),
      ).toEqual([
        [0, 100],
        [50, 100],
      ]);
    });

    it("carries the official mark of each orientation", () => {
      const [economy] = getRankedCategories(
        getOrientations(["party-left", "party-right"]),
        moduleQuizContext,
      );

      expect(economy.entries.map(({ isOfficial }) => isOfficial)).toEqual([
        true,
        false,
      ]);
    });
  });

  describe("given a category in which none of the orientations has a value", () => {
    it("still returns the category, with entries that have no value", () => {
      const categories = getRankedCategories(
        getOrientations(["left", "right"]),
        moduleQuizContext,
      );

      expect(categories.map(({ id }) => id)).toEqual(["economy", "society"]);
      expect(
        categories[1].entries.map(({ orientation }) => orientation.id),
      ).toEqual(["left", "right"]);
      expect(categories[1].entries.map(({ value }) => value)).toEqual([
        undefined,
        undefined,
      ]);
    });
  });

  describe("given a quiz with no category to show", () => {
    it("returns an empty list", () => {
      const orientations = getOrientations(["liberal"]);

      expect(
        getRankedCategories(orientations, {
          ...moduleQuizContext,
          survey: { ...moduleQuiz, categories: [] },
        }),
      ).toEqual([]);
      expect(
        getRankedCategories(orientations, {
          ...moduleQuizContext,
          survey: {
            ...moduleQuiz,
            categories: moduleQuiz.categories.filter(
              ({ isHidden }) => isHidden,
            ),
          },
        }),
      ).toEqual([]);
    });
  });
});

import { describe, expect, it } from "vitest";

import {
  choosingFriend,
  friendComparison,
  twoViewComparison,
} from "../ResultsComparison.fixtures";
import { ComparisonView } from "../ResultsComparison.types";
import { chooseComparisonView } from "./chooseComparisonView";

describe("chooseComparisonView()", () => {
  describe("given a view the comparison has", () => {
    it("shows it", () => {
      expect(
        chooseComparisonView(twoViewComparison, ComparisonView.Questions),
      ).toEqual({ ...twoViewComparison, view: ComparisonView.Questions });
    });

    it("keeps everything else of the comparison", () => {
      const state = chooseComparisonView(
        twoViewComparison,
        ComparisonView.Questions,
      );

      expect(state).toMatchObject({
        other: twoViewComparison.other,
        score: twoViewComparison.score,
        views: twoViewComparison.views,
      });
    });
  });

  describe("given a view the comparison does not have", () => {
    it("changes nothing", () => {
      expect(
        chooseComparisonView(friendComparison, ComparisonView.Questions),
      ).toBe(friendComparison);
    });
  });

  describe("while no comparison runs", () => {
    it("changes nothing", () => {
      expect(chooseComparisonView(choosingFriend, ComparisonView.Results)).toBe(
        choosingFriend,
      );
    });
  });
});

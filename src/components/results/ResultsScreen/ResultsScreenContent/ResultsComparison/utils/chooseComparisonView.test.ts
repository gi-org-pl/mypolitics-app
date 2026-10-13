import { describe, expect, it } from "vitest";

import {
  choosingFriend,
  friendComparison,
  orientationComparison,
} from "../ResultsComparison.fixtures";
import { ComparisonView } from "../ResultsComparison.types";
import { chooseComparisonView } from "./chooseComparisonView";

describe("chooseComparisonView()", () => {
  describe("given a view the comparison has", () => {
    it("shows it", () => {
      expect(
        chooseComparisonView(friendComparison, ComparisonView.Questions),
      ).toEqual({ ...friendComparison, view: ComparisonView.Questions });
    });

    it("keeps everything else of the comparison", () => {
      const state = chooseComparisonView(
        friendComparison,
        ComparisonView.Questions,
      );

      expect(state).toMatchObject({
        other: friendComparison.other,
        score: friendComparison.score,
        views: friendComparison.views,
      });
    });
  });

  describe("given a view the comparison does not have", () => {
    it("changes nothing", () => {
      expect(
        chooseComparisonView(orientationComparison, ComparisonView.Results),
      ).toBe(orientationComparison);
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

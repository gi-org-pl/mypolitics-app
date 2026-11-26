import { describe, expect, it } from "vitest";

import { ComparisonMode, type OrientationSide } from "@/types/comparison";
import { getAgreementScore } from "@/utils/comparison/getAgreementScore";
import { friendModules } from "@/utils/result-modules/resolvedModules.fixtures";
import { createOrientation } from "@/utils/vitest/createOrientation";

import {
  moduleFriendResult,
  moduleOrientations,
  moduleTaker,
} from "../ResultsComparison.fixtures";
import { ComparisonStatus, ComparisonView } from "../ResultsComparison.types";
import { toComparingState } from "./toComparingState";
import { toFriendSide } from "./toFriendSide";

const friend = toFriendSide(moduleFriendResult, "Znajomy");
const orientation: OrientationSide = {
  mode: ComparisonMode.Orientation,
  orientation: moduleOrientations[0],
};

describe("toComparingState()", () => {
  describe("given a friend", () => {
    const state = toComparingState(friend, moduleTaker);

    it("starts a comparison with the friend", () => {
      expect(state.status).toBe(ComparisonStatus.Comparing);
      expect(state.other).toBe(friend);
    });

    it("counts the agreement score from the answers of both", () => {
      // The taker chose the first answer of q1-q4; the friend the same one of
      // q3 only, and q5 the taker left.
      expect(state.score).toBe(25);
      expect(state.score).toBe(
        getAgreementScore(
          moduleTaker.survey,
          moduleTaker.result.answers,
          friend,
        ),
      );
    });

    it("resolves the result of the friend as the result of the taker, against the leader of the taker", () => {
      expect(state.modules).toEqual(friendModules);
      expect(state.modules?.map(({ id }) => id)).toEqual(
        moduleTaker.resolved.modules.map(({ id }) => id),
      );
    });

    it("has the results view, and shows it", () => {
      expect(state.views).toEqual([ComparisonView.Results]);
      expect(state.view).toBe(ComparisonView.Results);
    });
  });

  describe("given an orientation", () => {
    const state = toComparingState(orientation, moduleTaker);

    it("starts a comparison with the orientation", () => {
      expect(state.status).toBe(ComparisonStatus.Comparing);
      expect(state.other).toBe(orientation);
    });

    it("counts the agreement score from the answers that list the orientation", () => {
      expect(state.score).toBe(
        getAgreementScore(
          moduleTaker.survey,
          moduleTaker.result.answers,
          orientation,
        ),
      );
      expect(state.score).toEqual(expect.any(Number));
    });

    it("resolves nothing: an orientation has no result", () => {
      expect(state.modules).toBeUndefined();
    });

    it("has no view yet", () => {
      expect(state.views).toEqual([]);
      expect(state.view).toBeUndefined();
    });
  });

  describe("given an other side no question can be compared on", () => {
    it("has no score", () => {
      expect(
        toComparingState(
          {
            mode: ComparisonMode.Orientation,
            orientation: createOrientation("unlisted"),
          },
          moduleTaker,
        ).score,
      ).toBeUndefined();
    });
  });
});

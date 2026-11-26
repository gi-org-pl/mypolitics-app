import { describe, expect, it } from "vitest";

import { ComparisonMode } from "@/types/comparison";

import {
  choosingOrientation,
  fetchingFriend,
  friendComparison,
  moduleOrientations,
  moduleTaker,
  orientationComparison,
  refusedOwn,
} from "../ResultsComparison.fixtures";
import type { ComparisonState } from "../ResultsComparison.types";
import { pickComparisonOrientation } from "./pickComparisonOrientation";

const [first, second] = moduleOrientations;

const pick = (state: ComparisonState, orientationId: string) =>
  pickComparisonOrientation(
    state,
    orientationId,
    moduleOrientations,
    moduleTaker,
  );

describe("pickComparisonOrientation()", () => {
  describe("given an offered orientation", () => {
    it("starts the comparison with it", () => {
      expect(pick(choosingOrientation, first.id)).toEqual(
        orientationComparison,
      );
    });

    it("compares with the orientation that was picked", () => {
      expect(pick(choosingOrientation, second.id)).toMatchObject({
        other: { mode: ComparisonMode.Orientation, orientation: second },
      });
    });

    it("starts it after a refusal as well", () => {
      expect(pick(refusedOwn, first.id)).toEqual(orientationComparison);
    });
  });

  describe("given an orientation that is not offered", () => {
    it("changes nothing", () => {
      expect(pick(choosingOrientation, "secret")).toBe(choosingOrientation);
      expect(pick(choosingOrientation, "")).toBe(choosingOrientation);
    });
  });

  describe("while a result is on the way", () => {
    it("changes nothing", () => {
      expect(pick(fetchingFriend, first.id)).toBe(fetchingFriend);
    });
  });

  describe("while a comparison runs", () => {
    it("changes nothing: the comparison has to be ended first", () => {
      expect(pick(friendComparison, first.id)).toBe(friendComparison);
    });
  });
});

import { describe, expect, it } from "vitest";

import { moduleQuizContext } from "@/utils/result-modules/resolveResult.fixtures";
import { createSurveyAxis } from "@/utils/vitest/survey/createSurveyAxis";

import { toResolvedAxis } from "./toResolvedAxis";

describe("toResolvedAxis()", () => {
  describe("given an axis with a shown orientation on both sides", () => {
    it("returns the negative side as the start entry and the positive side as the end entry", () => {
      expect(
        toResolvedAxis(
          createSurveyAxis("economy-axis", ["left"], ["right"], {
            name: "Gospodarka",
          }),
          moduleQuizContext,
        ),
      ).toMatchObject({
        id: "economy-axis",
        name: "Gospodarka",
        start: { orientation: { id: "left" }, value: 100 },
        end: { orientation: { id: "right" }, value: 0 },
      });
    });

    it("returns an axis of any type", () => {
      expect(
        toResolvedAxis(
          createSurveyAxis("compass-y", ["progress"], ["tradition"], {
            type: "compass_y_axis",
          }),
          moduleQuizContext,
        ),
      ).toMatchObject({
        id: "compass-y",
        start: { orientation: { id: "progress" } },
        end: { orientation: { id: "tradition" } },
      });
    });

    it("returns an axis that has no name without one", () => {
      expect(
        toResolvedAxis(
          createSurveyAxis("nameless", ["left"], ["right"], {
            name: undefined,
          }),
          moduleQuizContext,
        )?.name,
      ).toBeUndefined();
    });
  });

  describe("given an axis with several orientations on a side", () => {
    it("gives the side its first shown orientation and the value of the whole side", () => {
      expect(
        toResolvedAxis(
          createSurveyAxis("mixed", ["secret", "left", "green"], ["right"]),
          moduleQuizContext,
        ),
      ).toMatchObject({
        start: { orientation: { id: "left" }, value: 80 },
        end: { orientation: { id: "right" }, value: 0 },
      });
    });
  });

  describe("given an axis that lacks a side", () => {
    it("returns nothing when a side is empty", () => {
      expect(
        toResolvedAxis(
          createSurveyAxis("empty-end", ["left"], []),
          moduleQuizContext,
        ),
      ).toBeUndefined();
      expect(
        toResolvedAxis(
          createSurveyAxis("empty-start", [], ["right"]),
          moduleQuizContext,
        ),
      ).toBeUndefined();
    });

    it("returns nothing when a side has no shown orientation", () => {
      expect(
        toResolvedAxis(
          createSurveyAxis("one-sided", ["left"], ["secret"]),
          moduleQuizContext,
        ),
      ).toBeUndefined();
    });
  });
});

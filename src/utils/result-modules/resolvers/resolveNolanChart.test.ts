import { describe, expect, it } from "vitest";

import type { ResolutionContext, ResultModule } from "@/types/results";
import {
  moduleQuiz,
  moduleQuizContext,
} from "@/utils/result-modules/resolveResult.fixtures";
import { createResultModule } from "@/utils/vitest/results/createResultModule";
import { createSurveyAxis } from "@/utils/vitest/survey/createSurveyAxis";

import { resolveNolanChart } from "./resolveNolanChart";

const resolve = (
  overrides: Partial<ResultModule>,
  context: ResolutionContext = moduleQuizContext,
) =>
  resolveNolanChart(
    createResultModule("compass", "nolan_chart", overrides),
    context,
  );

describe("resolveNolanChart()", () => {
  describe("given a record that lists both compass axes", () => {
    it("returns the compass_x_axis as the horizontal axis and the compass_y_axis as the vertical one", () => {
      expect(resolve({ axisIds: ["compass-x", "compass-y"] })).toMatchObject({
        type: "nolan_chart",
        horizontal: {
          id: "compass-x",
          name: "gospodarczo",
          start: { orientation: { id: "left" }, value: 100 },
          end: { orientation: { id: "right" }, value: 0 },
        },
        vertical: {
          id: "compass-y",
          name: "światopoglądowo",
          start: { orientation: { id: "progress" }, value: 100 },
          end: { orientation: { id: "tradition" }, value: 0 },
        },
      });
    });

    it("finds them by their type, in whatever order the record lists them", () => {
      const resolved = resolve({ axisIds: ["compass-y", "compass-x"] });

      expect(resolved?.horizontal.id).toBe("compass-x");
      expect(resolved?.vertical.id).toBe("compass-y");
    });

    it("returns the labels and the colours of the record as read", () => {
      const labels = { centre: "Centrum", topLeftModerate: "Lewica" };
      const colors = { topLeft: "#ff0000" };

      expect(
        resolve({ axisIds: ["compass-x", "compass-y"], labels, colors }),
      ).toMatchObject({ labels, colors });
    });

    it("does not use an axis of the record that is not a compass axis", () => {
      const resolved = resolve({
        axisIds: ["economy-axis", "compass-x", "society-axis", "compass-y"],
      });

      expect(resolved?.horizontal.id).toBe("compass-x");
      expect(resolved?.vertical.id).toBe("compass-y");
    });
  });

  describe("given a record that does not list both compass axes", () => {
    it("returns nothing", () => {
      expect(resolve({ axisIds: [] })).toBeUndefined();
      expect(resolve({ axisIds: ["compass-x"] })).toBeUndefined();
      expect(resolve({ axisIds: ["compass-y"] })).toBeUndefined();
      expect(
        resolve({ axisIds: ["economy-axis", "society-axis"] }),
      ).toBeUndefined();
    });

    it("does not take a compass axis of the quiz the record does not list", () => {
      expect(
        resolve({ axisIds: ["compass-x", "economy-axis"] }),
      ).toBeUndefined();
    });
  });

  describe("given a compass axis that lacks a side", () => {
    it("returns nothing when a side has no shown orientation", () => {
      const survey = {
        ...moduleQuiz,
        axes: [
          createSurveyAxis("compass-x", ["left"], ["right"], {
            type: "compass_x_axis",
          }),
          createSurveyAxis("compass-y", ["progress"], ["secret"], {
            type: "compass_y_axis",
          }),
        ],
      };

      expect(
        resolve(
          { axisIds: ["compass-x", "compass-y"] },
          { ...moduleQuizContext, survey },
        ),
      ).toBeUndefined();
    });

    it("returns nothing when a side is empty", () => {
      const survey = {
        ...moduleQuiz,
        axes: [
          createSurveyAxis("compass-x", [], ["right"], {
            type: "compass_x_axis",
          }),
          createSurveyAxis("compass-y", ["progress"], ["tradition"], {
            type: "compass_y_axis",
          }),
        ],
      };

      expect(
        resolve(
          { axisIds: ["compass-x", "compass-y"] },
          { ...moduleQuizContext, survey },
        ),
      ).toBeUndefined();
    });
  });
});

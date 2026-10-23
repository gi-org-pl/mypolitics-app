import { describe, expect, it } from "vitest";

import { moduleQuiz } from "@/utils/result-modules/resolveResult.fixtures";

import { getRecordAxes } from "./getRecordAxes";

const getIds = (axisIds: string[]): string[] =>
  getRecordAxes({ axisIds }, moduleQuiz).map(({ id }) => id);

describe("getRecordAxes()", () => {
  describe("given a record that lists axes of the quiz", () => {
    it("returns them in the author's order", () => {
      expect(getIds(["compass-y", "economy-axis", "society-axis"])).toEqual([
        "compass-y",
        "economy-axis",
        "society-axis",
      ]);
    });

    it("returns each axis as the quiz has it", () => {
      expect(getRecordAxes({ axisIds: ["economy-axis"] }, moduleQuiz)).toEqual([
        moduleQuiz.axes[0],
      ]);
    });
  });

  describe("given an identifier of an axis the quiz does not have", () => {
    it("leaves it out", () => {
      expect(getIds(["ghost", "economy-axis"])).toEqual(["economy-axis"]);
    });
  });

  describe("given a record that lists no axis", () => {
    it("returns an empty list", () => {
      expect(getIds([])).toEqual([]);
    });
  });
});

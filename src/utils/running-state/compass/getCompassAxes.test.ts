import { describe, expect, it } from "vitest";

import type { SurveyAxis } from "@/types/survey";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { createSurveyAxis } from "@/utils/vitest/survey/createSurveyAxis";

import { getCompassAxes } from "./getCompassAxes";

const orientations = ["hn", "hp", "vn", "vp", "extra"].map((id) =>
  createOrientation(id, id),
);
const horizontal = createSurveyAxis("x", ["hn"], ["hp"], {
  type: "compass_x_axis",
});
const vertical = createSurveyAxis("y", ["vn"], ["vp", "extra"], {
  type: "compass_y_axis",
});

const getAxes = (axes: SurveyAxis[]) => getCompassAxes({ orientations, axes });

describe("getCompassAxes()", () => {
  it("finds the compass_x_axis as horizontal and the compass_y_axis as vertical", () => {
    expect(
      getAxes([createSurveyAxis("a", ["hn"], ["hp"]), vertical, horizontal]),
    ).toEqual({ horizontal, vertical });
  });

  it("takes the first of two axes of the same compass type", () => {
    const second = createSurveyAxis("x2", ["vn"], ["vp"], {
      type: "compass_x_axis",
    });

    expect(getAxes([horizontal, second, vertical])?.horizontal.id).toBe("x");
    expect(getAxes([second, horizontal, vertical])?.horizontal.id).toBe("x2");
  });

  it("returns nothing when one of the two is missing", () => {
    expect(getAxes([horizontal])).toBeNull();
    expect(getAxes([vertical])).toBeNull();
    expect(getAxes([createSurveyAxis("a", ["hn"], ["hp"])])).toBeNull();
    expect(getAxes([])).toBeNull();
  });

  it("returns nothing when a compass axis has a side with no orientation of the quiz", () => {
    expect(
      getAxes([{ ...horizontal, negativeOrientationIds: [] }, vertical]),
    ).toBeNull();
    expect(
      getAxes([horizontal, { ...vertical, positiveOrientationIds: ["ghost"] }]),
    ).toBeNull();
  });

  it("does not look past the first axis of a type when it has an empty side", () => {
    expect(
      getAxes([
        { ...horizontal, positiveOrientationIds: [] },
        horizontal,
        vertical,
      ]),
    ).toBeNull();
  });

  it("returns each axis as the quiz has it", () => {
    const axes = getAxes([
      { ...horizontal, negativeOrientationIds: ["ghost", "hn", "hn"] },
      vertical,
    ]);

    expect(axes?.horizontal.negativeOrientationIds).toEqual(["hn"]);
    expect(axes?.vertical.positiveOrientationIds).toEqual(["vp", "extra"]);
  });
});

import { describe, expect, it } from "vitest";

import { createSurveyAxis } from "@/utils/vitest/createSurveyAxis";

import { toKnownAxis } from "./toKnownAxis";

describe("toKnownAxis()", () => {
  const orientationIds = new Set(["left", "right", "centre"]);

  it("returns an axis that names only orientations of the quiz as it is", () => {
    const axis = createSurveyAxis("economy", ["left"], ["right"]);

    expect(toKnownAxis(axis, orientationIds)).toEqual(axis);
  });

  it("drops a reference to an orientation the quiz does not have", () => {
    const axis = toKnownAxis(
      createSurveyAxis("economy", ["ghost", "left"], ["ghost"]),
      orientationIds,
    );

    expect(axis.negativeOrientationIds).toEqual(["left"]);
    expect(axis.positiveOrientationIds).toEqual([]);
  });

  it("keeps an orientation listed twice on a side once", () => {
    const axis = toKnownAxis(
      createSurveyAxis("economy", ["left", "left"], ["right", "centre"]),
      orientationIds,
    );

    expect(axis.negativeOrientationIds).toEqual(["left"]);
    expect(axis.positiveOrientationIds).toEqual(["right", "centre"]);
  });

  it("keeps everything else of the axis", () => {
    const axis = createSurveyAxis("x", ["ghost"], ["right"], {
      type: "compass_x_axis",
      name: "gospodarczo",
      isMain: true,
    });

    expect(toKnownAxis(axis, orientationIds)).toEqual({
      ...axis,
      negativeOrientationIds: [],
    });
  });
});

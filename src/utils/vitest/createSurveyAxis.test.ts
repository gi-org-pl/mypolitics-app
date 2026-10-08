import { describe, expect, it } from "vitest";

import { createSurveyAxis } from "./createSurveyAxis";

describe("createSurveyAxis()", () => {
  it("builds an axis of type axis with the two sides given", () => {
    expect(createSurveyAxis("economy", ["left"], ["right"])).toEqual({
      id: "economy",
      name: "Oś economy",
      type: "axis",
      negativeOrientationIds: ["left"],
      positiveOrientationIds: ["right"],
      isMain: false,
    });
  });

  it("lets the overrides replace the defaults", () => {
    const axis = createSurveyAxis("x", ["left"], ["right"], {
      type: "compass_x_axis",
      name: undefined,
    });

    expect(axis.type).toBe("compass_x_axis");
    expect(axis.name).toBeUndefined();
    expect(axis.negativeOrientationIds).toEqual(["left"]);
  });
});

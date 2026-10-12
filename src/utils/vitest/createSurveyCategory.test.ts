import { describe, expect, it } from "vitest";

import { createSurveyCategory } from "./createSurveyCategory";

describe("createSurveyCategory()", () => {
  it("builds a visible category with a name made of its id", () => {
    expect(createSurveyCategory("economy")).toEqual({
      id: "economy",
      name: "Kategoria economy",
      weight: 1,
      isHidden: false,
    });
  });

  it("lets the overrides replace the defaults", () => {
    expect(
      createSurveyCategory("economy", { name: undefined, isHidden: true }),
    ).toEqual({ id: "economy", name: undefined, weight: 1, isHidden: true });
  });
});

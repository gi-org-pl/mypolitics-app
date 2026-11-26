import { describe, expect, it } from "vitest";

import { createSurveyResult } from "./createSurveyResult";

describe("createSurveyResult()", () => {
  it("builds a result that is not calculated and holds nothing", () => {
    expect(createSurveyResult()).toEqual({
      id: "result",
      isCalculated: false,
      scores: {},
      answers: [],
    });
  });

  it("lets the overrides replace the defaults", () => {
    expect(
      createSurveyResult({
        id: "3f0c2a52",
        isCalculated: true,
        surveyId: "60beb898",
        scores: { left: { points: 10, maximum: 20 } },
        answers: [{ questionId: "q1", answerId: "q1-yes" }],
      }),
    ).toEqual({
      id: "3f0c2a52",
      isCalculated: true,
      surveyId: "60beb898",
      scores: { left: { points: 10, maximum: 20 } },
      answers: [{ questionId: "q1", answerId: "q1-yes" }],
    });
  });
});

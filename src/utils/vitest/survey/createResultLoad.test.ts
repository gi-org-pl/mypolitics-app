import { describe, expect, it } from "vitest";

import { ResultLoadStatus } from "@/types/survey";

import { createResultLoad } from "./createResultLoad";
import { createSurveyResult } from "./createSurveyResult";

describe("createResultLoad()", () => {
  it("builds a read that found a result that is not calculated and holds nothing", () => {
    expect(createResultLoad()).toEqual({
      status: ResultLoadStatus.Ready,
      result: createSurveyResult(),
    });
  });

  it("lets the overrides replace the defaults of the result", () => {
    expect(
      createResultLoad({ id: "3f0c2a52", isCalculated: true }).result,
    ).toEqual(createSurveyResult({ id: "3f0c2a52", isCalculated: true }));
  });
});

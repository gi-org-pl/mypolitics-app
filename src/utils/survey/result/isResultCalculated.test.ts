import { describe, expect, it } from "vitest";

import { ResultLoadStatus } from "@/types/survey";
import { createResultLoad } from "@/utils/vitest/survey/createResultLoad";

import { isResultCalculated } from "./isResultCalculated";

describe("isResultCalculated()", () => {
  describe("given a result that was found", () => {
    it("says yes when it is calculated", () => {
      expect(isResultCalculated(createResultLoad({ isCalculated: true }))).toBe(
        true,
      );
    });

    it("says no when it is not calculated yet", () => {
      expect(isResultCalculated(createResultLoad())).toBe(false);
    });
  });

  describe("given a read that found no result, or failed", () => {
    it.each([
      [ResultLoadStatus.NotFound],
      [ResultLoadStatus.Failed],
    ] as const)("says no: %s", (status) => {
      expect(isResultCalculated({ status })).toBe(false);
    });
  });
});

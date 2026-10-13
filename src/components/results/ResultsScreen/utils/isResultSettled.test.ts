import { describe, expect, it } from "vitest";

import { ResultLoadStatus } from "@/types/survey";
import { createResultLoad } from "@/utils/vitest/survey/createResultLoad";

import { isResultSettled } from "./isResultSettled";

describe("isResultSettled()", () => {
  describe("given a result that exists", () => {
    it("says yes when it is calculated", () => {
      expect(isResultSettled(createResultLoad({ isCalculated: true }))).toBe(
        true,
      );
    });

    it("says no when it is not calculated yet", () => {
      expect(isResultSettled(createResultLoad())).toBe(false);
    });
  });

  describe("given a read that found no result, or failed", () => {
    it.each([
      [ResultLoadStatus.NotFound],
      [ResultLoadStatus.Failed],
    ] as const)("says yes: %s", (status) => {
      expect(isResultSettled({ status })).toBe(true);
    });
  });
});

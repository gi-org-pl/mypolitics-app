import { describe, expect, it } from "vitest";
import { findModule } from "@/utils/result-modules/resolvedModules.fixtures";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { toDoubleAxisProps } from "./toDoubleAxisProps";

describe("toDoubleAxisProps()", () => {
  describe("given a resolved double axis", () => {
    it("hands over the two entries of the axis as the poles, and the marker", () => {
      expect(toDoubleAxisProps(findModule("double_axis"))).toEqual({
        start: {
          orientation: createOrientation("left", "Interwencjonizm"),
          value: 100,
        },
        end: {
          orientation: createOrientation("right", "Wolny rynek"),
          value: 0,
        },
        marker: false,
      });
    });
  });
});

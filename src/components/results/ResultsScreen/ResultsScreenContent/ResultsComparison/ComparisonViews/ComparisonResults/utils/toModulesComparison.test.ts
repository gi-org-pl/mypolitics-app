import { describe, expect, it } from "vitest";

import {
  friendComparison,
  orientationComparison,
} from "../../../ResultsComparison.fixtures";
import { toModulesComparison } from "./toModulesComparison";

describe("toModulesComparison()", () => {
  describe("given a comparison with a friend", () => {
    it("lays the friend and their resolved result over the modules", () => {
      expect(toModulesComparison(friendComparison)).toEqual({
        orientation: friendComparison.other.orientation,
        modules: friendComparison.modules,
      });
    });
  });

  describe("given a comparison with an orientation", () => {
    it("lays nothing over the modules", () => {
      expect(toModulesComparison(orientationComparison)).toBeUndefined();
    });
  });
});

import { describe, expect, it } from "vitest";

import { DEFAULT_MAX_SELECTION } from "../SurveyCategorySelect.constants";
import { getMaxSelection } from "./getMaxSelection";

describe("getMaxSelection()", () => {
  describe("given a whole number of at least 1", () => {
    it.each([1, 2, 5, 22])("returns %d unchanged", (maxSelection) => {
      expect(getMaxSelection(maxSelection)).toBe(maxSelection);
    });
  });

  describe("given no value", () => {
    it("returns the default of 3", () => {
      expect(getMaxSelection()).toBe(3);
      expect(DEFAULT_MAX_SELECTION).toBe(3);
    });
  });

  describe("given a value that is not a whole number of at least 1", () => {
    it.each([
      0,
      -2,
      2.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
    ])("returns the default for %d", (maxSelection) => {
      expect(getMaxSelection(maxSelection)).toBe(DEFAULT_MAX_SELECTION);
    });

    it("returns the default for a value that is not a number at all", () => {
      expect(getMaxSelection("4" as unknown as number)).toBe(
        DEFAULT_MAX_SELECTION,
      );
      expect(getMaxSelection(null as unknown as number)).toBe(
        DEFAULT_MAX_SELECTION,
      );
    });
  });
});

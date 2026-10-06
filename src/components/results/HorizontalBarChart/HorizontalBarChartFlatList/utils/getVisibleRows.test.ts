import { describe, expect, it } from "vitest";

import { DEFAULT_VISIBLE_ROWS } from "../../HorizontalBarChart.constants";
import { getVisibleRows } from "./getVisibleRows";

describe("getVisibleRows()", () => {
  describe("given a whole number of 1 or more", () => {
    it("returns it", () => {
      expect(getVisibleRows(1)).toBe(1);
      expect(getVisibleRows(7)).toBe(7);
    });
  });

  describe("given nothing", () => {
    it("returns the default of 3", () => {
      expect(DEFAULT_VISIBLE_ROWS).toBe(3);
      expect(getVisibleRows()).toBe(3);
    });
  });

  describe("given a number below 1, or not a whole number", () => {
    it.each([
      0,
      -2,
      2.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
    ])("returns the default for %s", (visibleRows) => {
      expect(getVisibleRows(visibleRows)).toBe(DEFAULT_VISIBLE_ROWS);
    });
  });

  describe("given a value that is not a number", () => {
    it("returns the default", () => {
      expect(getVisibleRows("4" as unknown as number)).toBe(
        DEFAULT_VISIBLE_ROWS,
      );
    });
  });
});

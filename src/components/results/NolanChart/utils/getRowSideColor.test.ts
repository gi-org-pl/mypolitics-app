import { describe, expect, it } from "vitest";

import { ROW_OTHER_SIDE_COLOR } from "../NolanChart.constants";
import { getRowSideColor } from "./getRowSideColor";

describe("getRowSideColor()", () => {
  describe("given the side the taker leans to", () => {
    it("returns the quadrant colour", () => {
      expect(getRowSideColor("start", "start", "#36db8b")).toBe("#36db8b");
      expect(getRowSideColor("end", "end", "#192430")).toBe("#192430");
    });

    it("returns nothing without a quadrant colour, which draws the neutral fallback", () => {
      expect(getRowSideColor("start", "start")).toBeUndefined();
      expect(getRowSideColor("end", "end")).toBeUndefined();
    });
  });

  describe("given the other side", () => {
    it.each([
      "#eb5760",
      "#57bfeb",
      "#36db8b",
      "#8443e9",
      "#fff176",
    ])("returns nothing next to %s, which draws the neutral fallback", (color) => {
      expect(getRowSideColor("end", "start", color)).toBeUndefined();
      expect(getRowSideColor("start", "end", color)).toBeUndefined();
    });

    it("returns the lighter neutral when the leaning side has no colour", () => {
      expect(getRowSideColor("end", "start")).toBe(ROW_OTHER_SIDE_COLOR);
      expect(getRowSideColor("start", "end")).toBe(ROW_OTHER_SIDE_COLOR);
    });

    it.each([
      "#192430",
      "#851c22",
    ])("returns the lighter neutral next to the dark %s", (color) => {
      expect(getRowSideColor("end", "start", color)).toBe(ROW_OTHER_SIDE_COLOR);
      expect(getRowSideColor("start", "end", color)).toBe(ROW_OTHER_SIDE_COLOR);
    });
  });

  describe("given no lean", () => {
    it("returns nothing for either side, with or without a colour", () => {
      expect(getRowSideColor("start")).toBeUndefined();
      expect(getRowSideColor("end")).toBeUndefined();
      expect(getRowSideColor("start", undefined, "#36db8b")).toBeUndefined();
      expect(getRowSideColor("end", undefined, "#192430")).toBeUndefined();
    });
  });
});

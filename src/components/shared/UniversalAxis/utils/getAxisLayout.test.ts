import { describe, expect, it } from "vitest";

import {
  DEFAULT_MARKER_POSITION,
  DOUBLE_SIDED_FIT_THRESHOLD,
  ONE_SIDED_FIT_THRESHOLD,
} from "../UniversalAxis.constants";
import type { AxisEntry, AxisOrientation } from "../UniversalAxis.types";
import { getAxisLayout } from "./getAxisLayout";

const orientationA: AxisOrientation = {
  id: "a",
  name: "Orientation A",
  imageUrl: "https://example.com/a.png",
  color: "#59b6a6",
};

const orientationB: AxisOrientation = {
  id: "b",
  name: "Orientation B",
  color: "#bc831a",
};

const friend: AxisOrientation = {
  id: "friend",
  name: "Ania",
  imageUrl: "https://example.com/ania.png",
  color: "#004554",
};

const entryA = (value: number): AxisEntry => ({
  orientation: orientationA,
  value,
});

const entryB = (value: number): AxisEntry => ({
  orientation: orientationB,
  value,
});

const friendEntry = (value: number): AxisEntry => ({
  orientation: friend,
  value,
});

describe("getAxisLayout()", () => {
  describe("modes", () => {
    it("is empty without entries", () => {
      const layout = getAxisLayout({});

      expect(layout.mode).toBe("empty");
      expect(layout.start).toBeNull();
      expect(layout.end).toBeNull();
      expect(layout.comparison).toBeNull();
    });

    it("is one-sided with only a start entry", () => {
      expect(getAxisLayout({ start: entryA(25) }).mode).toBe("one-sided");
    });

    it("is one-sided with only an end entry", () => {
      const layout = getAxisLayout({ end: entryB(25) });

      expect(layout.mode).toBe("one-sided");
      expect(layout.start).toBeNull();
      expect(layout.end?.width).toBe(25);
    });

    it("is double-sided with both entries", () => {
      expect(getAxisLayout({ start: entryA(69), end: entryB(31) }).mode).toBe(
        "double-sided",
      );
    });
  });

  describe("one-sided", () => {
    it("places the value inside the fill at or above the threshold", () => {
      const layout = getAxisLayout({ start: entryA(ONE_SIDED_FIT_THRESHOLD) });

      expect(layout.start?.valuePlacement).toBe("inside");
    });

    it("places the value after the fill below the threshold", () => {
      const layout = getAxisLayout({
        start: entryA(ONE_SIDED_FIT_THRESHOLD - 0.1),
      });

      expect(layout.start?.valuePlacement).toBe("outside");
    });

    it("shows no value at zero", () => {
      const layout = getAxisLayout({ start: entryA(0) });

      expect(layout.start?.valuePlacement).toBe("hidden");
    });
  });

  describe("double-sided", () => {
    it("shows a side value at or above its threshold", () => {
      const layout = getAxisLayout({
        start: entryA(100 - DOUBLE_SIDED_FIT_THRESHOLD),
        end: entryB(DOUBLE_SIDED_FIT_THRESHOLD),
      });

      expect(layout.start?.valuePlacement).toBe("inside");
      expect(layout.end?.valuePlacement).toBe("inside");
    });

    it("hides only the side below its threshold", () => {
      const layout = getAxisLayout({ start: entryA(88), end: entryB(12) });

      expect(layout.start?.valuePlacement).toBe("inside");
      expect(layout.end?.valuePlacement).toBe("hidden");
    });

    it("leaves the gap in the middle when values do not reach 100", () => {
      const layout = getAxisLayout({ start: entryA(30), end: entryB(40) });

      expect(layout.start?.width).toBe(30);
      expect(layout.end?.width).toBe(40);
    });

    it("scales both fills proportionally when values exceed 100", () => {
      const layout = getAxisLayout({ start: entryA(90), end: entryB(60) });

      expect(layout.start?.width).toBeCloseTo(60);
      expect(layout.end?.width).toBeCloseTo(40);
      expect(layout.start?.displayValue).toBe(90);
      expect(layout.end?.displayValue).toBe(60);
    });

    it("measures the fit threshold against the scaled fill", () => {
      const layout = getAxisLayout({ start: entryA(100), end: entryB(22) });

      expect(layout.end?.width).toBeLessThan(DOUBLE_SIDED_FIT_THRESHOLD);
      expect(layout.end?.valuePlacement).toBe("hidden");
    });
  });

  describe("values", () => {
    it("clamps values below 0 and above 100", () => {
      expect(getAxisLayout({ start: entryA(-20) }).start?.value).toBe(0);
      expect(getAxisLayout({ start: entryA(140) }).start?.value).toBe(100);
    });

    it("treats a missing or NaN value as an absent entry", () => {
      const missingValue = { orientation: orientationA } as AxisEntry;

      expect(getAxisLayout({ start: missingValue }).start).toBeNull();
      expect(getAxisLayout({ start: entryA(Number.NaN) }).start).toBeNull();
      expect(
        getAxisLayout({
          start: entryA(40),
          comparison: friendEntry(Number.NaN),
        }).comparison,
      ).toBeNull();
    });

    it("treats an entry without an orientation as absent", () => {
      const orphan = { value: 40 } as AxisEntry;

      expect(getAxisLayout({ start: orphan }).mode).toBe("empty");
    });

    it("rounds the displayed value without moving the fill", () => {
      const layout = getAxisLayout({ start: entryA(24.6) });

      expect(layout.start?.displayValue).toBe(25);
      expect(layout.start?.width).toBe(24.6);
    });
  });

  describe("orientation data", () => {
    it("passes the name, image and colour through", () => {
      const layout = getAxisLayout({ start: entryA(40) });

      expect(layout.start).toMatchObject({
        name: "Orientation A",
        imageUrl: "https://example.com/a.png",
        color: "#59b6a6",
      });
    });

    it("drops an empty image url", () => {
      const layout = getAxisLayout({
        start: { orientation: { ...orientationA, imageUrl: "" }, value: 40 },
      });

      expect(layout.start?.imageUrl).toBeUndefined();
    });

    it("accepts functional colour notations", () => {
      const layout = getAxisLayout({
        start: {
          orientation: { ...orientationA, color: " oklch(0.6 0.2 25 / 80%) " },
          value: 40,
        },
      });

      expect(layout.start?.color).toBe("oklch(0.6 0.2 25 / 80%)");
    });

    it("drops a colour that is not a plain colour value", () => {
      const layout = getAxisLayout({
        start: {
          orientation: { ...orientationA, color: "red; background: url(x)" },
          value: 40,
        },
      });

      expect(layout.start?.color).toBeUndefined();
    });

    it.each([
      "gren",
      "red",
      "rgb(foo)",
      "#12345",
    ])("drops the unsupported colour value %s", (color) => {
      const layout = getAxisLayout({
        start: { orientation: { ...orientationA, color }, value: 40 },
      });

      expect(layout.start?.color).toBeUndefined();
    });

    it("accepts hue units in functional colour notations", () => {
      const layout = getAxisLayout({
        start: {
          orientation: { ...orientationA, color: "hsl(120deg 50% 40%)" },
          value: 40,
        },
      });

      expect(layout.start?.color).toBe("hsl(120deg 50% 40%)");
    });

    it("leaves the colour undefined when it is missing", () => {
      const layout = getAxisLayout({
        start: {
          orientation: { ...orientationA, color: undefined },
          value: 40,
        },
      });

      expect(layout.start?.color).toBeUndefined();
    });
  });

  describe("marker", () => {
    it("defaults to 50", () => {
      expect(getAxisLayout({}).marker).toBe(DEFAULT_MARKER_POSITION);
    });

    it("uses the given position", () => {
      expect(getAxisLayout({ marker: 75 }).marker).toBe(75);
    });

    it("is disabled with false", () => {
      expect(getAxisLayout({ marker: false }).marker).toBeNull();
    });

    it("falls back to the default for NaN", () => {
      expect(getAxisLayout({ marker: Number.NaN }).marker).toBe(
        DEFAULT_MARKER_POSITION,
      );
    });

    it("stays inside the track at 0 and 100", () => {
      expect(getAxisLayout({ marker: -10 }).marker).toBe(0);
      expect(getAxisLayout({ marker: 120 }).marker).toBe(100);
    });
  });

  describe("comparison", () => {
    it("spans from the taker value to the other value when the other is ahead", () => {
      const layout = getAxisLayout({
        start: entryA(25),
        comparison: friendEntry(77),
      });

      expect(layout.comparison?.band).toEqual({ from: 25, to: 77 });
      expect(layout.comparison?.position).toBe(77);
    });

    it("spans from the other value to the taker value when the other is behind", () => {
      const layout = getAxisLayout({
        start: entryA(25),
        comparison: friendEntry(3),
      });

      expect(layout.comparison?.band).toEqual({ from: 3, to: 25 });
    });

    it("draws no band when the values are equal", () => {
      const layout = getAxisLayout({
        start: entryA(40),
        comparison: friendEntry(40),
      });

      expect(layout.comparison?.band).toBeNull();
      expect(layout.comparison?.position).toBe(40);
    });

    it("hatches the whole track when the taker has no entry", () => {
      const layout = getAxisLayout({ comparison: friendEntry(60) });

      expect(layout.comparison?.band).toEqual({ from: 0, to: 100 });
      expect(layout.comparison?.position).toBe(60);
    });

    it("clamps the image position at 0 and 100", () => {
      expect(
        getAxisLayout({ start: entryA(25), comparison: friendEntry(-20) })
          .comparison?.position,
      ).toBe(0);
      expect(
        getAxisLayout({ start: entryA(25), comparison: friendEntry(130) })
          .comparison?.position,
      ).toBe(100);
    });

    it("measures against the start entry on a double-sided bar", () => {
      const layout = getAxisLayout({
        start: entryA(69),
        end: entryB(31),
        comparison: friendEntry(90),
      });

      expect(layout.comparison?.band).toEqual({ from: 69, to: 90 });
    });

    it("measures from the right cap when only the end entry is present", () => {
      const layout = getAxisLayout({
        end: entryB(25),
        comparison: friendEntry(60),
      });

      expect(layout.comparison?.position).toBe(40);
      expect(layout.comparison?.band).toEqual({ from: 40, to: 75 });
    });

    it("rounds the displayed comparison value", () => {
      const layout = getAxisLayout({ comparison: friendEntry(33.4) });

      expect(layout.comparison?.displayValue).toBe(33);
    });

    it("hides the fill values so the band never covers them", () => {
      const layout = getAxisLayout({
        start: entryA(69),
        end: entryB(31),
        comparison: friendEntry(90),
      });

      expect(layout.start?.valuePlacement).toBe("hidden");
      expect(layout.end?.valuePlacement).toBe("hidden");
    });
  });
});

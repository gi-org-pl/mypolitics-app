import { describe, expect, it } from "vitest";

import {
  DEFAULT_MARKER_POSITION,
  DOUBLE_SIDED_COMPARISON_CLEARANCE,
  DOUBLE_SIDED_FIT_THRESHOLD,
  ONE_SIDED_COMPARISON_CLEARANCE,
  ONE_SIDED_FIT_THRESHOLD,
} from "@/constants/axis";
import type { AxisEntry } from "@/types/axis";
import type { Orientation } from "@/types/orientation";

import { getAxisLayout } from "./getAxisLayout";

const orientationA: Orientation = {
  id: "a",
  type: "ideology",
  name: "Orientation A",
  imageUrl: "https://example.com/a.png",
  color: "#59b6a6",
};

const orientationB: Orientation = {
  id: "b",
  type: "ideology",
  name: "Orientation B",
  color: "#bc831a",
};

const friend: Orientation = {
  id: "friend",
  type: "person",
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

    it("keeps an entry with a missing or NaN value and drops such a comparison", () => {
      const missingValue: AxisEntry = { orientation: orientationA };

      expect(getAxisLayout({ start: missingValue }).start?.hasValue).toBe(
        false,
      );
      expect(getAxisLayout({ start: entryA(Number.NaN) }).start?.hasValue).toBe(
        false,
      );
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

    it("returns an empty name for an orientation without one", () => {
      const layout = getAxisLayout({
        start: { orientation: { ...orientationA, name: undefined }, value: 40 },
        comparison: {
          orientation: { ...friend, name: undefined },
          value: 60,
        },
      });

      expect(layout.start?.name).toBe("");
      expect(layout.comparison?.name).toBe("");
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

    it("keeps the value of the side the other party is clear of and hides the one it is close to", () => {
      const layout = getAxisLayout({
        start: entryA(69),
        end: entryB(31),
        comparison: friendEntry(90),
      });

      expect(layout.start?.valuePlacement).toBe("inside");
      expect(layout.end?.valuePlacement).toBe("hidden");
    });
  });

  describe("given a comparison and a one-sided bar", () => {
    const getPlacement = (value: number, other: number) =>
      getAxisLayout({ start: entryA(value), comparison: friendEntry(other) })
        .start?.valuePlacement;

    describe("when the other party is ahead", () => {
      it("keeps the value inside the fill", () => {
        expect(getPlacement(25, 77)).toBe("inside");
      });
    });

    describe("when the other party is behind and clear of the number", () => {
      it("keeps the value inside the fill, next to the band", () => {
        expect(getPlacement(80, 45)).toBe("inside");
      });
    });

    describe("when the other party is at the same value", () => {
      it("keeps the value as long as that value is clear of the number", () => {
        expect(getPlacement(50, 50)).toBe("inside");
        expect(getPlacement(20, 20)).toBe("hidden");
      });
    });

    describe("when the other party is within the clearance of the cap", () => {
      it("shows no value, whichever side of the taker the other party is on", () => {
        expect(getPlacement(80, 3)).toBe("hidden");
        expect(getPlacement(20, 22)).toBe("hidden");
      });

      it("counts a position exactly at the clearance as clear", () => {
        expect(getPlacement(80, ONE_SIDED_COMPARISON_CLEARANCE)).toBe("inside");
        expect(getPlacement(80, ONE_SIDED_COMPARISON_CLEARANCE - 0.1)).toBe(
          "hidden",
        );
      });
    });

    describe("when the value is below the fit threshold", () => {
      it("shows no value instead of writing it after the fill", () => {
        expect(getPlacement(ONE_SIDED_FIT_THRESHOLD - 1, 60)).toBe("hidden");
        expect(getPlacement(5, 60)).toBe("hidden");
        expect(getPlacement(0, 60)).toBe("hidden");
      });
    });

    describe("when the comparison has no value", () => {
      it("places the value by the usual rules", () => {
        const layout = getAxisLayout({
          start: entryA(5),
          comparison: { orientation: friend },
        });

        expect(layout.start?.valuePlacement).toBe("outside");
      });
    });
  });

  describe("given a comparison and an end entry alone", () => {
    const getPlacement = (value: number, other: number) =>
      getAxisLayout({ end: entryB(value), comparison: friendEntry(other) }).end
        ?.valuePlacement;

    it("measures the clearance from the right cap, where the number sits", () => {
      expect(getPlacement(25, 60)).toBe("inside");
      expect(getPlacement(80, ONE_SIDED_COMPARISON_CLEARANCE)).toBe("inside");
      expect(getPlacement(80, ONE_SIDED_COMPARISON_CLEARANCE - 0.1)).toBe(
        "hidden",
      );
      expect(getPlacement(80, 3)).toBe("hidden");
    });

    it("shows no value below the fit threshold", () => {
      expect(getPlacement(5, 60)).toBe("hidden");
    });
  });

  describe("given a comparison and a double-sided bar", () => {
    const getPlacements = (start: number, end: number, other: number) => {
      const layout = getAxisLayout({
        start: entryA(start),
        end: entryB(end),
        comparison: friendEntry(other),
      });

      return [layout.start?.valuePlacement, layout.end?.valuePlacement];
    };

    it("keeps both values when the other party is clear of both caps", () => {
      expect(getPlacements(69, 31, 50)).toEqual(["inside", "inside"]);
    });

    it("hides only the value at the cap the other party is close to", () => {
      expect(getPlacements(69, 31, 10)).toEqual(["hidden", "inside"]);
      expect(getPlacements(69, 31, 90)).toEqual(["inside", "hidden"]);
    });

    it("counts a position exactly at the clearance of either cap as clear", () => {
      const nearStart = DOUBLE_SIDED_COMPARISON_CLEARANCE;
      const nearEnd = 100 - DOUBLE_SIDED_COMPARISON_CLEARANCE;

      expect(getPlacements(50, 50, nearStart)).toEqual(["inside", "inside"]);
      expect(getPlacements(50, 50, nearStart - 0.1)).toEqual([
        "hidden",
        "inside",
      ]);
      expect(getPlacements(50, 50, nearEnd)).toEqual(["inside", "inside"]);
      expect(getPlacements(50, 50, nearEnd + 0.1)).toEqual([
        "inside",
        "hidden",
      ]);
    });

    it("uses the clearance of its own mode", () => {
      const between =
        (ONE_SIDED_COMPARISON_CLEARANCE + DOUBLE_SIDED_COMPARISON_CLEARANCE) /
        2;

      expect(DOUBLE_SIDED_COMPARISON_CLEARANCE).toBeGreaterThan(
        ONE_SIDED_COMPARISON_CLEARANCE,
      );
      expect(getPlacements(50, 50, between)).toEqual(["hidden", "inside"]);
      expect(
        getAxisLayout({ start: entryA(50), comparison: friendEntry(between) })
          .start?.valuePlacement,
      ).toBe("inside");
    });

    it("still hides a side below its fit threshold", () => {
      expect(getPlacements(88, 12, 50)).toEqual(["inside", "hidden"]);
    });

    it("shows no value on either side when the track is hatched whole", () => {
      const layout = getAxisLayout({
        start: { orientation: orientationA },
        end: entryB(31),
        comparison: friendEntry(50),
      });

      expect(layout.comparison?.band).toEqual({ from: 0, to: 100 });
      expect(layout.start?.valuePlacement).toBe("hidden");
      expect(layout.end?.valuePlacement).toBe("hidden");
    });

    it("keeps the start value when only the end side has no value", () => {
      const layout = getAxisLayout({
        start: entryA(69),
        end: { orientation: orientationB },
        comparison: friendEntry(50),
      });

      expect(layout.start?.valuePlacement).toBe("inside");
      expect(layout.end?.valuePlacement).toBe("hidden");
    });

    it("measures the clearance against the other party's position as drawn, which is not scaled with the fills", () => {
      const layout = getAxisLayout({
        start: entryA(90),
        end: entryB(90),
        comparison: friendEntry(70),
      });

      expect(layout.start?.width).toBe(50);
      expect(layout.comparison?.position).toBe(70);
      expect(layout.comparison?.band).toEqual({ from: 50, to: 70 });
      expect(layout.start?.valuePlacement).toBe("inside");
      expect(layout.end?.valuePlacement).toBe("inside");
      expect(getPlacements(90, 90, 80)).toEqual(["inside", "hidden"]);
    });
  });

  describe("given a comparison and a taker without a value", () => {
    it("shows no value", () => {
      const layout = getAxisLayout({
        start: { orientation: orientationA },
        comparison: friendEntry(60),
      });

      expect(layout.start?.valuePlacement).toBe("hidden");
    });
  });

  describe("given a start entry without a value", () => {
    it("returns one-sided mode with the start side present", () => {
      const layout = getAxisLayout({ start: { orientation: orientationB } });

      expect(layout.mode).toBe("one-sided");
      expect(layout.start?.name).toBe("Orientation B");
      expect(layout.end).toBeNull();
    });

    it("gives that side no fill and a hidden value", () => {
      const layout = getAxisLayout({ start: { orientation: orientationB } });

      expect(layout.start?.hasValue).toBe(false);
      expect(layout.start?.width).toBe(0);
      expect(layout.start?.valuePlacement).toBe("hidden");
    });
  });

  describe("given an end entry without a value", () => {
    it("returns one-sided mode with the end side present and unfilled", () => {
      const layout = getAxisLayout({ end: { orientation: orientationB } });

      expect(layout.mode).toBe("one-sided");
      expect(layout.start).toBeNull();
      expect(layout.end?.hasValue).toBe(false);
      expect(layout.end?.width).toBe(0);
    });
  });

  describe("given both entries, one without a value", () => {
    const layout = getAxisLayout({
      start: entryA(69),
      end: { orientation: orientationB },
    });

    it("returns double-sided mode", () => {
      expect(layout.mode).toBe("double-sided");
    });

    it("keeps the side without a value, with no fill and a hidden value", () => {
      expect(layout.end?.name).toBe("Orientation B");
      expect(layout.end?.hasValue).toBe(false);
      expect(layout.end?.width).toBe(0);
      expect(layout.end?.valuePlacement).toBe("hidden");
    });

    it("lays the other side out as usual", () => {
      expect(layout.start).toEqual(
        getAxisLayout({ start: entryA(69), end: entryB(0) }).start,
      );
      expect(layout.start?.hasValue).toBe(true);
      expect(layout.start?.width).toBe(69);
      expect(layout.start?.valuePlacement).toBe("inside");
    });
  });

  describe("given both entries without a value", () => {
    it("returns double-sided mode with both sides present and unfilled", () => {
      const layout = getAxisLayout({
        start: { orientation: orientationA },
        end: { orientation: orientationB },
      });

      expect(layout.mode).toBe("double-sided");
      expect(layout.start?.hasValue).toBe(false);
      expect(layout.start?.width).toBe(0);
      expect(layout.end?.hasValue).toBe(false);
      expect(layout.end?.width).toBe(0);
    });
  });

  describe("given a value that is not a number", () => {
    it("treats the entry as present and without a value", () => {
      const textValue = {
        orientation: orientationA,
        value: "40",
      } as unknown as AxisEntry;

      for (const entry of [entryB(Number.NaN), textValue]) {
        const layout = getAxisLayout({ start: entryA(30), end: entry });

        expect(layout.mode).toBe("double-sided");
        expect(layout.end?.hasValue).toBe(false);
        expect(layout.end?.value).toBe(0);
        expect(layout.end?.width).toBe(0);
        expect(layout.end?.valuePlacement).toBe("hidden");
      }
    });
  });

  describe("given a comparison and a taker entry without a value", () => {
    it("hatches the whole track and positions only the other side image", () => {
      const layout = getAxisLayout({
        start: { orientation: orientationA },
        comparison: friendEntry(60),
      });

      expect(layout.start?.width).toBe(0);
      expect(layout.comparison?.band).toEqual({ from: 0, to: 100 });
      expect(layout.comparison?.position).toBe(60);
    });

    it("does the same from the right cap for an end entry", () => {
      const layout = getAxisLayout({
        end: { orientation: orientationB },
        comparison: friendEntry(60),
      });

      expect(layout.comparison?.band).toEqual({ from: 0, to: 100 });
      expect(layout.comparison?.position).toBe(40);
    });

    it("hatches the whole track when the start side of a double-sided bar has no value", () => {
      const layout = getAxisLayout({
        start: { orientation: orientationA },
        end: entryB(31),
        comparison: friendEntry(90),
      });

      expect(layout.comparison?.band).toEqual({ from: 0, to: 100 });
      expect(layout.comparison?.position).toBe(90);
    });
  });

  describe("given a comparison without a value", () => {
    it("returns no comparison", () => {
      expect(
        getAxisLayout({
          start: entryA(40),
          comparison: { orientation: friend },
        }).comparison,
      ).toBeNull();
    });
  });

  describe("given entries with numbers", () => {
    it("returns the same layout as before for every existing case", () => {
      expect(
        getAxisLayout({
          start: entryA(69),
          end: entryB(31),
          comparison: friendEntry(90),
        }),
      ).toEqual({
        mode: "double-sided",
        start: {
          name: "Orientation A",
          imageUrl: "https://example.com/a.png",
          color: "#59b6a6",
          hasValue: true,
          value: 69,
          displayValue: 69,
          width: 69,
          valuePlacement: "inside",
        },
        end: {
          name: "Orientation B",
          imageUrl: undefined,
          color: "#bc831a",
          hasValue: true,
          value: 31,
          displayValue: 31,
          width: 31,
          valuePlacement: "hidden",
        },
        marker: DEFAULT_MARKER_POSITION,
        comparison: {
          name: "Ania",
          imageUrl: "https://example.com/ania.png",
          color: "#004554",
          value: 90,
          displayValue: 90,
          position: 90,
          band: { from: 69, to: 90 },
        },
      });
    });

    it("keeps a zero value as a value", () => {
      const layout = getAxisLayout({ start: entryA(0) });

      expect(layout.start?.hasValue).toBe(true);
      expect(layout.start?.width).toBe(0);
      expect(layout.start?.valuePlacement).toBe("hidden");
    });
  });
});

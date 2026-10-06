import { describe, expect, it } from "vitest";

import type { AxisEntry, AxisOrientation } from "@/types/axis";

import { isAxisEmphasised } from "./isAxisEmphasised";

const orientation: AxisOrientation = { id: "radicalism", name: "Radykalizm" };

const entry = (value?: number): AxisEntry => ({ orientation, value });

describe("isAxisEmphasised()", () => {
  describe("given the default marker", () => {
    it("returns true for a value at or above 50", () => {
      expect(isAxisEmphasised(entry(50))).toBe(true);
      expect(isAxisEmphasised(entry(69))).toBe(true);
    });

    it("returns false for a value below 50", () => {
      expect(isAxisEmphasised(entry(49.9))).toBe(false);
      expect(isAxisEmphasised(entry(0))).toBe(false);
    });
  });

  describe("given marker is false", () => {
    it("keeps the emphasis line at 50", () => {
      expect(isAxisEmphasised(entry(50), false)).toBe(true);
      expect(isAxisEmphasised(entry(49), false)).toBe(false);
    });
  });

  describe("given a custom marker", () => {
    it("moves the emphasis line with it", () => {
      expect(isAxisEmphasised(entry(69), 75)).toBe(false);
      expect(isAxisEmphasised(entry(40), 25)).toBe(true);
    });

    it("clamps a marker outside 0-100", () => {
      expect(isAxisEmphasised(entry(99), 140)).toBe(false);
      expect(isAxisEmphasised(entry(100), 140)).toBe(true);
      expect(isAxisEmphasised(entry(0), -20)).toBe(true);
    });

    it("falls back to 50 for a marker that is not a number", () => {
      expect(isAxisEmphasised(entry(60), Number.NaN)).toBe(true);
      expect(isAxisEmphasised(entry(40), "25" as unknown as number)).toBe(
        false,
      );
    });
  });

  describe("given a value outside 0-100", () => {
    it("compares the clamped value", () => {
      expect(isAxisEmphasised(entry(140), 100)).toBe(true);
      expect(isAxisEmphasised(entry(-20), 0)).toBe(true);
      expect(isAxisEmphasised(entry(-20), 1)).toBe(false);
    });
  });

  describe("given no value", () => {
    it("returns false", () => {
      expect(isAxisEmphasised(entry())).toBe(false);
      expect(isAxisEmphasised(entry(), 0)).toBe(false);
    });
  });

  describe("given a value that is not a number", () => {
    it("returns false", () => {
      expect(isAxisEmphasised(entry(Number.NaN), 0)).toBe(false);
      expect(isAxisEmphasised(entry("69" as unknown as number))).toBe(false);
    });
  });

  describe("given an entry without an orientation", () => {
    it("returns false", () => {
      expect(isAxisEmphasised({ value: 69 } as unknown as AxisEntry)).toBe(
        false,
      );
    });
  });
});

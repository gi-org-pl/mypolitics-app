import { describe, expect, it } from "vitest";

import type { RunningAxis } from "@/types/checkpoint";

import {
  createSingleAxis,
  createTwoSidedAxis,
} from "@/utils/checkpoint/engine/getNextCheckpoint.fixtures";
import { isLeaningAxis } from "./isLeaningAxis";

describe("isLeaningAxis()", () => {
  it("takes a single axis at 70 and not at 69.6", () => {
    expect(isLeaningAxis(createSingleAxis("a", 70))).toBe(true);
    expect(isLeaningAxis(createSingleAxis("a", 83))).toBe(true);
    expect(isLeaningAxis(createSingleAxis("a", 69.6))).toBe(false);
  });

  it("states only a high reading of a single axis", () => {
    expect(isLeaningAxis(createSingleAxis("a", 30))).toBe(false);
    expect(isLeaningAxis(createSingleAxis("a", 0))).toBe(false);
    expect(isLeaningAxis(createSingleAxis("a", 50))).toBe(false);
  });

  it("takes a two-sided axis at a lean of 15 and not at 14.99", () => {
    expect(isLeaningAxis(createTwoSidedAxis("a", 60, 45))).toBe(true);
    expect(isLeaningAxis(createTwoSidedAxis("a", 45, 60))).toBe(true);
    expect(isLeaningAxis(createTwoSidedAxis("a", 20, 60))).toBe(true);
    expect(isLeaningAxis(createTwoSidedAxis("a", 60, 45.01))).toBe(false);
    expect(isLeaningAxis(createTwoSidedAxis("a", 45.01, 60))).toBe(false);
  });

  it("leaves out an axis with an absent value", () => {
    expect(isLeaningAxis(createTwoSidedAxis("a", 90))).toBe(false);
    expect(isLeaningAxis(createTwoSidedAxis("a", undefined, 90))).toBe(false);
    expect(isLeaningAxis(createTwoSidedAxis("a"))).toBe(false);
    expect(isLeaningAxis(createSingleAxis("a"))).toBe(false);
  });

  it("leaves out a two-sided axis with equal values", () => {
    expect(isLeaningAxis(createTwoSidedAxis("a", 47, 47))).toBe(false);
  });

  it("leaves out an axis whose lean and values do not agree", () => {
    const single = createSingleAxis("a", 60);
    const twoSided = createTwoSidedAxis("a", 47, 47);

    expect(isLeaningAxis({ ...single, lean: 40 } as RunningAxis)).toBe(false);
    expect(isLeaningAxis({ ...twoSided, lean: 40 } as RunningAxis)).toBe(false);
  });
});

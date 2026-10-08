import { describe, expect, it } from "vitest";

import type { HalfwayCheckpointCard } from "@/types/checkpoint";

import { getHalfwayPercent } from "./getHalfwayPercent";

// A card is stored JSON: its percent is whatever was stored.
const createCard = (percent: unknown): HalfwayCheckpointCard => ({
  type: "halfway",
  boundary: 5,
  line: { pool: "halfway", index: 0 },
  percent: percent as number,
  minutes: 7,
});

describe("getHalfwayPercent()", () => {
  it("returns a whole percent as it is", () => {
    expect(getHalfwayPercent(createCard(50))).toBe(50);
    expect(getHalfwayPercent(createCard(55))).toBe(55);
    expect(getHalfwayPercent(createCard(100))).toBe(100);
  });

  it("rounds a percent that is not whole down", () => {
    expect(getHalfwayPercent(createCard(55.56))).toBe(55);
    expect(getHalfwayPercent(createCard(50.99))).toBe(50);
  });

  it("returns 100 for a percent above 100", () => {
    expect(getHalfwayPercent(createCard(100.5))).toBe(100);
    expect(getHalfwayPercent(createCard(250))).toBe(100);
    expect(getHalfwayPercent(createCard(Number.POSITIVE_INFINITY))).toBe(100);
  });

  it("returns 0 for a percent below 0", () => {
    expect(getHalfwayPercent(createCard(-0.5))).toBe(0);
    expect(getHalfwayPercent(createCard(-20))).toBe(0);
    expect(getHalfwayPercent(createCard(Number.NEGATIVE_INFINITY))).toBe(0);
  });

  it("returns nothing for a percent that is not a number", () => {
    expect(getHalfwayPercent(createCard(Number.NaN))).toBeUndefined();
    expect(getHalfwayPercent(createCard(undefined))).toBeUndefined();
    expect(getHalfwayPercent(createCard(null))).toBeUndefined();
    expect(getHalfwayPercent(createCard("55"))).toBeUndefined();
  });
});

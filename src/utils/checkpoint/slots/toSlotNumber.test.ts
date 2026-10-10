import { describe, expect, it } from "vitest";

import { toSlotNumber } from "./toSlotNumber";

describe("toSlotNumber()", () => {
  it("returns a whole number from the lowest to the highest value allowed", () => {
    expect(toSlotNumber(1, 1, 10)).toBe(1);
    expect(toSlotNumber(7, 1, 10)).toBe(7);
    expect(toSlotNumber(10, 1, 10)).toBe(10);
  });

  it("returns nothing for a number outside the range", () => {
    expect(toSlotNumber(0, 1, 10)).toBeUndefined();
    expect(toSlotNumber(11, 1, 10)).toBeUndefined();
    expect(toSlotNumber(-3, 1, 10)).toBeUndefined();
  });

  it("has no highest value when none is given", () => {
    expect(toSlotNumber(480, 1)).toBe(480);
    expect(toSlotNumber(0, 1)).toBeUndefined();
  });

  it("returns nothing for a number that is not whole", () => {
    expect(toSlotNumber(7.5, 1, 10)).toBeUndefined();
    expect(toSlotNumber(Number.NaN, 1, 10)).toBeUndefined();
    expect(toSlotNumber(Number.POSITIVE_INFINITY, 1)).toBeUndefined();
  });

  it("returns nothing for a value that is not a number", () => {
    expect(toSlotNumber("7", 1, 10)).toBeUndefined();
    expect(toSlotNumber(undefined, 1, 10)).toBeUndefined();
    expect(toSlotNumber(null, 1, 10)).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";

import { isCount } from "./isCount";

describe("isCount()", () => {
  it("accepts zero and a whole number above it", () => {
    expect(isCount(0)).toBe(true);
    expect(isCount(1)).toBe(true);
    expect(isCount(12_345)).toBe(true);
  });

  it("refuses a negative number", () => {
    expect(isCount(-1)).toBe(false);
  });

  it("refuses a number that is not whole", () => {
    expect(isCount(2.5)).toBe(false);
    expect(isCount(Number.NaN)).toBe(false);
    expect(isCount(Number.POSITIVE_INFINITY)).toBe(false);
  });

  it("refuses a value that is not a number", () => {
    for (const value of ["3", null, undefined, true, [], {}]) {
      expect(isCount(value)).toBe(false);
    }
  });
});

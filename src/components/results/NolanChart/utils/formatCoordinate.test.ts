import { describe, expect, it } from "vitest";

import { formatCoordinate } from "./formatCoordinate";

describe("formatCoordinate()", () => {
  it("rounds to two decimals", () => {
    expect(formatCoordinate(-0.5449)).toBe("-0.54");
    expect(formatCoordinate(0.126)).toBe("0.13");
  });

  it("keeps one decimal when the second is zero", () => {
    expect(formatCoordinate(0)).toBe("0.0");
    expect(formatCoordinate(1)).toBe("1.0");
    expect(formatCoordinate(-1)).toBe("-1.0");
    expect(formatCoordinate(0.5)).toBe("0.5");
  });

  it("never shows a negative zero", () => {
    expect(formatCoordinate(-0.001)).toBe("0.0");
    expect(formatCoordinate(-0)).toBe("0.0");
  });
});

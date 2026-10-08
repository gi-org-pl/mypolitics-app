import { describe, expect, it } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";

import { toSlotName } from "./toSlotName";

describe("toSlotName()", () => {
  it("returns the name exactly as the quiz wrote it", () => {
    expect(toSlotName(createOrientation("a", "Państwo minimum 2.0"))).toBe(
      "Państwo minimum 2.0",
    );
    expect(toSlotName(createOrientation("a", "eurosceptycyzm"))).toBe(
      "eurosceptycyzm",
    );
  });

  it("trims the space around a name and keeps the space inside it", () => {
    expect(toSlotName(createOrientation("a", "  Wolny  rynek \n"))).toBe(
      "Wolny  rynek",
    );
  });

  it("returns nothing for a name that is missing or empty", () => {
    expect(toSlotName(createOrientation("a"))).toBeUndefined();
    expect(toSlotName(createOrientation("a", "   "))).toBeUndefined();
    expect(toSlotName(undefined)).toBeUndefined();
  });
});

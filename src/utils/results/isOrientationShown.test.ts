import { describe, expect, it } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";

import { isOrientationShown } from "./isOrientationShown";

describe("isOrientationShown()", () => {
  it("returns true for an orientation that is not hidden", () => {
    expect(
      isOrientationShown(
        createOrientation("liberalism", "Liberalizm", { isHidden: false }),
      ),
    ).toBe(true);
  });

  it("returns true when isHidden is absent", () => {
    expect(isOrientationShown(createOrientation("liberalism"))).toBe(true);
    expect(isOrientationShown({})).toBe(true);
  });

  it("returns false for a hidden orientation", () => {
    expect(
      isOrientationShown(
        createOrientation("liberalism", "Liberalizm", { isHidden: true }),
      ),
    ).toBe(false);
  });

  it("returns true without an orientation", () => {
    expect(isOrientationShown()).toBe(true);
  });
});

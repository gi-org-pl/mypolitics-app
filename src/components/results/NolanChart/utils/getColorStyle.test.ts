import { describe, expect, it } from "vitest";

import { getColorStyle } from "./getColorStyle";

describe("getColorStyle()", () => {
  it("returns the colour as a custom property", () => {
    expect(getColorStyle("#36db8b")).toEqual({ "--nolan-color": "#36db8b" });
  });

  it("returns nothing without a colour", () => {
    expect(getColorStyle()).toBeUndefined();
    expect(getColorStyle("")).toBeUndefined();
  });
});

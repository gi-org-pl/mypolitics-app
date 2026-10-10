import { describe, expect, it } from "vitest";

import { getNolanColorStyle } from "./getNolanColorStyle";

describe("getNolanColorStyle()", () => {
  it("returns the colour as a custom property", () => {
    expect(getNolanColorStyle("#36db8b")).toEqual({
      "--nolan-color": "#36db8b",
    });
  });

  it("returns nothing without a colour", () => {
    expect(getNolanColorStyle()).toBeUndefined();
    expect(getNolanColorStyle("")).toBeUndefined();
  });
});

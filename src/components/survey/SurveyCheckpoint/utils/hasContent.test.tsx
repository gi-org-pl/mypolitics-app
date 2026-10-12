import { describe, expect, it } from "vitest";

import { hasContent } from "./hasContent";

describe("hasContent()", () => {
  it("is false for null, undefined, false, an empty string and an empty list", () => {
    expect(hasContent(null)).toBe(false);
    expect(hasContent(undefined)).toBe(false);
    expect(hasContent(false)).toBe(false);
    expect(hasContent(true)).toBe(false);
    expect(hasContent("")).toBe(false);
    expect(hasContent([])).toBe(false);
  });

  it("is false for a list that holds nothing to draw", () => {
    expect(hasContent([null, false, "", [undefined]])).toBe(false);
  });

  it("is true for an element, a number and a non-empty string", () => {
    expect(hasContent(<span />)).toBe(true);
    expect(hasContent(0)).toBe(true);
    expect(hasContent(50)).toBe(true);
    expect(hasContent("50%")).toBe(true);
  });

  it("is true for a list that holds something to draw", () => {
    expect(hasContent([null, <span key="row" />])).toBe(true);
  });
});

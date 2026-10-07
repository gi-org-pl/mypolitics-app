import { describe, expect, it } from "vitest";

import { ROW_FADE_MS, ROW_STAGGER_MS } from "../SurveyCategorySelect.constants";
import { getRowFadeStyle } from "./getRowFadeStyle";

describe("getRowFadeStyle()", () => {
  describe("given the first row", () => {
    it("starts the fade without a delay", () => {
      expect(getRowFadeStyle(0).transitionDelay).toBe("0ms");
    });
  });

  describe("given a later row", () => {
    it("delays the fade by one step for every row before it", () => {
      expect(getRowFadeStyle(1).transitionDelay).toBe(`${ROW_STAGGER_MS}ms`);
      expect(getRowFadeStyle(4).transitionDelay).toBe(
        `${4 * ROW_STAGGER_MS}ms`,
      );
    });
  });

  describe("given any row", () => {
    it("fades for the fade length, which is not the step between rows", () => {
      expect(getRowFadeStyle(0).transitionDuration).toBe(`${ROW_FADE_MS}ms`);
      expect(getRowFadeStyle(3).transitionDuration).toBe(`${ROW_FADE_MS}ms`);
      expect(ROW_FADE_MS).not.toBe(ROW_STAGGER_MS);
    });
  });

  describe("given a negative position", () => {
    it("starts the fade without a delay", () => {
      expect(getRowFadeStyle(-1).transitionDelay).toBe("0ms");
    });
  });
});

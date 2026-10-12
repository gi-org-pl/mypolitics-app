import { afterEach, describe, expect, it, vi } from "vitest";

import { prefersReducedMotion } from "./prefersReducedMotion";

const stubMatchMedia = (matches: boolean) => {
  const matchMedia = vi.fn(() => ({ matches }));

  vi.stubGlobal("matchMedia", matchMedia);

  return matchMedia;
};

describe("prefersReducedMotion()", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("given a taker who asked for less movement", () => {
    it("is true", () => {
      const matchMedia = stubMatchMedia(true);

      expect(prefersReducedMotion()).toBe(true);
      expect(matchMedia).toHaveBeenCalledWith(
        "(prefers-reduced-motion: reduce)",
      );
    });
  });

  describe("given a taker who asked for nothing", () => {
    it("is false", () => {
      stubMatchMedia(false);

      expect(prefersReducedMotion()).toBe(false);
    });
  });

  describe("given nothing that can say what the taker asked for", () => {
    it("is true: no movement without a source", () => {
      vi.stubGlobal("matchMedia", undefined);

      expect(prefersReducedMotion()).toBe(true);
    });
  });
});

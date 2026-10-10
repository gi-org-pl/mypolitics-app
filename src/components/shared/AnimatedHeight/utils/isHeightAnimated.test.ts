import { describe, expect, it, vi } from "vitest";

import { isHeightAnimated } from "./isHeightAnimated";

interface AnimationStub {
  playState: string;
  effect: { getKeyframes?: () => Record<string, unknown>[] } | null;
}

const createAnimation = (
  properties: string[],
  playState = "running",
): AnimationStub => ({
  playState,
  effect: {
    getKeyframes: () => [
      Object.fromEntries([
        ["offset", 0],
        ["easing", "ease"],
        ...properties.map((property) => [property, "0px"]),
      ]),
      Object.fromEntries([
        ["offset", 1],
        ["easing", "ease"],
        ...properties.map((property) => [property, "10px"]),
      ]),
    ],
  },
});

const createElement = (animations: AnimationStub[]) => {
  const element = document.createElement("div");
  const getAnimations = vi.fn(() => animations);

  element.getAnimations = getAnimations as never;

  return { element, getAnimations };
};

describe("isHeightAnimated()", () => {
  describe("given an element with nothing moving inside", () => {
    it("is false", () => {
      expect(isHeightAnimated(createElement([]).element)).toBe(false);
    });

    it("asks for the animations of everything inside the element", () => {
      const { element, getAnimations } = createElement([]);

      isHeightAnimated(element);

      expect(getAnimations).toHaveBeenCalledWith({ subtree: true });
    });
  });

  describe("given something inside that moves a height", () => {
    it.each([
      ["height"],
      ["minHeight"],
      ["maxHeight"],
      ["blockSize"],
      ["minBlockSize"],
      ["maxBlockSize"],
      ["gridTemplateRows"],
    ])("is true for %s", (property) => {
      const { element } = createElement([createAnimation([property])]);

      expect(isHeightAnimated(element)).toBe(true);
    });

    it("is true when it is one of several things that move", () => {
      const { element } = createElement([
        createAnimation(["opacity", "translate"]),
        createAnimation(["opacity", "gridTemplateRows"]),
      ]);

      expect(isHeightAnimated(element)).toBe(true);
    });
  });

  describe("given something inside that moves, but no height", () => {
    it("is false for a slide, a fade and a change of colour", () => {
      const { element } = createElement([
        createAnimation(["translate", "opacity"]),
        createAnimation(["backgroundColor"]),
        createAnimation(["clipPath"]),
        createAnimation(["width"]),
      ]);

      expect(isHeightAnimated(element)).toBe(false);
    });
  });

  describe("given an animation of a height that is not running", () => {
    it.each([
      ["paused"],
      ["finished"],
      ["idle"],
    ])("is false while it is %s", (playState) => {
      const { element } = createElement([
        createAnimation(["height"], playState),
      ]);

      expect(isHeightAnimated(element)).toBe(false);
    });
  });

  describe("given an animation that names no properties", () => {
    it("is false for one without an effect, and for an effect without keyframes", () => {
      const { element } = createElement([
        { playState: "running", effect: null },
        { playState: "running", effect: {} },
      ]);

      expect(isHeightAnimated(element)).toBe(false);
    });
  });

  describe("given a browser that cannot say what it is animating", () => {
    it("is false", () => {
      expect(isHeightAnimated(document.createElement("div"))).toBe(false);
    });
  });
});

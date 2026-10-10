import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AnimatedHeight } from "./AnimatedHeight";
import {
  HEIGHT_CHANGE_EASING,
  HEIGHT_CHANGE_MS,
} from "./AnimatedHeight.constants";
import { mockResizeObserver } from "./utils/mockResizeObserver";

const getContent = () => screen.getByText("Treść").parentElement as HTMLElement;

const getBox = () => getContent().parentElement as HTMLElement;

describe("<AnimatedHeight />", () => {
  describe("given a browser that cannot watch the content", () => {
    it("shows the content at its own height", () => {
      render(
        <AnimatedHeight>
          <p>Treść</p>
        </AnimatedHeight>,
      );

      expect(screen.getByText("Treść")).toBeVisible();
      expect(getBox().style.height).toBe("");
    });

    it("takes the width of its parent and adds nothing to the look", () => {
      const { container } = render(
        <AnimatedHeight>
          <p>Treść</p>
        </AnimatedHeight>,
      );

      expect(container.firstElementChild).toBe(getBox());
      expect(getBox().className).toBe(
        "w-full data-[animating=true]:overflow-y-clip",
      );
      expect(getContent().className).toBe("w-full");
    });
  });

  describe("when the height of the content changes", () => {
    const animate = vi.fn(() => ({
      cancel: vi.fn(),
      onfinish: null,
      ready: new Promise<void>(() => undefined),
    }));

    beforeEach(() => {
      HTMLElement.prototype.animate = animate as never;
      vi.stubGlobal(
        "matchMedia",
        vi.fn(() => ({ matches: false })),
      );
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
      animate.mockClear();
      Reflect.deleteProperty(HTMLElement.prototype, "animate");
    });

    it("watches the content and moves the box around it, for 300 ms by default", () => {
      const observer = mockResizeObserver();

      render(
        <AnimatedHeight>
          <p>Treść</p>
        </AnimatedHeight>,
      );

      expect(observer.observers[0].elements).toEqual([getContent()]);

      observer.resize(136);
      observer.resize(169);

      expect(animate.mock.contexts[0]).toBe(getBox());
      expect(animate).toHaveBeenCalledWith(
        [{ height: "136px" }, { height: "169px" }],
        { duration: HEIGHT_CHANGE_MS, easing: HEIGHT_CHANGE_EASING },
      );
      expect(HEIGHT_CHANGE_MS).toBe(300);
    });

    it("cuts off what does not fit only while it moves, and only at the top and the bottom", () => {
      const observer = mockResizeObserver();

      render(
        <AnimatedHeight>
          <p>Treść</p>
        </AnimatedHeight>,
      );

      expect(getBox()).not.toHaveAttribute("data-animating");

      observer.resize(136);
      observer.resize(169);

      expect(getBox()).toHaveAttribute("data-animating", "true");
      expect(getBox()).toHaveClass("data-[animating=true]:overflow-y-clip");
      expect(getBox().className).not.toContain("overflow-x");
      expect(getBox().className).not.toContain("overflow-hidden");
    });

    it("moves for the time it is given", () => {
      const observer = mockResizeObserver();

      render(
        <AnimatedHeight durationMs={120}>
          <p>Treść</p>
        </AnimatedHeight>,
      );

      observer.resize(40);
      observer.resize(20);

      expect(animate).toHaveBeenCalledWith(
        [{ height: "40px" }, { height: "20px" }],
        { duration: 120, easing: HEIGHT_CHANGE_EASING },
      );
    });
  });

  describe("when rendered again with other content", () => {
    it("keeps the box and the element that is watched", () => {
      const { rerender } = render(
        <AnimatedHeight>
          <p>Treść</p>
        </AnimatedHeight>,
      );
      const box = getBox();
      const content = getContent();

      rerender(
        <AnimatedHeight>
          <p>Inna treść</p>
        </AnimatedHeight>,
      );

      expect(screen.getByText("Inna treść").parentElement).toBe(content);
      expect(content.parentElement).toBe(box);
    });
  });
});

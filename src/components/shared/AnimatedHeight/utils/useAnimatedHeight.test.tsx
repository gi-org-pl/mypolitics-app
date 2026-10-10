import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  HEIGHT_CHANGE_EASING,
  HEIGHT_FOLLOW_WINDOW_MS,
} from "../AnimatedHeight.constants";
import {
  mockResizeObserver,
  type ResizeObserverMock,
} from "./mockResizeObserver";
import { useAnimatedHeight } from "./useAnimatedHeight";

const DURATION_MS = 300;

interface AnimationStub {
  cancel: ReturnType<typeof vi.fn>;
  onfinish: (() => void) | null;
}

const Box = ({
  durationMs = DURATION_MS,
  isDrawn = true,
}: {
  durationMs?: number;
  isDrawn?: boolean;
}) => {
  const { boxRef, contentRef } = useAnimatedHeight(durationMs);

  return isDrawn ? (
    <div ref={boxRef} data-testid="box">
      <div ref={contentRef} data-testid="content" />
    </div>
  ) : null;
};

describe("useAnimatedHeight()", () => {
  let observer: ResizeObserverMock;
  let animations: AnimationStub[];
  let animate: ReturnType<typeof vi.fn>;
  let now: number;

  const getBox = () => screen.getByTestId("box");

  // Lets the time between two changes of height pass.
  const wait = (ms: number) => {
    now += ms;
  };

  beforeEach(() => {
    observer = mockResizeObserver();
    animations = [];
    animate = vi.fn(() => {
      const animation: AnimationStub = { cancel: vi.fn(), onfinish: null };

      animations.push(animation);

      return animation;
    });
    now = 1000;
    HTMLElement.prototype.animate = animate as never;
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false })),
    );
    vi.spyOn(performance, "now").mockImplementation(() => now);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    Reflect.deleteProperty(HTMLElement.prototype, "animate");
  });

  describe("when the box appears", () => {
    it("watches the content, and nothing else", () => {
      render(<Box />);

      expect(observer.observers).toHaveLength(1);
      expect(observer.observers[0].elements).toEqual([
        screen.getByTestId("content"),
      ]);
    });

    it("does not move for the first height it sees", () => {
      render(<Box />);

      observer.resize(136);

      expect(animate).not.toHaveBeenCalled();
      expect(getBox()).not.toHaveAttribute("data-animating");
    });
  });

  describe("when the height of the content changes", () => {
    it("moves the box from the old height to the new one, for the time it is given", () => {
      render(<Box />);

      observer.resize(136);
      wait(5000);
      observer.resize(169);

      expect(animate).toHaveBeenCalledTimes(1);
      expect(animate.mock.contexts[0]).toBe(getBox());
      expect(animate).toHaveBeenCalledWith(
        [{ height: "136px" }, { height: "169px" }],
        { duration: DURATION_MS, easing: HEIGHT_CHANGE_EASING },
      );
    });

    it("moves to a smaller height as well", () => {
      render(<Box durationMs={120} />);

      observer.resize(169);
      wait(5000);
      observer.resize(136);

      expect(animate).toHaveBeenCalledWith(
        [{ height: "169px" }, { height: "136px" }],
        { duration: 120, easing: HEIGHT_CHANGE_EASING },
      );
    });

    it("marks the box as moving until the movement is over", () => {
      render(<Box />);

      observer.resize(136);
      wait(5000);
      observer.resize(169);

      expect(getBox()).toHaveAttribute("data-animating", "true");

      animations[0].onfinish?.();

      expect(getBox()).not.toHaveAttribute("data-animating");
    });

    it("does nothing when the same height is reported again", () => {
      render(<Box />);

      observer.resize(136);
      wait(5000);
      observer.resize(136);

      expect(animate).not.toHaveBeenCalled();
    });

    it("never measures the box while it is at rest", () => {
      render(<Box />);

      const measure = vi.spyOn(getBox(), "getBoundingClientRect");

      observer.resize(136);
      wait(5000);
      observer.resize(169);

      expect(measure).not.toHaveBeenCalled();
    });
  });

  describe("when the height changes again while the box is moving", () => {
    it("starts the new movement where the box is, and ends the old one", () => {
      render(<Box />);
      vi.spyOn(getBox(), "getBoundingClientRect").mockReturnValue({
        height: 150,
      } as DOMRect);

      observer.resize(136);
      wait(5000);
      observer.resize(169);
      wait(HEIGHT_FOLLOW_WINDOW_MS);
      observer.resize(120);

      expect(animations[0].cancel).toHaveBeenCalledTimes(1);
      expect(animate).toHaveBeenLastCalledWith(
        [{ height: "150px" }, { height: "120px" }],
        { duration: DURATION_MS, easing: HEIGHT_CHANGE_EASING },
      );
      expect(getBox()).toHaveAttribute("data-animating", "true");
    });

    it("is not ended by the end of the movement it replaced", () => {
      render(<Box />);

      observer.resize(136);
      wait(5000);
      observer.resize(169);
      wait(HEIGHT_FOLLOW_WINDOW_MS);
      observer.resize(120);
      animations[0].onfinish?.();

      expect(getBox()).toHaveAttribute("data-animating", "true");
      expect(animations[1].cancel).not.toHaveBeenCalled();

      animations[1].onfinish?.();

      expect(getBox()).not.toHaveAttribute("data-animating");
    });
  });

  describe("when the height changes frame by frame, moved by something inside", () => {
    it("follows it instead of moving a second time", () => {
      render(<Box />);

      observer.resize(100);
      wait(5000);
      observer.resize(104);

      expect(animate).toHaveBeenCalledTimes(1);

      wait(16);
      observer.resize(109);
      wait(16);
      observer.resize(115);
      wait(HEIGHT_FOLLOW_WINDOW_MS - 1);
      observer.resize(121);

      expect(animate).toHaveBeenCalledTimes(1);
      expect(animations[0].cancel).toHaveBeenCalledTimes(1);
      expect(getBox()).not.toHaveAttribute("data-animating");
    });

    it("moves again for a change that comes after it", () => {
      render(<Box />);

      observer.resize(100);
      wait(5000);
      observer.resize(104);
      wait(16);
      observer.resize(109);
      wait(HEIGHT_FOLLOW_WINDOW_MS);
      observer.resize(169);

      expect(animate).toHaveBeenCalledTimes(2);
      expect(animate).toHaveBeenLastCalledWith(
        [{ height: "109px" }, { height: "169px" }],
        { duration: DURATION_MS, easing: HEIGHT_CHANGE_EASING },
      );
    });
  });

  describe("given a taker who asked for less movement", () => {
    it("does not move: the box has the new height at once", () => {
      vi.stubGlobal(
        "matchMedia",
        vi.fn(() => ({ matches: true })),
      );
      render(<Box />);

      observer.resize(136);
      wait(5000);
      observer.resize(169);

      expect(animate).not.toHaveBeenCalled();
      expect(getBox()).not.toHaveAttribute("data-animating");
    });

    it("ends a movement that was under way when they asked", () => {
      render(<Box />);

      observer.resize(136);
      wait(5000);
      observer.resize(169);
      vi.stubGlobal(
        "matchMedia",
        vi.fn(() => ({ matches: true })),
      );
      wait(5000);
      observer.resize(200);

      expect(animations[0].cancel).toHaveBeenCalledTimes(1);
      expect(animate).toHaveBeenCalledTimes(1);
      expect(getBox()).not.toHaveAttribute("data-animating");
    });
  });

  describe("given a browser without ResizeObserver", () => {
    it("watches nothing and moves nothing", () => {
      vi.unstubAllGlobals();

      render(<Box />);

      expect(observer.observers).toHaveLength(0);
      expect(getBox()).toBeInTheDocument();
      expect(animate).not.toHaveBeenCalled();
    });
  });

  describe("given nothing drawn", () => {
    it("watches nothing", () => {
      render(<Box isDrawn={false} />);

      expect(observer.observers).toHaveLength(0);
    });
  });

  describe("when the box is taken off screen", () => {
    it("stops watching and ends the movement", () => {
      const { unmount } = render(<Box />);

      observer.resize(136);
      wait(5000);
      observer.resize(169);
      unmount();

      expect(observer.observers[0].isDisconnected).toBe(true);
      expect(animations[0].cancel).toHaveBeenCalledTimes(1);
    });

    it("stops watching when nothing was moving", () => {
      const { unmount } = render(<Box />);

      unmount();

      expect(observer.observers[0].isDisconnected).toBe(true);
    });
  });

  describe("when the duration changes", () => {
    it("watches again, and moves for the new time", () => {
      const { rerender } = render(<Box />);

      rerender(<Box durationMs={500} />);

      expect(observer.observers).toHaveLength(2);
      expect(observer.observers[0].isDisconnected).toBe(true);

      observer.resize(136);
      wait(5000);
      observer.resize(169);

      expect(animate).toHaveBeenCalledWith(
        [{ height: "136px" }, { height: "169px" }],
        { duration: 500, easing: HEIGHT_CHANGE_EASING },
      );
    });
  });

  describe("between renders", () => {
    it("keeps watching with the same observer", () => {
      const { rerender } = render(<Box />);

      rerender(<Box />);

      expect(observer.observers).toHaveLength(1);
    });
  });
});

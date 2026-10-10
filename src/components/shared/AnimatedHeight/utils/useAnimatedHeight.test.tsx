import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  HEIGHT_CHANGE_EASING,
  HEIGHT_CHANGE_MIN_PX,
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
  ready: Promise<void>;
  start: () => Promise<void>; // the browser has applied the animation
  abort: () => Promise<void>; // the animation was ended before that
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

  const getBox = () => screen.getByTestId("box");

  // Something inside the box is animating these properties of its own.
  const animateInside = (properties: string[]) => {
    screen.getByTestId("content").getAnimations = (() => [
      {
        playState: "running",
        effect: {
          getKeyframes: () => [
            Object.fromEntries(properties.map((name) => [name, "0px"])),
          ],
        },
      },
    ]) as never;
  };

  beforeEach(() => {
    observer = mockResizeObserver();
    animations = [];
    animate = vi.fn(() => {
      let settle: { start: () => void; abort: () => void } = {
        start: () => undefined,
        abort: () => undefined,
      };
      const ready = new Promise<void>((resolve, reject) => {
        settle = { start: resolve, abort: () => reject(new Error("aborted")) };
      });
      const animation: AnimationStub = {
        cancel: vi.fn(),
        onfinish: null,
        ready,
        start: () => act(async () => settle.start()),
        abort: () => act(async () => settle.abort()),
      };

      animations.push(animation);

      return animation;
    });
    HTMLElement.prototype.animate = animate as never;
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false })),
    );
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
      expect(getBox().style.height).toBe("");
    });
  });

  describe("when the height of the content changes", () => {
    it("moves the box from the old height to the new one, for the time it is given", () => {
      render(<Box />);

      observer.resize(136);
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
      observer.resize(136);

      expect(animate).toHaveBeenCalledWith(
        [{ height: "169px" }, { height: "136px" }],
        { duration: 120, easing: HEIGHT_CHANGE_EASING },
      );
    });

    it("holds the box at the old height until the animation has taken over", async () => {
      render(<Box />);

      observer.resize(136);
      observer.resize(169);

      expect(getBox().style.height).toBe("136px");

      await animations[0].start();

      expect(getBox().style.height).toBe("");
      expect(animations[0].cancel).not.toHaveBeenCalled();
    });

    it("marks the box as moving until the movement is over", async () => {
      render(<Box />);

      observer.resize(136);
      observer.resize(169);

      expect(getBox()).toHaveAttribute("data-animating", "true");

      await animations[0].start();

      expect(getBox()).toHaveAttribute("data-animating", "true");

      animations[0].onfinish?.();

      expect(getBox()).not.toHaveAttribute("data-animating");
      expect(getBox().style.height).toBe("");
    });

    it("does nothing when the same height is reported again", () => {
      render(<Box />);

      observer.resize(136);
      observer.resize(136);

      expect(animate).not.toHaveBeenCalled();
    });

    it("has the new height at once when the change is less than a pixel", () => {
      render(<Box />);

      observer.resize(136);
      observer.resize(136 + HEIGHT_CHANGE_MIN_PX - 0.1);

      expect(animate).not.toHaveBeenCalled();
      expect(getBox()).not.toHaveAttribute("data-animating");

      observer.resize(137 + HEIGHT_CHANGE_MIN_PX);

      expect(animate).toHaveBeenCalledTimes(1);
    });

    it("never measures the box while it is at rest", () => {
      render(<Box />);

      const measure = vi.spyOn(getBox(), "getBoundingClientRect");

      observer.resize(136);
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
      observer.resize(169);
      observer.resize(120);

      expect(animations[0].cancel).toHaveBeenCalledTimes(1);
      expect(animate).toHaveBeenLastCalledWith(
        [{ height: "150px" }, { height: "120px" }],
        { duration: DURATION_MS, easing: HEIGHT_CHANGE_EASING },
      );
      expect(getBox()).toHaveAttribute("data-animating", "true");
      expect(getBox().style.height).toBe("150px");
    });

    it("is not ended, or let go of, by the movement it replaced", async () => {
      render(<Box />);
      vi.spyOn(getBox(), "getBoundingClientRect").mockReturnValue({
        height: 150,
      } as DOMRect);

      observer.resize(136);
      observer.resize(169);
      observer.resize(120);
      await animations[0].abort();
      animations[0].onfinish?.();

      expect(getBox()).toHaveAttribute("data-animating", "true");
      expect(getBox().style.height).toBe("150px");
      expect(animations[1].cancel).not.toHaveBeenCalled();

      await animations[1].start();
      animations[1].onfinish?.();

      expect(getBox()).not.toHaveAttribute("data-animating");
      expect(getBox().style.height).toBe("");
    });

    it("is not let go of by an older movement that started late", async () => {
      render(<Box />);
      vi.spyOn(getBox(), "getBoundingClientRect").mockReturnValue({
        height: 150,
      } as DOMRect);

      observer.resize(136);
      observer.resize(169);
      observer.resize(120);
      await animations[0].start();

      expect(getBox().style.height).toBe("150px");
    });

    it("stays where it is when the content comes back to that height", () => {
      render(<Box />);
      vi.spyOn(getBox(), "getBoundingClientRect").mockReturnValue({
        height: 150.4,
      } as DOMRect);

      observer.resize(136);
      observer.resize(169);
      observer.resize(150);

      expect(animations[0].cancel).toHaveBeenCalledTimes(1);
      expect(animate).toHaveBeenCalledTimes(1);
      expect(getBox()).not.toHaveAttribute("data-animating");
      expect(getBox().style.height).toBe("");
    });
  });

  describe("when something inside is animating a height of its own", () => {
    it("follows it from the first frame on, however long it goes on", () => {
      render(<Box />);
      animateInside(["gridTemplateRows"]);

      observer.resize(100);
      observer.resize(112);
      observer.resize(131);
      observer.resize(188);

      expect(animate).not.toHaveBeenCalled();
      expect(getBox()).not.toHaveAttribute("data-animating");
      expect(getBox().style.height).toBe("");
    });

    it("moves when what is animated inside is not a height", () => {
      render(<Box />);
      animateInside(["translate", "opacity"]);

      observer.resize(136);
      observer.resize(169);

      expect(animate).toHaveBeenCalledTimes(1);
    });

    it("ends its own movement to follow", () => {
      render(<Box />);

      observer.resize(136);
      observer.resize(169);
      animateInside(["height"]);
      observer.resize(180);

      expect(animations[0].cancel).toHaveBeenCalledTimes(1);
      expect(animate).toHaveBeenCalledTimes(1);
      expect(getBox()).not.toHaveAttribute("data-animating");
      expect(getBox().style.height).toBe("");
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
      observer.resize(169);

      expect(animate).not.toHaveBeenCalled();
      expect(getBox()).not.toHaveAttribute("data-animating");
      expect(getBox().style.height).toBe("");
    });

    it("ends a movement that was under way when they asked", () => {
      render(<Box />);

      observer.resize(136);
      observer.resize(169);
      vi.stubGlobal(
        "matchMedia",
        vi.fn(() => ({ matches: true })),
      );
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
    it("stops watching and ends the movement, also one that had not started", async () => {
      const { unmount } = render(<Box />);
      const box = getBox();

      observer.resize(136);
      observer.resize(169);
      unmount();
      await animations[0].abort();

      expect(observer.observers[0].isDisconnected).toBe(true);
      expect(animations[0].cancel).toHaveBeenCalledTimes(1);
      expect(box.style.height).toBe("");
      expect(box).not.toHaveAttribute("data-animating");
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

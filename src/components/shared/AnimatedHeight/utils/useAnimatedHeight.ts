import { useEffect, useRef } from "react";

import { prefersReducedMotion } from "@/utils/motion/prefersReducedMotion";

import {
  HEIGHT_CHANGE_EASING,
  HEIGHT_CHANGE_MIN_PX,
} from "../AnimatedHeight.constants";
import type { AnimatedHeightRefs } from "../AnimatedHeight.types";
import { isHeightAnimated } from "./isHeightAnimated";

// Moves the height of a box to the height of its content whenever the
// content's height changes. The content is watched with a ResizeObserver, so
// nothing is measured in a loop; the box is left at its automatic height and
// only an animation lies over it while it moves, so nothing has to be put
// back afterwards. The one measurement there is happens when a change arrives
// while the box is still moving: the new movement starts where the box is.
//
// The box is also held at the height it starts from until the animation has
// taken over, so the frame in which the change is seen shows the old height
// whenever a browser first applies an animation that was started while it
// was laying the page out.
//
// Nothing moves under reduced motion, for the first height that is seen, or
// for a change of less than a pixel. A movement that something inside is
// already animating is followed as it is (see `HEIGHT_PROPERTIES`). Where the
// browser has no ResizeObserver the box simply has the height of its content.
export const useAnimatedHeight = (durationMs: number): AnimatedHeightRefs => {
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const content = contentRef.current;

    if (!box || !content || typeof ResizeObserver === "undefined") return;

    let height: number | undefined;
    let animation: Animation | undefined;

    const release = () => {
      box.style.height = "";
    };

    const stop = () => {
      animation?.cancel();
      animation = undefined;
      delete box.dataset.animating;
      release();
    };

    const observer = new ResizeObserver(([entry]) => {
      const previous = height;
      const next = entry.contentRect.height;

      height = next;

      if (previous === undefined || previous === next) return;

      const from = animation ? box.getBoundingClientRect().height : previous;

      stop();

      if (
        Math.abs(next - from) < HEIGHT_CHANGE_MIN_PX ||
        isHeightAnimated(content) ||
        prefersReducedMotion()
      ) {
        return;
      }

      box.style.height = `${from}px`;

      const started = box.animate(
        [{ height: `${from}px` }, { height: `${next}px` }],
        { duration: durationMs, easing: HEIGHT_CHANGE_EASING },
      );

      // An animation that is ended before it has started says so by turning
      // its promise down: the box is let go of where it is ended.
      started.ready.then(
        () => {
          if (animation === started) release();
        },
        () => undefined,
      );
      started.onfinish = () => {
        if (animation === started) stop();
      };
      animation = started;
      box.dataset.animating = "true";
    });

    observer.observe(content);

    return () => {
      observer.disconnect();
      stop();
    };
  }, [durationMs]);

  return { boxRef, contentRef };
};

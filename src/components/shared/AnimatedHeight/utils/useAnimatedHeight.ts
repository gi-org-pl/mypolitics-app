import { useEffect, useRef } from "react";

import { prefersReducedMotion } from "@/utils/motion/prefersReducedMotion";

import {
  HEIGHT_CHANGE_EASING,
  HEIGHT_FOLLOW_WINDOW_MS,
} from "../AnimatedHeight.constants";
import type { AnimatedHeightRefs } from "../AnimatedHeight.types";

// Moves the height of a box to the height of its content whenever the
// content's height changes. The content is watched with a ResizeObserver, so
// nothing is measured in a loop; the box is left at its automatic height and
// only an animation lies over it while it moves, so nothing has to be put
// back afterwards. The one measurement there is happens when a change arrives
// while the box is still moving: the new movement starts where the box is.
//
// Nothing moves under reduced motion, for the first height that is seen, or
// for a movement that something inside is already animating (see
// `HEIGHT_FOLLOW_WINDOW_MS`). Where the browser has no ResizeObserver the
// box simply has the height of its content.
export const useAnimatedHeight = (durationMs: number): AnimatedHeightRefs => {
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const content = contentRef.current;

    if (!box || !content || typeof ResizeObserver === "undefined") return;

    let height: number | undefined;
    let changedAt = Number.NEGATIVE_INFINITY;
    let animation: Animation | undefined;

    const stop = () => {
      animation?.cancel();
      animation = undefined;
      delete box.dataset.animating;
    };

    const observer = new ResizeObserver(([entry]) => {
      const previous = height;
      const next = entry.contentRect.height;

      height = next;

      if (previous === undefined || previous === next) return;

      const now = performance.now();
      const isFollowing = now - changedAt < HEIGHT_FOLLOW_WINDOW_MS;
      const from = animation ? box.getBoundingClientRect().height : previous;

      changedAt = now;
      stop();

      if (isFollowing || prefersReducedMotion()) return;

      const started = box.animate(
        [{ height: `${from}px` }, { height: `${next}px` }],
        { duration: durationMs, easing: HEIGHT_CHANGE_EASING },
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

import { HEIGHT_PROPERTIES } from "../AnimatedHeight.constants";

// Whether something inside an element is moving a height of its own right
// now: a CSS transition, a CSS animation or a Web Animations animation of a
// property that sets a height - an explanation that opens, another animated
// box further down. The browser is asked for the animations it is running;
// nothing is measured. Where it cannot be asked, the answer is no.
export const isHeightAnimated = (element: Element): boolean =>
  typeof element.getAnimations === "function" &&
  element
    .getAnimations({ subtree: true })
    .some(
      ({ playState, effect }) =>
        playState === "running" &&
        effect !== null &&
        "getKeyframes" in effect &&
        (effect as KeyframeEffect)
          .getKeyframes()
          .some((keyframe) =>
            HEIGHT_PROPERTIES.some((property) => property in keyframe),
          ),
    );

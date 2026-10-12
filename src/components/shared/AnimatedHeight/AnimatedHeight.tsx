import { HEIGHT_CHANGE_MS } from "./AnimatedHeight.constants";
import type { AnimatedHeightProps } from "./AnimatedHeight.types";
import { useAnimatedHeight } from "./utils/useAnimatedHeight";

// A box that changes its height smoothly when the height of its content
// changes, so that what stands under it moves instead of jumping. It takes
// the width of its parent and adds nothing to the look: no padding, no
// background.
//
// While the height moves, what does not fit yet is cut off at the top and the
// bottom of the box, never at its sides; at rest nothing is cut off, so a
// focus ring or a menu of the content may reach outside it.
export const AnimatedHeight = ({
  durationMs = HEIGHT_CHANGE_MS,
  children,
}: AnimatedHeightProps) => {
  const { boxRef, contentRef } = useAnimatedHeight(durationMs);

  return (
    <div ref={boxRef} className="w-full data-[animating=true]:overflow-y-clip">
      <div ref={contentRef} className="w-full">
        {children}
      </div>
    </div>
  );
};

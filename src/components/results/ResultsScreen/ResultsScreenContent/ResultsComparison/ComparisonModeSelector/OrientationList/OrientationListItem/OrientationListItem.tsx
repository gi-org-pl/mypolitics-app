import type { CSSProperties } from "react";

import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { getSafeColor } from "@/utils/color/getSafeColor";
import { toSingleLine } from "@/utils/text/toSingleLine";
import { useUrlFailure } from "@/utils/url/useUrlFailure";

import type { OrientationListItemProps } from "./OrientationListItem.types";

// One orientation of the list: its mark - a disc in its colour with its image
// on it - and its name, as a control that picks it. The name is written in
// full, on as many lines as it takes. An image that fails to load leaves the
// disc alone, and an orientation with no colour gets the grey one a bar has.
export const OrientationListItem = ({
  orientation: { id, name, imageUrl, color },
  onPick,
}: OrientationListItemProps) => {
  const { hasFailed, markFailed } = useUrlFailure(imageUrl);
  const safeColor = getSafeColor(color);

  return (
    <button
      type="button"
      className={`flex min-h-12 w-full min-w-0 cursor-pointer items-center gap-2 rounded-3xl border border-gi-ash px-3.75 py-2.75 text-left hover:bg-gi-ash ${FOCUS_CLASS_NAME}`}
      onClick={() => onPick(id)}
    >
      <span
        data-testid="orientation-list-item-mark"
        className={`flex size-6 shrink-0 overflow-hidden rounded-full ${safeColor ? "bg-(--mark-color)" : "bg-gi-dark-gray"}`}
        style={
          safeColor
            ? ({ "--mark-color": safeColor } as CSSProperties)
            : undefined
        }
      >
        {imageUrl && !hasFailed && (
          <img
            src={imageUrl}
            alt=""
            className="size-full object-cover"
            onError={markFailed}
          />
        )}
      </span>
      <span className="min-w-0 text-base leading-5 font-bold wrap-break-word text-gi-primary">
        {toSingleLine(name)}
      </span>
    </button>
  );
};

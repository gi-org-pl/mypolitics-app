import { OrientationAvatar } from "@/components/results/OrientationAvatar/OrientationAvatar";
import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { toSingleLine } from "@/utils/text/toSingleLine";

import type { OrientationListItemProps } from "./OrientationListItem.types";

// One orientation of the list: its mark - a disc in its colour with its image
// on it - and its name, as a control that picks it. The name is written in
// full, on as many lines as it takes.
export const OrientationListItem = ({
  orientation: { id, name, imageUrl, color },
  onPick,
}: OrientationListItemProps) => (
  <button
    type="button"
    className={`flex min-h-12 w-full min-w-0 cursor-pointer items-center gap-2 rounded-3xl border border-gi-ash px-3.75 py-2.75 text-left hover:bg-gi-ash ${FOCUS_CLASS_NAME}`}
    onClick={() => onPick(id)}
  >
    <OrientationAvatar imageUrl={imageUrl} color={color} />
    <span className="min-w-0 text-base leading-5 font-bold wrap-break-word text-gi-primary">
      {toSingleLine(name)}
    </span>
  </button>
);

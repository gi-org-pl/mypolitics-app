import type { CSSProperties } from "react";

import { getSafeColor } from "@/utils/color/getSafeColor";
import { toSingleLine } from "@/utils/text/toSingleLine";
import { useUrlFailure } from "@/utils/url/useUrlFailure";

import { LOOK_CLASS_NAMES } from "./OrientationChip.constants";
import type { OrientationChipProps } from "./OrientationChip.types";

export const OrientationChip = ({
  name,
  imageUrl,
  color,
  look = "emphasised",
}: OrientationChipProps) => {
  const displayName = toSingleLine(name);
  const { hasFailed, markFailed } = useUrlFailure(imageUrl);
  const displayImageUrl =
    look === "neutral" || hasFailed ? undefined : imageUrl;

  if (!displayName && !displayImageUrl) return null;

  const safeColor = look === "emphasised" ? getSafeColor(color) : undefined;
  const fillClassName = safeColor ? "bg-(--chip-color)" : "bg-gi-dark-gray";

  return (
    <div
      data-testid="orientation-chip"
      data-look={look}
      className={`flex h-8 w-full min-w-0 items-center justify-center gap-2 rounded-lg px-4 ${LOOK_CLASS_NAMES[look]} ${look === "emphasised" ? fillClassName : ""}`}
      style={
        safeColor ? ({ "--chip-color": safeColor } as CSSProperties) : undefined
      }
    >
      {displayImageUrl && (
        <img
          data-testid="orientation-chip-image"
          onError={markFailed}
          src={displayImageUrl}
          alt=""
          className={`-mx-2.5 size-8 shrink-0 object-cover ${look === "quiet" ? "opacity-20 brightness-0" : ""}`}
        />
      )}
      {displayName && (
        <span className="min-w-0 truncate text-base leading-5 font-bold">
          {displayName}
        </span>
      )}
    </div>
  );
};

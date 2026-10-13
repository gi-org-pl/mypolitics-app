import type { CSSProperties } from "react";

import { IMAGE_FIT_CLASS_NAMES } from "@/constants/image";
import { getSafeColor } from "@/utils/color/getSafeColor";
import { getImageKind } from "@/utils/url/getImageKind";
import { useUrlFailure } from "@/utils/url/useUrlFailure";

import { AVATAR_SIZE_CLASS_NAMES } from "./OrientationAvatar.constants";
import type { OrientationAvatarProps } from "./OrientationAvatar.types";

// The mark of an orientation beside its name: a disc in its colour with its
// image on it. It is decoration - the name beside it says who it is. An
// image that fails to load leaves the disc alone, and an orientation with no
// colour gets the grey one a bar has.
export const OrientationAvatar = ({
  imageUrl,
  color,
  size = "small",
}: OrientationAvatarProps) => {
  const { hasFailed, markFailed } = useUrlFailure(imageUrl);
  const safeColor = getSafeColor(color);

  return (
    <span
      data-testid="orientation-avatar"
      className={`flex shrink-0 overflow-hidden rounded-full ${AVATAR_SIZE_CLASS_NAMES[size]} ${safeColor ? "bg-(--avatar-color)" : "bg-gi-dark-gray"}`}
      style={
        safeColor
          ? ({ "--avatar-color": safeColor } as CSSProperties)
          : undefined
      }
    >
      {imageUrl && !hasFailed && (
        <img
          src={imageUrl}
          alt=""
          className={`size-full ${IMAGE_FIT_CLASS_NAMES[getImageKind(imageUrl)]}`}
          onError={markFailed}
        />
      )}
    </span>
  );
};

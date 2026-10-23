import { IMAGE_FIT_CLASS_NAMES } from "@/constants/image";
import { getImageKind } from "@/utils/url/getImageKind";
import { useUrlFailure } from "@/utils/url/useUrlFailure";

import type { PreviewIconProps } from "./PreviewIcon.types";

// The icon of a pole as a preview: what stands on the cap of its bar, at half
// the size. The image is laid out in the 32 px of a cap and drawn at half
// scale, so a glyph keeps the share of the disc it has on the cap instead of
// filling it. An icon that fails to load is left out, as an orientation
// without an icon is.
export const PreviewIcon = ({ imageUrl }: PreviewIconProps) => {
  const { hasFailed, markFailed } = useUrlFailure(imageUrl);

  return hasFailed ? null : (
    <span className="-ml-1 flex size-4 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-gi-ash ring-inset">
      <img
        src={imageUrl}
        alt=""
        className={`size-8 max-w-none shrink-0 origin-top-left scale-50 opacity-40 brightness-0 ${IMAGE_FIT_CLASS_NAMES[getImageKind(imageUrl)]}`}
        onError={markFailed}
      />
    </span>
  );
};

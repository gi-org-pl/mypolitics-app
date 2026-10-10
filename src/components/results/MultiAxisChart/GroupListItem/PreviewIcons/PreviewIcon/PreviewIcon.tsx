import { useUrlFailure } from "@/utils/url/useUrlFailure";

import type { PreviewIconProps } from "./PreviewIcon.types";

// An icon that fails to load is left out, as an orientation without an icon
// is.
export const PreviewIcon = ({ imageUrl }: PreviewIconProps) => {
  const { hasFailed, markFailed } = useUrlFailure(imageUrl);

  return hasFailed ? null : (
    <span className="-ml-1 size-4 shrink-0 rounded-full bg-white ring-1 ring-gi-ash ring-inset">
      <img
        src={imageUrl}
        alt=""
        className="size-4 object-cover opacity-40 brightness-0"
        onError={markFailed}
      />
    </span>
  );
};

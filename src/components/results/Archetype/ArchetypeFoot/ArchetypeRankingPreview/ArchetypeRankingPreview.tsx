import { Avatar } from "@gi-org-pl/athena";

import plusIcon from "@/assets/icons/plus.svg";
import { AVATAR_IMAGE_FIT_CLASS_NAMES } from "@/constants/image";
import { withKeys } from "@/utils/array/withKeys";
import { getImageKind } from "@/utils/url/getImageKind";
import type { ArchetypeRankingPreviewProps } from "./ArchetypeRankingPreview.types";
import { usePreviewImages } from "./utils/usePreviewImages";

const ITEM_CLASS_NAME =
  "size-4 shrink-0 rounded-full border border-gi-dark-ash bg-white";

export const ArchetypeRankingPreview = ({
  ranking,
}: ArchetypeRankingPreviewProps) => {
  const { images, markFailed } = usePreviewImages(ranking);

  if (images.length === 0) return null;

  return (
    <span
      data-testid="archetype-ranking-preview"
      className="flex shrink-0 -space-x-1"
    >
      {withKeys(images, (imageUrl) => imageUrl).map(({ item, key }) => (
        <Avatar
          key={key}
          size="small"
          src={item}
          alt=""
          dataTestId="archetype-ranking-preview-image"
          className={`${ITEM_CLASS_NAME} ${AVATAR_IMAGE_FIT_CLASS_NAMES[getImageKind(item)]}`}
          onErrorCapture={() => markFailed(item)}
        />
      ))}
      {ranking.length > images.length && (
        <span
          data-testid="archetype-ranking-preview-more"
          className={`flex items-center justify-center ${ITEM_CLASS_NAME}`}
        >
          <img src={plusIcon} alt="" />
        </span>
      )}
    </span>
  );
};

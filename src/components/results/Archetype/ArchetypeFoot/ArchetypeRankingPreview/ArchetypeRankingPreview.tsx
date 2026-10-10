import { Avatar } from "@gi-org-pl/athena";

import plusIcon from "@/assets/icons/plus.svg";
import { withKeys } from "@/utils/array/withKeys";

import type { ArchetypeEntry } from "../../Archetype.types";
import { usePreviewImages } from "./utils/usePreviewImages";

interface ArchetypeRankingPreviewProps {
  ranking: ArchetypeEntry[];
}

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
          className={ITEM_CLASS_NAME}
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

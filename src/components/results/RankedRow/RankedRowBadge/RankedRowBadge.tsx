import { Badge } from "@gi-org-pl/athena";

import { toSingleLine } from "@/utils/text/toSingleLine";

import type { RankedBadge } from "../RankedRow.types";

interface RankedRowBadgeProps {
  badge?: RankedBadge;
}

const BADGE_CLASS_NAME =
  "gap-1 rounded-lg p-1 text-[11px] font-bold [&>[aria-hidden=true]]:size-3";

export const RankedRowBadge = ({ badge }: RankedRowBadgeProps) => {
  const iconUrl = toSingleLine(badge?.iconUrl);
  const text = toSingleLine(badge?.text);

  if (iconUrl === "" && text === "") return null;

  return (
    <span data-testid="ranked-row-badge" className="flex shrink-0">
      {text === "" ? (
        <span className="flex size-5 items-center justify-center rounded-lg bg-gi-ash">
          <img
            src={iconUrl}
            alt={toSingleLine(badge?.label)}
            className="size-3"
          />
        </span>
      ) : (
        <Badge
          size="small"
          className={BADGE_CLASS_NAME}
          LeftIcon={
            iconUrl === "" ? undefined : (
              <img src={iconUrl} alt="" className="size-3" />
            )
          }
        >
          {text}
        </Badge>
      )}
    </span>
  );
};

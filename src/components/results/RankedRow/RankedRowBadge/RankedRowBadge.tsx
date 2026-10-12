import { Badge } from "@gi-org-pl/athena";

import { toSingleLine } from "@/utils/text/toSingleLine";
import { useUrlFailure } from "@/utils/url/useUrlFailure";

import type { RankedBadge } from "../RankedRow.types";

interface RankedRowBadgeProps {
  badge?: RankedBadge;
}

const BADGE_CLASS_NAME =
  "gap-1 rounded-lg p-1 text-[11px] font-bold [&>[aria-hidden=true]]:size-3";

export const RankedRowBadge = ({ badge }: RankedRowBadgeProps) => {
  const authoredIconUrl = toSingleLine(badge?.iconUrl);
  const authoredText = toSingleLine(badge?.text);
  const { hasFailed, markFailed } = useUrlFailure(authoredIconUrl);

  // An icon that fails to load is treated as no icon: the badge keeps its
  // text, and a badge that was its icon alone says its label instead.
  const iconUrl = hasFailed ? "" : authoredIconUrl;
  const text =
    hasFailed && authoredText === ""
      ? toSingleLine(badge?.label)
      : authoredText;

  if (iconUrl === "" && text === "") return null;

  return (
    <span data-testid="ranked-row-badge" className="flex shrink-0">
      {text === "" ? (
        <span className="flex size-5 items-center justify-center rounded-lg bg-gi-ash">
          <img
            src={iconUrl}
            alt={toSingleLine(badge?.label)}
            className="size-3"
            onError={markFailed}
          />
        </span>
      ) : (
        <Badge
          size="small"
          className={BADGE_CLASS_NAME}
          LeftIcon={
            iconUrl === "" ? undefined : (
              <img
                src={iconUrl}
                alt=""
                className="size-3"
                onError={markFailed}
              />
            )
          }
        >
          {text}
        </Badge>
      )}
    </span>
  );
};

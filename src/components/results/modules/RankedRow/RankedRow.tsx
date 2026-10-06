import { Badge } from "@gi-org-pl/athena";

import { UniversalAxis } from "@/components/shared/UniversalAxis/UniversalAxis";

import type { RankedBadge, RankedRowProps } from "./RankedRow.types";

const PREFIX_SEPARATOR = "—";

const BADGE_CLASS_NAME =
  "gap-1 rounded-lg p-1 text-[11px] font-bold [&>[aria-hidden=true]]:size-3";

const toSingleLine = (text?: string): string =>
  typeof text === "string" ? text.replace(/\s+/g, " ").trim() : "";

const renderBadge = (badge?: RankedBadge) => {
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

export const RankedRow = ({
  entry,
  comparison,
  prefix,
  isHeading = false,
}: RankedRowProps) => {
  const orientation = entry?.orientation;
  const value = entry?.value;
  const prefixText = toSingleLine(prefix);
  const Name = isHeading ? "h3" : "p";

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <div className="flex min-h-4 min-w-0 items-center gap-2">
        <Name
          data-testid="ranked-row-name"
          className={`min-h-5 min-w-0 truncate text-base leading-5 font-bold text-gi-primary ${isHeading ? "-my-[0.5px]" : "-my-0.5"}`}
        >
          {prefixText !== "" && (
            <>
              <span className="text-gi-primary/50">
                {prefixText} {PREFIX_SEPARATOR}
              </span>{" "}
            </>
          )}
          {toSingleLine(orientation?.name)}
        </Name>
        {renderBadge(entry?.badge)}
      </div>
      <UniversalAxis
        start={
          orientation && typeof value === "number"
            ? { orientation, value }
            : undefined
        }
        comparison={comparison}
        marker={false}
      />
    </div>
  );
};

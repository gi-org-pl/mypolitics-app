import { OrientationAvatar } from "@/components/results/OrientationAvatar/OrientationAvatar";
import { UniversalAxis } from "@/components/shared/UniversalAxis/UniversalAxis";
import { isNumber } from "@/utils/number/isNumber";
import { toSingleLine } from "@/utils/text/toSingleLine";

import type { RankedRowProps } from "./RankedRow.types";
import { RankedRowBadge } from "./RankedRowBadge/RankedRowBadge";
import { RankedRowName } from "./RankedRowName/RankedRowName";

// One row of a ranking: the name, with its badge, over a one-sided bar of
// its value. A row of a list that has no values at all has no bar: an empty
// track under every name says nothing, so the row is the mark of its
// orientation beside the name, as the old site listed the parties of a
// result.
export const RankedRow = ({
  entry,
  comparison,
  prefix,
  isHeading = false,
  hasBar = true,
}: RankedRowProps) => {
  const orientation = entry?.orientation;
  const value = entry?.value;

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <div
        className={`flex min-w-0 items-center gap-2 ${hasBar ? "min-h-4" : "min-h-8"}`}
      >
        {!hasBar && (
          <OrientationAvatar
            imageUrl={orientation?.imageUrl}
            color={orientation?.color}
            size="regular"
          />
        )}
        <RankedRowName
          name={toSingleLine(orientation?.name)}
          prefix={toSingleLine(prefix)}
          isHeading={isHeading}
        />
        <RankedRowBadge badge={entry?.badge} />
      </div>
      {hasBar && (
        <UniversalAxis
          start={
            orientation && isNumber(value) ? { orientation, value } : undefined
          }
          comparison={comparison}
          marker={false}
        />
      )}
    </div>
  );
};

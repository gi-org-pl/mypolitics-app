import { UniversalAxis } from "@/components/shared/UniversalAxis/UniversalAxis";
import { isNumber } from "@/utils/number/isNumber";
import { toSingleLine } from "@/utils/text/toSingleLine";

import type { RankedRowProps } from "./RankedRow.types";
import { RankedRowBadge } from "./RankedRowBadge/RankedRowBadge";
import { RankedRowName } from "./RankedRowName/RankedRowName";

export const RankedRow = ({
  entry,
  comparison,
  prefix,
  isHeading = false,
}: RankedRowProps) => {
  const orientation = entry?.orientation;
  const value = entry?.value;

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <div className="flex min-h-4 min-w-0 items-center gap-2">
        <RankedRowName
          name={toSingleLine(orientation?.name)}
          prefix={toSingleLine(prefix)}
          isHeading={isHeading}
        />
        <RankedRowBadge badge={entry?.badge} />
      </div>
      <UniversalAxis
        start={
          orientation && isNumber(value) ? { orientation, value } : undefined
        }
        comparison={comparison}
        marker={false}
      />
    </div>
  );
};

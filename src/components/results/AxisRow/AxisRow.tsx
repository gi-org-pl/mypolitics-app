import { Trans } from "@lingui/react/macro";

import { UniversalAxis } from "@/components/shared/UniversalAxis/UniversalAxis";
import { toSingleLine } from "@/utils/text/toSingleLine";

import type { AxisRowProps } from "./AxisRow.types";

const PART_CLASS_NAME = "max-w-full min-w-0 truncate";
const QUIET_CLASS_NAME = "text-gi-primary/50";
const STRONG_CLASS_NAME = "text-gi-primary";

export const AxisRow = ({
  name,
  leadName,
  start,
  end,
  marker,
  showLabels = false,
  comparison,
}: AxisRowProps) => {
  const displayName = toSingleLine(name);
  const displayLeadName = toSingleLine(leadName);

  return (
    <div data-testid="axis-row" className="flex w-full min-w-0 flex-col gap-2">
      {(displayName || displayLeadName) && (
        <h3 className="-my-0.5 flex min-w-0 flex-wrap gap-x-[0.25em] text-base leading-5 font-bold">
          {displayName && displayLeadName ? (
            <Trans>
              <span className={`${PART_CLASS_NAME} ${QUIET_CLASS_NAME}`}>
                {displayName}{" "}
              </span>
              <span className={`${PART_CLASS_NAME} ${STRONG_CLASS_NAME}`}>
                <span className={QUIET_CLASS_NAME}>—</span> {displayLeadName}
              </span>
            </Trans>
          ) : displayName ? (
            <span className={`${PART_CLASS_NAME} ${QUIET_CLASS_NAME}`}>
              {displayName}
            </span>
          ) : (
            <span className={`${PART_CLASS_NAME} ${STRONG_CLASS_NAME}`}>
              {displayLeadName}
            </span>
          )}
        </h3>
      )}
      <UniversalAxis
        start={start}
        end={end}
        comparison={comparison}
        marker={marker}
        showLabels={showLabels}
      />
    </div>
  );
};

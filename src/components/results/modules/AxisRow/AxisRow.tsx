import { Trans } from "@lingui/react/macro";

import { UniversalAxis } from "@/components/shared/UniversalAxis/UniversalAxis";

import type { AxisRowProps } from "./AxisRow.types";

const QUIET_CLASS_NAME = "min-w-0 truncate text-gi-primary/50";
const STRONG_CLASS_NAME = "min-w-0 truncate text-gi-primary";

const toSingleLine = (text?: string): string =>
  typeof text === "string" ? text.replace(/\s+/g, " ").trim() : "";

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
        <h3 className="-my-0.5 flex min-w-0 gap-[0.25em] text-base leading-5 font-bold">
          {displayName && displayLeadName ? (
            <Trans>
              <span className={QUIET_CLASS_NAME}>{displayName} —</span>
              <span className={STRONG_CLASS_NAME}>{displayLeadName}</span>
            </Trans>
          ) : displayName ? (
            <span className={QUIET_CLASS_NAME}>{displayName}</span>
          ) : (
            <span className={STRONG_CLASS_NAME}>{displayLeadName}</span>
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

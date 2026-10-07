import { useLingui } from "@lingui/react/macro";

import chevronDownIcon from "@/assets/icons/chevron-down.svg";
import { AxisRow } from "@/components/results/AxisRow/AxisRow";

import { GROUP_CONTROL_CLASS_NAME } from "../MultiAxisChart.constants";
import type { AxisComparison, AxisGroup } from "../MultiAxisChart.types";
import { getAxisComparison } from "../utils/getAxisComparison";
import { getLeadName } from "../utils/getLeadName";
import { useGroupName } from "../utils/useGroupName";
import { GroupMarker } from "./GroupMarker/GroupMarker";

interface OpenGroupProps {
  group: AxisGroup;
  marker?: number | false;
  comparison?: AxisComparison;
  onClose: () => void;
  onCloseControlFocusChange?: (isFocused: boolean) => void;
}

export const OpenGroup = ({
  group,
  marker,
  comparison,
  onClose,
  onCloseControlFocusChange,
}: OpenGroupProps) => {
  const { t } = useLingui();
  const name = useGroupName(group);

  const [headline, ...otherAxes] = group.axes;

  return (
    <>
      <div
        data-testid="multi-axis-chart-open-group"
        className="flex flex-col gap-3 px-4 pb-4"
      >
        <AxisRow
          name={group.name}
          leadName={getLeadName(headline)}
          start={headline.start}
          end={headline.end}
          marker={false}
          comparison={getAxisComparison(headline, comparison)}
          showLabels
        />
        <div className="relative flex flex-col gap-3">
          <hr className="-mx-4 -mb-px border-gi-ash" />
          {otherAxes.map((axis) => (
            <AxisRow
              key={axis.id}
              start={axis.start}
              end={axis.end}
              marker={false}
              comparison={getAxisComparison(axis, comparison)}
              showLabels
            />
          ))}
          <GroupMarker marker={marker} />
        </div>
      </div>
      <button
        type="button"
        aria-expanded
        aria-label={
          name ? t`Wróć do grup, zamknij grupę: ${name}` : t`Wróć do grup`
        }
        className={`${GROUP_CONTROL_CLASS_NAME} flex h-[33px] items-center justify-center bg-gi-ash before:-top-3 before:bottom-0 hover:bg-gi-dark-ash`}
        onClick={onClose}
        onFocus={() => onCloseControlFocusChange?.(true)}
        onBlur={() => onCloseControlFocusChange?.(false)}
      >
        <img src={chevronDownIcon} alt="" className="rotate-180" />
      </button>
    </>
  );
};

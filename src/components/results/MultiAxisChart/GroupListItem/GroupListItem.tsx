import { useLingui } from "@lingui/react/macro";

import chevronDownIcon from "@/assets/icons/chevron-down.svg";
import { AxisRow } from "@/components/results/AxisRow/AxisRow";

import { GROUP_CONTROL_CLASS_NAME } from "../MultiAxisChart.constants";
import type { AxisComparison, AxisGroup } from "../MultiAxisChart.types";
import { getAxisComparison } from "../utils/getAxisComparison";
import { getLeadName } from "../utils/getLeadName";
import { useGroupName } from "../utils/useGroupName";
import { PreviewIcons } from "./PreviewIcons/PreviewIcons";

interface GroupListItemProps {
  group: AxisGroup;
  marker?: number | false;
  comparison?: AxisComparison;
  onOpen: (groupId: string) => void;
}

const FOOT_CLASS_NAME = "border-x border-b border-gi-ash";

export const GroupListItem = ({
  group,
  marker,
  comparison,
  onOpen,
}: GroupListItemProps) => {
  const { t } = useLingui();
  const name = useGroupName(group);

  const [headline] = group.axes;

  return (
    <li data-testid="multi-axis-chart-group">
      <div className="px-4">
        <AxisRow
          name={group.name}
          leadName={getLeadName(headline)}
          start={headline.start}
          end={headline.end}
          marker={marker}
          comparison={getAxisComparison(headline, comparison)}
          showLabels
        />
      </div>
      {group.axes.length > 1 ? (
        <button
          type="button"
          data-group-id={headline.id}
          aria-expanded={false}
          aria-label={name ? t`Pokaż grupę: ${name}` : t`Pokaż grupę`}
          className={`${GROUP_CONTROL_CLASS_NAME} ${FOOT_CLASS_NAME} grid grid-cols-[1fr_auto_1fr] items-center px-[15px] py-2 before:-inset-y-1.5 hover:bg-gi-ash/50`}
          onClick={() => onOpen(headline.id)}
        >
          <PreviewIcons axes={group.axes} side="start" />
          <img src={chevronDownIcon} alt="" className="mx-3" />
          <PreviewIcons axes={group.axes} side="end" />
        </button>
      ) : (
        <div className={`h-[17px] rounded-b-2xl ${FOOT_CLASS_NAME}`} />
      )}
    </li>
  );
};

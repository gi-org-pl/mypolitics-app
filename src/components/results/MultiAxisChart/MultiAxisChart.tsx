import { ModuleWrapper } from "@/components/shared/ModuleWrapper/ModuleWrapper";

import { GroupListItem } from "./GroupListItem/GroupListItem";
import type { MultiAxisChartProps } from "./MultiAxisChart.types";
import { OpenGroup } from "./OpenGroup/OpenGroup";
import { getDrawnGroups } from "./utils/getDrawnGroups";
import { useOpenGroup } from "./utils/useOpenGroup";

export const MultiAxisChart = ({
  title,
  groups,
  marker,
  comparison,
  onStatsClick,
  onInfoClick,
}: MultiAxisChartProps) => {
  const drawnGroups = getDrawnGroups(groups);
  const {
    openGroup,
    bodyRef,
    openGroupById,
    closeGroup,
    setCloseControlFocused,
  } = useOpenGroup(drawnGroups);

  return (
    <ModuleWrapper
      title={title}
      onStatsClick={onStatsClick}
      onInfoClick={onInfoClick}
    >
      {drawnGroups.length > 0 && (
        <div ref={bodyRef} tabIndex={-1} className="-mx-4 -mb-4 outline-none">
          {openGroup ? (
            <OpenGroup
              group={openGroup}
              marker={marker}
              comparison={comparison}
              onClose={closeGroup}
              onCloseControlFocusChange={setCloseControlFocused}
            />
          ) : (
            <ul className="flex flex-col gap-4">
              {drawnGroups.map((group) => (
                <GroupListItem
                  key={group.axes[0].id}
                  group={group}
                  marker={marker}
                  comparison={comparison}
                  onOpen={openGroupById}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </ModuleWrapper>
  );
};

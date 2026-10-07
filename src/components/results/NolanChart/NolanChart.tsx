import { ModuleWrapper } from "@/components/shared/ModuleWrapper/ModuleWrapper";
import { toSingleLine } from "@/utils/text/toSingleLine";

import type { NolanChartProps } from "./NolanChart.types";
import { NolanMap } from "./NolanMap/NolanMap";
import { NolanRows } from "./NolanRows/NolanRows";
import { OpenControl } from "./OpenControl/OpenControl";
import { QuadrantTitle } from "./QuadrantTitle/QuadrantTitle";
import { getAxisValues } from "./utils/getAxisValues";
import { getNolanPosition } from "./utils/getNolanPosition";
import { getQuadrantColor } from "./utils/getQuadrantColor";
import { useMapDescription } from "./utils/useMapDescription";
import { useNolanTitle } from "./utils/useNolanTitle";
import { useOpenRows } from "./utils/useOpenRows";

export const NolanChart = ({
  horizontal,
  vertical,
  quadrants,
  centreName,
  comparison,
  onStatsClick,
  onInfoClick,
}: NolanChartProps) => {
  const { isOpen, rowsId, toggle } = useOpenRows();

  const position = getNolanPosition(
    getAxisValues(horizontal),
    getAxisValues(vertical),
  );
  const otherPosition = getNolanPosition(
    comparison?.horizontal,
    comparison?.vertical,
  );
  const horizontalName = toSingleLine(horizontal?.name);
  const verticalName = toSingleLine(vertical?.name);

  const title = useNolanTitle(position, quadrants, centreName);
  const description = useMapDescription({
    title: title.name,
    horizontalName,
    verticalName,
    position,
    otherName: comparison?.orientation?.name,
    otherPosition,
    quadrants,
    centreName,
  });

  return (
    <ModuleWrapper
      title={
        title.look === "plain" ? (
          title.name || undefined
        ) : (
          <QuadrantTitle {...title} look={title.look} />
        )
      }
      ariaLabel={title.name}
      onStatsClick={onStatsClick}
      onInfoClick={onInfoClick}
    >
      <div className="-mx-4 -mb-4">
        <div className="px-4 pb-4">
          <NolanMap
            description={description}
            horizontalName={horizontalName}
            verticalName={verticalName}
            quadrants={quadrants}
            position={position}
            otherOrientation={comparison?.orientation}
            otherPosition={otherPosition}
          />
        </div>
        {isOpen && (
          <NolanRows
            id={rowsId}
            horizontal={horizontal}
            vertical={vertical}
            position={position}
            color={getQuadrantColor(quadrants, position)}
            comparison={comparison}
          />
        )}
        <OpenControl isOpen={isOpen} controlsId={rowsId} onToggle={toggle} />
      </div>
    </ModuleWrapper>
  );
};

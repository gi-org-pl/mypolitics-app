import { ModuleWrapper } from "@/components/shared/ModuleWrapper/ModuleWrapper";
import { UniversalAxis } from "@/components/shared/UniversalAxis/UniversalAxis";

import { OrientationChip } from "../OrientationChip/OrientationChip";
import type { DoubleAxisChartProps } from "./DoubleAxisChart.types";
import { useDoubleAxisTitle } from "./utils/useDoubleAxisTitle";

export const DoubleAxisChart = ({
  start,
  end,
  marker,
  comparison,
  onStatsClick,
  onInfoClick,
}: DoubleAxisChartProps) => {
  const { name, chip } = useDoubleAxisTitle(start, end);

  return (
    <ModuleWrapper
      title={chip ? <OrientationChip {...chip} /> : undefined}
      ariaLabel={name}
      onStatsClick={onStatsClick}
      onInfoClick={onInfoClick}
    >
      <UniversalAxis
        start={start}
        end={end}
        comparison={comparison}
        marker={marker}
        showLabels
      />
    </ModuleWrapper>
  );
};

import { ModuleWrapper } from "@/components/shared/ModuleWrapper/ModuleWrapper";
import { UniversalAxis } from "@/components/shared/UniversalAxis/UniversalAxis";
import { DEFAULT_MARKER_POSITION } from "@/components/shared/UniversalAxis/UniversalAxis.constants";
import { getAxisLayout } from "@/components/shared/UniversalAxis/utils/getAxisLayout";

import { OrientationChip } from "../OrientationChip/OrientationChip";
import type { SingleAxisChartProps } from "./SingleAxisChart.types";

export const SingleAxisChart = ({
  orientation,
  value,
  marker,
  comparison,
  onStatsClick,
  onInfoClick,
}: SingleAxisChartProps) => {
  const layout = getAxisLayout({ start: { orientation, value }, marker });
  const hasValue = layout.start?.hasValue === true;
  const emphasisLine = layout.marker ?? DEFAULT_MARKER_POSITION;
  const isEmphasised =
    layout.start?.hasValue === true && layout.start.value >= emphasisLine;

  const name = typeof orientation.name === "string" ? orientation.name : "";
  const hasTitle = name.trim() !== "" || Boolean(orientation.imageUrl);

  return (
    <ModuleWrapper
      title={
        hasTitle ? (
          <OrientationChip
            name={name}
            imageUrl={orientation.imageUrl}
            color={orientation.color}
            look={isEmphasised ? "emphasised" : "quiet"}
          />
        ) : undefined
      }
      ariaLabel={name}
      onStatsClick={onStatsClick}
      onInfoClick={onInfoClick}
    >
      <UniversalAxis
        start={hasValue ? { orientation, value } : undefined}
        comparison={comparison}
        marker={marker}
      />
    </ModuleWrapper>
  );
};

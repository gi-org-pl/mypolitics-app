import { ModuleWrapper } from "@/components/shared/ModuleWrapper/ModuleWrapper";
import { UniversalAxis } from "@/components/shared/UniversalAxis/UniversalAxis";
import type { AxisEntry } from "@/types/axis";
import { isNumber } from "@/utils/number/isNumber";
import { hasOrientationTitle } from "@/utils/results/hasOrientationTitle";
import { toSingleLine } from "@/utils/text/toSingleLine";
import { OrientationChip } from "../OrientationChip/OrientationChip";
import type { SingleAxisChartProps } from "./SingleAxisChart.types";
import { isAxisEmphasised } from "./utils/isAxisEmphasised";

export const SingleAxisChart = ({
  orientation,
  value,
  marker,
  comparison,
  onStatsClick,
  onInfoClick,
}: SingleAxisChartProps) => {
  const entry: AxisEntry = { orientation, value };
  const name = toSingleLine(orientation.name);

  return (
    <ModuleWrapper
      title={
        hasOrientationTitle(orientation) ? (
          <OrientationChip
            name={name}
            imageUrl={orientation.imageUrl}
            color={orientation.color}
            look={isAxisEmphasised(entry, marker) ? "emphasised" : "quiet"}
          />
        ) : undefined
      }
      ariaLabel={name}
      onStatsClick={onStatsClick}
      onInfoClick={onInfoClick}
    >
      <UniversalAxis
        start={isNumber(value) ? entry : undefined}
        comparison={comparison}
        marker={marker}
      />
    </ModuleWrapper>
  );
};

import { useLingui } from "@lingui/react/macro";

import { ModuleWrapper } from "@/components/shared/ModuleWrapper/ModuleWrapper";
import { UniversalAxis } from "@/components/shared/UniversalAxis/UniversalAxis";
import type { AxisOrientation } from "@/components/shared/UniversalAxis/UniversalAxis.types";
import { getAxisLead } from "@/utils/results/getAxisLead";

import { OrientationChip } from "../OrientationChip/OrientationChip";
import type { DoubleAxisChartProps } from "./DoubleAxisChart.types";

const getName = (orientation: AxisOrientation): string =>
  typeof orientation.name === "string"
    ? orientation.name.replace(/\s+/g, " ").trim()
    : "";

export const DoubleAxisChart = ({
  start,
  end,
  marker,
  comparison,
  onStatsClick,
  onInfoClick,
}: DoubleAxisChartProps) => {
  const { t } = useLingui();

  const lead = getAxisLead(start.value, end.value);
  const leadingOrientation =
    lead === null ? null : { start, end }[lead].orientation;

  const getTieName = (): string => {
    const startName = getName(start.orientation);
    const endName = getName(end.orientation);

    return startName && endName
      ? t`${startName} / ${endName}`
      : startName || endName;
  };

  const name = leadingOrientation ? getName(leadingOrientation) : getTieName();
  const hasTitle = name !== "" || Boolean(leadingOrientation?.imageUrl);

  return (
    <ModuleWrapper
      title={
        hasTitle ? (
          <OrientationChip
            name={name}
            imageUrl={leadingOrientation?.imageUrl}
            color={leadingOrientation?.color}
            look={leadingOrientation ? "emphasised" : "neutral"}
          />
        ) : undefined
      }
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

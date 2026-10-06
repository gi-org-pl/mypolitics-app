import { useLingui } from "@lingui/react/macro";
import { type CSSProperties, useId, useState } from "react";

import chevronDownIcon from "@/assets/icons/chevron-down.svg";
import { ModuleWrapper } from "@/components/shared/ModuleWrapper/ModuleWrapper";
import type { AxisEntry } from "@/components/shared/UniversalAxis/UniversalAxis.types";
import type { ResultEntry } from "@/types/results";
import { getSafeColor } from "@/utils/color/getSafeColor";

import { AxisRow } from "../AxisRow/AxisRow";
import { OrientationChip } from "../OrientationChip/OrientationChip";
import type {
  NolanAxis,
  NolanAxisValues,
  NolanChartProps,
  NolanLevelNames,
  NolanPoleSide,
  NolanPosition,
} from "./NolanChart.types";
import { NolanMap } from "./NolanMap/NolanMap";
import { formatCoordinate } from "./utils/formatCoordinate";
import { getAxisLevel } from "./utils/getAxisLevel";
import { getNolanPosition } from "./utils/getNolanPosition";

const CONTROL_CLASS_NAME =
  "relative flex h-[33px] w-full cursor-pointer items-center justify-center rounded-b-2xl outline-none transition-colors duration-300 before:absolute before:inset-x-0 before:-top-3 before:bottom-0 before:content-[''] focus-visible:ring-[3px] focus-visible:ring-gi-secondary/50 focus-visible:ring-inset";

const toSingleLine = (text?: string): string =>
  typeof text === "string" ? text.replace(/\s+/g, " ").trim() : "";

const getAxisValues = (axis?: NolanAxis): NolanAxisValues => ({
  start: axis?.start?.entry?.value,
  end: axis?.end?.entry?.value,
});

const getLevelName = (
  names: NolanLevelNames | undefined,
  level: "moderate" | "extreme",
): string => {
  const otherLevel = level === "moderate" ? "extreme" : "moderate";

  return toSingleLine(names?.[level]) || toSingleLine(names?.[otherLevel]);
};

export const NolanChart = ({
  horizontal,
  vertical,
  quadrants,
  centreName,
  comparison,
  onStatsClick,
  onInfoClick,
}: NolanChartProps) => {
  const { t } = useLingui();
  const rowsId = useId();
  const [isOpen, setIsOpen] = useState(false);

  const position = getNolanPosition(
    getAxisValues(horizontal),
    getAxisValues(vertical),
  );
  const otherPosition = comparison
    ? getNolanPosition(comparison.horizontal, comparison.vertical)
    : null;

  const displayCentreName = toSingleLine(centreName);

  const getQuadrantName = (placed: NolanPosition): string =>
    placed.level === "centre"
      ? ""
      : getLevelName(quadrants?.[placed.quadrant]?.names, placed.level);

  const quadrantName = position ? getQuadrantName(position) : "";
  const title = position ? quadrantName || displayCentreName : t`Brak wyniku`;
  const quadrantColor = position
    ? getSafeColor(quadrants?.[position.quadrant]?.color)
    : undefined;

  const xAxis = toSingleLine(horizontal?.name);
  const yAxis = toSingleLine(vertical?.name);

  const getDescription = (): string => {
    const parts: string[] = [];

    if (position) {
      const x = formatCoordinate(position.x);
      const y = formatCoordinate(position.y);

      parts.push(
        title
          ? t`${title}. ${xAxis}: ${x}, ${yAxis}: ${y}`
          : t`${xAxis}: ${x}, ${yAxis}: ${y}`,
      );
    } else {
      parts.push(title);
    }

    if (comparison && otherPosition) {
      const name = toSingleLine(comparison.party?.name);
      const quadrant = getQuadrantName(otherPosition) || displayCentreName;

      if (name && quadrant) parts.push(t`${name}: ${quadrant}`);
    }

    return parts.join(". ");
  };

  const renderTitle = () => {
    if (!position || !quadrantName) return title || undefined;

    if (position.level === "extreme") {
      return <OrientationChip name={title} color={quadrantColor} />;
    }

    return (
      <div
        data-testid="nolan-chart-title"
        className={`flex h-8 w-full min-w-0 items-center justify-center rounded-lg px-4 ${
          quadrantColor
            ? "bg-(--nolan-color)/10 text-(--nolan-color)"
            : "bg-gi-dark-gray/10 text-gi-dark-gray"
        }`}
        style={
          quadrantColor
            ? ({ "--nolan-color": quadrantColor } as CSSProperties)
            : undefined
        }
      >
        <span className="min-w-0 truncate text-base leading-5 font-bold">
          {title}
        </span>
      </div>
    );
  };

  const renderRow = (
    axis: NolanAxis,
    coordinate: number | undefined,
    lean: NolanPoleSide | undefined,
    otherValues?: NolanAxisValues,
  ) => {
    const getEntry = (side: NolanPoleSide): ResultEntry => ({
      ...axis[side].entry,
      orientation: {
        ...axis[side].entry.orientation,
        color: side === lean ? quadrantColor : undefined,
      },
    });
    const level =
      coordinate === undefined ? "centre" : getAxisLevel(coordinate).level;
    const leadName =
      lean && level !== "centre"
        ? toSingleLine(axis[lean].names?.[level])
        : undefined;
    const otherValue = otherValues?.start;
    const rowComparison: AxisEntry | undefined =
      comparison?.party && typeof otherValue === "number"
        ? { orientation: comparison.party, value: otherValue }
        : undefined;

    return (
      <div className="border-t border-gi-ash p-4">
        <AxisRow
          name={axis.name}
          leadName={leadName}
          start={getEntry("start")}
          end={getEntry("end")}
          comparison={rowComparison}
        />
      </div>
    );
  };

  return (
    <ModuleWrapper
      title={renderTitle()}
      ariaLabel={title}
      onStatsClick={onStatsClick}
      onInfoClick={onInfoClick}
    >
      <div className="-mx-4 -mb-4">
        <div className="px-4 pb-4">
          <NolanMap
            description={getDescription()}
            horizontalName={xAxis}
            verticalName={yAxis}
            quadrants={quadrants}
            position={position}
            otherParty={comparison?.party}
            otherPosition={otherPosition}
          />
        </div>
        {isOpen && (
          <div id={rowsId} data-testid="nolan-chart-rows">
            {renderRow(
              horizontal,
              position?.x,
              position?.poles.horizontal,
              comparison?.horizontal,
            )}
            {renderRow(
              vertical,
              position?.y,
              position?.poles.vertical,
              comparison?.vertical,
            )}
          </div>
        )}
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={isOpen ? rowsId : undefined}
          aria-label={isOpen ? t`Ukryj osie` : t`Pokaż osie`}
          className={`${CONTROL_CLASS_NAME} ${
            isOpen
              ? "bg-gi-ash hover:bg-gi-dark-ash"
              : "border-t border-gi-ash hover:bg-gi-ash/50"
          }`}
          onClick={() => setIsOpen((wasOpen) => !wasOpen)}
        >
          <img
            src={chevronDownIcon}
            alt=""
            className={isOpen ? "rotate-180" : ""}
          />
        </button>
      </div>
    </ModuleWrapper>
  );
};

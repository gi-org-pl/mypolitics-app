import { Avatar } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";
import type { CSSProperties } from "react";

import {
  AXIS_LINE_BACKGROUND_CLASS_NAME,
  AXIS_LINE_BORDER_CLASS_NAME,
} from "@/constants/axis";
import { HATCH_CLASS_NAME } from "@/constants/hatch";
import type { AxisLayout, AxisSideLayout } from "@/types/axis";
import { getAxisLayout } from "@/utils/axis/getAxisLayout";

import { LABEL_CLASS_NAME } from "./UniversalAxis.constants";
import type { UniversalAxisProps } from "./UniversalAxis.types";

type AxisSide = "start" | "end";

const VALUE_CLASS_NAME = "text-xs leading-none font-bold whitespace-nowrap";

const toPercent = (value: number): string => `${value}%`;

const getColorStyle = (color?: string): CSSProperties | undefined =>
  color ? ({ "--axis-color": color } as CSSProperties) : undefined;

const getPositionStyle = (position: number): CSSProperties =>
  ({ "--axis-position": toPercent(position) }) as CSSProperties;

const getBackgroundClassName = (color?: string): string =>
  color ? "bg-(--axis-color)" : "bg-gi-dark-gray";

const getTextClassName = (color?: string): string =>
  color ? "text-(--axis-color)" : "text-gi-dark-gray";

const renderFill = (side: AxisSide, entry: AxisSideLayout) => (
  <div
    data-testid={`universal-axis-fill-${side}`}
    className={`absolute inset-y-0 flex items-center bg-linear-to-r from-black/20 to-black/20 ${
      side === "start" ? "left-0 justify-start" : "right-0 justify-end"
    } ${getBackgroundClassName(entry.color)}`}
    style={{ ...getColorStyle(entry.color), width: toPercent(entry.width) }}
  >
    {entry.valuePlacement === "inside" && (
      <span className={`px-4 ${VALUE_CLASS_NAME} text-white`}>
        {entry.displayValue}%
      </span>
    )}
  </div>
);

const renderOutsideValue = (side: AxisSide, entry: AxisSideLayout) => (
  <span
    data-testid={`universal-axis-value-${side}`}
    className={`absolute top-1/2 -translate-y-1/2 ${VALUE_CLASS_NAME} ${getTextClassName(entry.color)} ${
      side === "start"
        ? "left-[max(calc(var(--axis-position)+4px),16px)]"
        : "right-[max(calc(var(--axis-position)+4px),16px)]"
    }`}
    style={{ ...getColorStyle(entry.color), ...getPositionStyle(entry.width) }}
  >
    {entry.displayValue}%
  </span>
);

const renderCap = (
  side: AxisSide,
  entry: AxisSideLayout,
  hasBorder: boolean,
) => {
  const positionClassName = side === "start" ? "left-0" : "right-0";
  const borderClassName = hasBorder
    ? `border ${AXIS_LINE_BORDER_CLASS_NAME}`
    : "";
  const capClassName = `absolute top-0 size-8 rounded-full ${borderClassName} ${positionClassName} ${getBackgroundClassName(entry.color)}`;

  return entry.imageUrl ? (
    <Avatar
      size="small"
      src={entry.imageUrl}
      dataTestId={`universal-axis-cap-${side}`}
      className={capClassName}
      style={getColorStyle(entry.color)}
    />
  ) : (
    <div
      data-testid={`universal-axis-cap-${side}`}
      className={capClassName}
      style={getColorStyle(entry.color)}
    />
  );
};

const renderComparison = (
  comparison: NonNullable<AxisLayout["comparison"]>,
) => {
  const imageClassName = `absolute top-[5px] left-[clamp(0px,calc(var(--axis-position)-11px),calc(100%-22px))] size-[22px] rounded-full border border-gi-primary ${getBackgroundClassName(comparison.color)}`;
  const imageStyle = getColorStyle(comparison.color);

  return (
    <>
      <div
        data-testid="universal-axis-comparison-line"
        className="absolute inset-y-0 left-[clamp(10.5px,calc(var(--axis-position)-0.5px),calc(100%-11.5px))] w-px bg-gi-primary"
      />
      {comparison.imageUrl ? (
        <Avatar
          size="small"
          src={comparison.imageUrl}
          dataTestId="universal-axis-comparison-image"
          className={imageClassName}
          style={imageStyle}
        />
      ) : (
        <div
          data-testid="universal-axis-comparison-image"
          className={imageClassName}
          style={imageStyle}
        />
      )}
    </>
  );
};

export const UniversalAxis = ({
  start,
  end,
  comparison,
  marker,
  showLabels = false,
}: UniversalAxisProps) => {
  const { t } = useLingui();
  const layout = getAxisLayout({ start, end, comparison, marker });

  const hasStartAnchor = layout.mode === "empty" || layout.start !== null;
  const hasEndAnchor = layout.end !== null;
  const isDoubleSided = layout.mode === "double-sided";

  const laneClassName = `${hasStartAnchor ? "left-5" : "left-0"} ${hasEndAnchor ? "right-5" : "right-0"}`;
  const trackShapeClassName = `absolute top-[5px] h-[22px] overflow-hidden border ${laneClassName} ${hasStartAnchor ? "" : "rounded-l-full"} ${hasEndAnchor ? "" : "rounded-r-full"}`;

  const describeEntry = (entry: AxisSideLayout | null) => {
    if (!entry) return null;

    const { name, displayValue: value } = entry;

    return entry.hasValue ? t`${name}: ${value}%` : t`${name}: brak wyniku`;
  };
  const describeComparison = (comparisonLayout: AxisLayout["comparison"]) => {
    if (!comparisonLayout) return null;

    const { name, displayValue: value } = comparisonLayout;

    return t`porównanie z ${name}: ${value}%`;
  };
  const descriptionParts = [
    describeEntry(layout.start),
    describeEntry(layout.end),
    describeComparison(layout.comparison),
  ].filter((part) => part !== null);
  const description =
    descriptionParts.length > 0 ? descriptionParts.join(", ") : t`Brak wyniku`;

  return (
    <div role="img" aria-label={description} className="w-full min-w-0">
      <div className="relative h-8">
        <div
          data-testid="universal-axis-track"
          className={`${trackShapeClassName} border-gi-primary/30 bg-white`}
        >
          {layout.start?.hasValue && renderFill("start", layout.start)}
          {layout.end?.hasValue && renderFill("end", layout.end)}
          {layout.start?.valuePlacement === "outside" &&
            renderOutsideValue("start", layout.start)}
          {layout.end?.valuePlacement === "outside" &&
            renderOutsideValue("end", layout.end)}
        </div>

        {layout.marker !== null && (
          <div className={`absolute inset-y-0 ${laneClassName}`}>
            <div
              data-testid="universal-axis-marker"
              className={`absolute inset-y-0 left-[clamp(0px,calc(var(--axis-position)-0.5px),calc(100%-1px))] w-px ${AXIS_LINE_BACKGROUND_CLASS_NAME}`}
              style={getPositionStyle(layout.marker)}
            />
          </div>
        )}

        {layout.comparison?.band && (
          <div className={`${trackShapeClassName} border-transparent`}>
            <div
              data-testid="universal-axis-band"
              className={`absolute inset-y-0 ${HATCH_CLASS_NAME}`}
              style={{
                left: toPercent(layout.comparison.band.from),
                width: toPercent(
                  layout.comparison.band.to - layout.comparison.band.from,
                ),
              }}
            />
          </div>
        )}

        {layout.mode === "empty" && (
          <div
            data-testid="universal-axis-socket"
            className="absolute top-0 left-0 size-8 rounded-full border border-gi-primary/30 bg-white"
          />
        )}
        {layout.start && renderCap("start", layout.start, !isDoubleSided)}
        {layout.end && renderCap("end", layout.end, !isDoubleSided)}

        {layout.comparison && (
          <div
            className={`absolute inset-y-0 ${laneClassName}`}
            style={getPositionStyle(layout.comparison.position)}
          >
            {renderComparison(layout.comparison)}
          </div>
        )}
      </div>

      {showLabels && (
        <div
          data-testid="universal-axis-labels"
          className={`flex h-3 gap-2 text-xs leading-none font-bold text-gi-primary/50 ${isDoubleSided ? "mt-1" : "mt-2"}`}
        >
          {layout.start && (
            <span className={LABEL_CLASS_NAME}>{layout.start.name}</span>
          )}
          {layout.end && (
            <span className={`ml-auto text-right ${LABEL_CLASS_NAME}`}>
              {layout.end.name}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

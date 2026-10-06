import { getSafeColor } from "@/utils/color/getSafeColor";

import {
  DEFAULT_MARKER_POSITION,
  DOUBLE_SIDED_FIT_THRESHOLD,
  MAX_AXIS_VALUE,
  MIN_AXIS_VALUE,
  ONE_SIDED_FIT_THRESHOLD,
} from "../UniversalAxis.constants";
import type {
  AxisBand,
  AxisComparisonLayout,
  AxisEntry,
  AxisLayout,
  AxisMode,
  AxisSideLayout,
  AxisValuePlacement,
  UniversalAxisProps,
} from "../UniversalAxis.types";

const clampAxisValue = (value: number): number =>
  Math.min(MAX_AXIS_VALUE, Math.max(MIN_AXIS_VALUE, value));

type AxisEntryWithValue = AxisEntry & { value: number };

const isPresentEntry = (entry?: AxisEntry): entry is AxisEntry =>
  entry?.orientation !== undefined;

const hasEntryValue = (entry: AxisEntry): entry is AxisEntryWithValue =>
  typeof entry.value === "number" && !Number.isNaN(entry.value);

const getEntryValue = (entry: AxisEntry): number =>
  hasEntryValue(entry) ? clampAxisValue(entry.value) : MIN_AXIS_VALUE;

const getValuePlacement = (
  mode: AxisMode,
  width: number,
  hasComparison: boolean,
): AxisValuePlacement => {
  if (hasComparison || width <= MIN_AXIS_VALUE) return "hidden";

  if (mode === "double-sided") {
    return width >= DOUBLE_SIDED_FIT_THRESHOLD ? "inside" : "hidden";
  }

  return width >= ONE_SIDED_FIT_THRESHOLD ? "inside" : "outside";
};

const getSideLayout = (
  entry: AxisEntry,
  mode: AxisMode,
  width: number,
  hasComparison: boolean,
): AxisSideLayout => {
  const value = getEntryValue(entry);

  return {
    name: entry.orientation.name,
    imageUrl: entry.orientation.imageUrl || undefined,
    color: getSafeColor(entry.orientation.color),
    hasValue: hasEntryValue(entry),
    value,
    displayValue: Math.round(value),
    width,
    valuePlacement: getValuePlacement(mode, width, hasComparison),
  };
};

const getSideWidths = (
  startValue: number | null,
  endValue: number | null,
): [number, number] => {
  const startWidth = startValue ?? 0;
  const endWidth = endValue ?? 0;
  const total = startWidth + endWidth;

  if (total <= MAX_AXIS_VALUE) return [startWidth, endWidth];

  const scale = MAX_AXIS_VALUE / total;

  return [startWidth * scale, endWidth * scale];
};

const getTakerPosition = (
  start: AxisSideLayout | null,
  end: AxisSideLayout | null,
): number | null => {
  const taker = start ?? end;

  if (!taker?.hasValue) return null;

  return start ? start.width : MAX_AXIS_VALUE - taker.width;
};

const getComparisonBand = (
  takerPosition: number | null,
  position: number,
): AxisBand | null => {
  if (takerPosition === null) {
    return { from: MIN_AXIS_VALUE, to: MAX_AXIS_VALUE };
  }

  if (takerPosition === position) return null;

  return {
    from: Math.min(takerPosition, position),
    to: Math.max(takerPosition, position),
  };
};

const getComparisonLayout = (
  comparison: AxisEntryWithValue,
  start: AxisSideLayout | null,
  end: AxisSideLayout | null,
): AxisComparisonLayout => {
  const value = clampAxisValue(comparison.value);
  const position = !start && end ? MAX_AXIS_VALUE - value : value;

  return {
    name: comparison.orientation.name,
    imageUrl: comparison.orientation.imageUrl || undefined,
    color: getSafeColor(comparison.orientation.color),
    value,
    displayValue: Math.round(value),
    position,
    band: getComparisonBand(getTakerPosition(start, end), position),
  };
};

const getMarker = (marker: UniversalAxisProps["marker"]): number | null => {
  if (marker === false) return null;
  if (typeof marker !== "number" || Number.isNaN(marker)) {
    return DEFAULT_MARKER_POSITION;
  }

  return clampAxisValue(marker);
};

const getMode = (hasStart: boolean, hasEnd: boolean): AxisMode => {
  if (hasStart && hasEnd) return "double-sided";
  if (hasStart || hasEnd) return "one-sided";

  return "empty";
};

export const getAxisLayout = ({
  start,
  end,
  comparison,
  marker,
}: UniversalAxisProps): AxisLayout => {
  const presentStart = isPresentEntry(start) ? start : null;
  const presentEnd = isPresentEntry(end) ? end : null;
  const presentComparison =
    isPresentEntry(comparison) && hasEntryValue(comparison) ? comparison : null;
  const mode = getMode(presentStart !== null, presentEnd !== null);
  const hasComparison = presentComparison !== null;

  const [startWidth, endWidth] = getSideWidths(
    presentStart && getEntryValue(presentStart),
    presentEnd && getEntryValue(presentEnd),
  );

  const startLayout = presentStart
    ? getSideLayout(presentStart, mode, startWidth, hasComparison)
    : null;
  const endLayout = presentEnd
    ? getSideLayout(presentEnd, mode, endWidth, hasComparison)
    : null;

  return {
    mode,
    start: startLayout,
    end: endLayout,
    marker: getMarker(marker),
    comparison: presentComparison
      ? getComparisonLayout(presentComparison, startLayout, endLayout)
      : null,
  };
};

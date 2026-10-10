import {
  DEFAULT_MARKER_POSITION,
  DOUBLE_SIDED_COMPARISON_CLEARANCE,
  DOUBLE_SIDED_FIT_THRESHOLD,
  MAX_AXIS_VALUE,
  MIN_AXIS_VALUE,
  ONE_SIDED_COMPARISON_CLEARANCE,
  ONE_SIDED_COMPARISON_FIT_THRESHOLD,
  ONE_SIDED_FIT_THRESHOLD,
} from "@/constants/axis";
import type {
  AxisBand,
  AxisComparisonLayout,
  AxisEntry,
  AxisLayout,
  AxisLayoutInput,
  AxisMode,
  AxisSideLayout,
  AxisValuePlacement,
} from "@/types/axis";
import { getSafeColor } from "@/utils/color/getSafeColor";
import { clamp } from "@/utils/number/clamp";
import { isNumber } from "@/utils/number/isNumber";

const clampAxisValue = (value: number): number =>
  clamp(value, MIN_AXIS_VALUE, MAX_AXIS_VALUE);

type AxisEntryWithValue = AxisEntry & { value: number };

const isPresentEntry = (entry?: AxisEntry): entry is AxisEntry =>
  entry?.orientation !== undefined;

const hasEntryValue = (entry: AxisEntry): entry is AxisEntryWithValue =>
  isNumber(entry.value);

const getEntryValue = (entry: AxisEntry): number =>
  hasEntryValue(entry) ? clampAxisValue(entry.value) : MIN_AXIS_VALUE;

const getOwnValuePlacement = (
  mode: AxisMode,
  width: number,
): AxisValuePlacement => {
  if (width <= MIN_AXIS_VALUE) return "hidden";

  if (mode === "double-sided") {
    return width >= DOUBLE_SIDED_FIT_THRESHOLD ? "inside" : "hidden";
  }

  return width >= ONE_SIDED_FIT_THRESHOLD ? "inside" : "outside";
};

// `comparisonDistance` is how far the other party is drawn from the cap this
// side's number sits at, as a share of the track; null without a comparison.
// Next to a comparison a number stays only inside its fill, and only when the
// band and the other party's image cannot reach it - on a one-sided bar that
// takes a fill a little wider than the usual threshold.
const getValuePlacement = (
  mode: AxisMode,
  width: number,
  comparisonDistance: number | null,
): AxisValuePlacement => {
  const placement = getOwnValuePlacement(mode, width);

  if (comparisonDistance === null) return placement;
  if (placement !== "inside") return "hidden";

  if (mode === "double-sided") {
    return comparisonDistance >= DOUBLE_SIDED_COMPARISON_CLEARANCE
      ? "inside"
      : "hidden";
  }

  return width >= ONE_SIDED_COMPARISON_FIT_THRESHOLD &&
    comparisonDistance >= ONE_SIDED_COMPARISON_CLEARANCE
    ? "inside"
    : "hidden";
};

const getSideLayout = (
  entry: AxisEntry,
  mode: AxisMode,
  width: number,
  comparisonDistance: number | null,
): AxisSideLayout => {
  const value = getEntryValue(entry);

  return {
    name: entry.orientation.name ?? "",
    imageUrl: entry.orientation.imageUrl || undefined,
    color: getSafeColor(entry.orientation.color),
    hasValue: hasEntryValue(entry),
    value,
    displayValue: Math.round(value),
    width,
    valuePlacement: getValuePlacement(mode, width, comparisonDistance),
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

// Where the other party is drawn, measured from the left end of the track.
const getComparisonPosition = (
  comparison: AxisEntryWithValue,
  hasStart: boolean,
  hasEnd: boolean,
): number => {
  const value = clampAxisValue(comparison.value);

  return !hasStart && hasEnd ? MAX_AXIS_VALUE - value : value;
};

// A track that is hatched whole leaves no number clear, whichever side it is.
const getComparisonDistance = (
  side: "start" | "end",
  position: number | null,
  isTrackHatched: boolean,
): number | null => {
  if (position === null) return null;
  if (isTrackHatched) return MIN_AXIS_VALUE;

  return side === "start" ? position : MAX_AXIS_VALUE - position;
};

const getComparisonLayout = (
  comparison: AxisEntryWithValue,
  start: AxisSideLayout | null,
  end: AxisSideLayout | null,
): AxisComparisonLayout => {
  const value = clampAxisValue(comparison.value);
  const position = getComparisonPosition(
    comparison,
    start !== null,
    end !== null,
  );

  return {
    name: comparison.orientation.name ?? "",
    imageUrl: comparison.orientation.imageUrl || undefined,
    color: getSafeColor(comparison.orientation.color),
    value,
    displayValue: Math.round(value),
    position,
    band: getComparisonBand(getTakerPosition(start, end), position),
  };
};

const getMarker = (marker: AxisLayoutInput["marker"]): number | null => {
  if (marker === false) return null;
  if (!isNumber(marker)) return DEFAULT_MARKER_POSITION;

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
}: AxisLayoutInput): AxisLayout => {
  const presentStart = isPresentEntry(start) ? start : null;
  const presentEnd = isPresentEntry(end) ? end : null;
  const presentComparison =
    isPresentEntry(comparison) && hasEntryValue(comparison) ? comparison : null;
  const mode = getMode(presentStart !== null, presentEnd !== null);
  const taker = presentStart ?? presentEnd;
  const isTrackHatched = taker === null || !hasEntryValue(taker);
  const comparisonPosition = presentComparison
    ? getComparisonPosition(
        presentComparison,
        presentStart !== null,
        presentEnd !== null,
      )
    : null;

  const [startWidth, endWidth] = getSideWidths(
    presentStart && getEntryValue(presentStart),
    presentEnd && getEntryValue(presentEnd),
  );

  const startLayout = presentStart
    ? getSideLayout(
        presentStart,
        mode,
        startWidth,
        getComparisonDistance("start", comparisonPosition, isTrackHatched),
      )
    : null;
  const endLayout = presentEnd
    ? getSideLayout(
        presentEnd,
        mode,
        endWidth,
        getComparisonDistance("end", comparisonPosition, isTrackHatched),
      )
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

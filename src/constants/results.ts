import { DEFAULT_MARKER_POSITION } from "@/constants/axis";
import type {
  NolanPoleSide,
  NolanQuadrantKey,
  ResultModule,
  ResultModuleColumn,
  ResultModuleGrouping,
  ResultModuleSelection,
  ResultModuleSlots,
  ResultModuleType,
} from "@/types/results";
import type { MatchBand } from "@/utils/results/getMatchBand";

export const PARTIAL_MATCH_FROM = 50;
export const MATCH_FROM = 80;

// Literal values of the Athena palette tokens named beside them: a bar's
// colour check accepts no CSS variables, so the tokens cannot be referenced.
export const MATCH_BAND_COLORS: Record<MatchBand, string> = {
  none: "oklch(0.601 0.2132 25.79)", // --gi-red
  partial: "oklch(0.7387 0.1464 73.45)", // --gi-orange
  match: "oklch(0.6166 0.1744 138.04)", // --gi-green
};

// The Nolan chart: the distance from the centre at which a position is
// moderate and extreme, and the quadrant each pair of poles stands for.
export const MAP_MODERATE_RADIUS = Math.SQRT2 / 3;
export const MAP_EXTREME_RADIUS = 1;

export const LEVEL_TOLERANCE = 1e-9;

export const QUADRANT_BY_POLES: Record<
  NolanPoleSide,
  Record<NolanPoleSide, NolanQuadrantKey>
> = {
  start: { start: "bottomLeft", end: "topLeft" },
  end: { start: "bottomRight", end: "topRight" },
};

// The colours a compass is drawn in when the quiz sends none, by corner: red
// top left, blue top right, green bottom left, purple bottom right. Literal
// values of the Tailwind palette tokens named beside them - the tokens
// closest to the colours of the design: the map's colour check accepts no CSS
// variables, so the tokens cannot be referenced.
export const DEFAULT_COMPASS_QUADRANTS: Record<
  NolanQuadrantKey,
  { color: string }
> = {
  topLeft: { color: "oklch(70.4% 0.191 22.216)" }, // --color-red-400
  topRight: { color: "oklch(74.6% 0.16 232.661)" }, // --color-sky-400
  bottomLeft: { color: "oklch(76.5% 0.177 163.223)" }, // --color-emerald-400
  bottomRight: { color: "oklch(54.1% 0.281 293.009)" }, // --color-violet-600
};

// How many rows a list shows before its fold when nothing says otherwise.
export const DEFAULT_VISIBLE_ROWS = 3;

// The result modules configuration: what a field of a record may hold, as the
// API sends it.
export const RESULT_MODULE_TYPES = [
  "header",
  "single_axis",
  "double_axis",
  "multi_axis",
  "horizontal_bar",
  "nolan_chart",
  "archetype",
  "traits",
] as const satisfies readonly ResultModuleType[];

export const RESULT_MODULE_COLUMNS = [
  "start",
  "end",
] as const satisfies readonly ResultModuleColumn[];

export const RESULT_MODULE_SELECTIONS = [
  "all",
  "linked_to_leader",
] as const satisfies readonly ResultModuleSelection[];

export const RESULT_MODULE_GROUPINGS = [
  "none",
  "category",
] as const satisfies readonly ResultModuleGrouping[];

// What a field of a record holds when it is missing or cannot be read.
export const RESULT_MODULE_DEFAULTS = {
  column: "start",
  selection: "all",
  groupBy: "none",
  marker: DEFAULT_MARKER_POSITION,
  visibleRows: DEFAULT_VISIBLE_ROWS,
} as const satisfies Partial<ResultModule>;

const NO_SLOTS: ResultModuleSlots = { labels: [], colors: [] };

// The names on the map: its middle, a lean along each axis by pole and level,
// and each corner by level, in full and in a shorter form for a narrow card.
const NOLAN_CHART_LABEL_SLOTS = [
  "centre",
  "horizontalStartModerate",
  "horizontalStartExtreme",
  "horizontalEndModerate",
  "horizontalEndExtreme",
  "verticalStartModerate",
  "verticalStartExtreme",
  "verticalEndModerate",
  "verticalEndExtreme",
  "topLeftModerate",
  "topLeftExtreme",
  "topLeftModerateShort",
  "topLeftExtremeShort",
  "topRightModerate",
  "topRightExtreme",
  "topRightModerateShort",
  "topRightExtremeShort",
  "bottomLeftModerate",
  "bottomLeftExtreme",
  "bottomLeftModerateShort",
  "bottomLeftExtremeShort",
  "bottomRightModerate",
  "bottomRightExtreme",
  "bottomRightModerateShort",
  "bottomRightExtremeShort",
] as const;

const NOLAN_CHART_COLOR_SLOTS = [
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
] as const satisfies readonly NolanQuadrantKey[];

// The slots of each module type. A label or a colour in any other slot is not
// read.
export const RESULT_MODULE_SLOTS: Record<ResultModuleType, ResultModuleSlots> =
  {
    header: { labels: ["link"], colors: [] },
    single_axis: NO_SLOTS,
    double_axis: NO_SLOTS,
    multi_axis: NO_SLOTS,
    horizontal_bar: NO_SLOTS,
    nolan_chart: {
      labels: NOLAN_CHART_LABEL_SLOTS,
      colors: NOLAN_CHART_COLOR_SLOTS,
    },
    archetype: NO_SLOTS,
    traits: NO_SLOTS,
  };

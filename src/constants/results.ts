import {
  DEFAULT_MARKER_POSITION,
  MAX_AXIS_VALUE,
  MIN_AXIS_VALUE,
} from "@/constants/axis";
import type {
  NolanPoleSide,
  NolanQuadrantKey,
  ResultModule,
  ResultModuleColumn,
  ResultModuleKey,
  ResultModuleType,
  ResultModuleValueDefinition,
} from "@/types/results";
import { toValueDefinitions } from "@/utils/result-modules/values/toValueDefinitions";
import { toValueKeys } from "@/utils/result-modules/values/toValueKeys";
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

// What a field of a record holds when it is missing or cannot be read.
export const RESULT_MODULE_DEFAULTS = {
  column: "start",
} as const satisfies Partial<ResultModule>;

// The one type that stands outside the order of the modules.
export const HEADER_MODULE_TYPE = "header" satisfies ResultModuleType;

// The values of a record. Everything about a module beyond what it is, where
// it stands and what it points at is a pair of a key and a value, and two
// tables hold everything about a key: what it may hold, and which module
// types read it. A new setting, a new label and a new colour are an entry in
// the first and its key in the second, and nothing else about a record
// changes: not its type, not the way it is read from the API. No other place
// names a key: the app reads one through `getModuleValues`, and a quiz editor
// builds its form from these two tables.

// What starts the key of a text a module shows in a place of its own, and of
// a colour it paints one in.
export const LABEL_KEY_PREFIX = "label.";
export const COLOR_KEY_PREFIX = "color.";

// The names on the map: its middle, a lean along each axis by pole and level,
// and each corner by level, in full and in a shorter form for a narrow card.
const NOLAN_CHART_LABEL_NAMES = [
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

// The corners of the map, each painted in a colour.
const NOLAN_CHART_CORNERS = [
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
] as const satisfies readonly NolanQuadrantKey[];

// The keys of the map: `label.` and each of its names, `color.` and each of
// its corners.
const NOLAN_CHART_LABEL_KEYS = toValueKeys(
  LABEL_KEY_PREFIX,
  NOLAN_CHART_LABEL_NAMES,
);
const NOLAN_CHART_COLOR_KEYS = toValueKeys(
  COLOR_KEY_PREFIX,
  NOLAN_CHART_CORNERS,
);

// A text the author writes in each language of the quiz, and a colour. Left
// out, a key of either kind is absent: the module then says or paints what it
// does by itself.
const LOCALIZED_TEXT = {
  kind: "localizedText",
} as const satisfies ResultModuleValueDefinition;
const COLOR = { kind: "color" } as const satisfies ResultModuleValueDefinition;

// What each key may hold, and what it is when a record leaves it out or holds
// anything else. The same for every type that reads the key.
export const RESULT_MODULE_VALUE_DEFINITIONS = {
  // The card's name, written by the author.
  title: LOCALIZED_TEXT,
  // The author's explanation of the module.
  description: LOCALIZED_TEXT,
  // Which of its orientations the module shows.
  selection: {
    kind: "choice",
    choices: ["all", "linked_to_leader"],
    fallback: "all",
  },
  // Whether its rows are one list or one list per category.
  groupBy: { kind: "choice", choices: ["none", "category"], fallback: "none" },
  // The reference line on every bar of the module. Nothing switches it off.
  marker: {
    kind: "number",
    min: MIN_AXIS_VALUE,
    max: MAX_AXIS_VALUE,
    whole: false,
    nullable: true,
    fallback: DEFAULT_MARKER_POSITION,
  },
  // How many rows a list shows before its fold.
  visibleRows: {
    kind: "number",
    min: 1,
    max: Number.MAX_SAFE_INTEGER,
    whole: true,
    nullable: false,
    fallback: DEFAULT_VISIBLE_ROWS,
  },
  // The label of the link to the website of the header's orientation.
  "label.link": LOCALIZED_TEXT,
  // A name on the map, and the colour of a corner of it.
  ...toValueDefinitions(NOLAN_CHART_LABEL_KEYS, LOCALIZED_TEXT),
  ...toValueDefinitions(NOLAN_CHART_COLOR_KEYS, COLOR),
} as const satisfies Record<string, ResultModuleValueDefinition>;

// The keys each module type reads. A key that is not listed for a type is
// never read from a record of that type. Every type reads `description`.
export const RESULT_MODULE_KEYS = {
  header: ["description", "label.link"],
  single_axis: ["description", "marker"],
  double_axis: ["description", "marker"],
  multi_axis: ["title", "description", "groupBy", "marker"],
  horizontal_bar: [
    "title",
    "description",
    "selection",
    "groupBy",
    "visibleRows",
  ],
  nolan_chart: [
    "description",
    ...NOLAN_CHART_LABEL_KEYS,
    ...NOLAN_CHART_COLOR_KEYS,
  ],
  archetype: ["title", "description"],
  traits: ["title", "description"],
} as const satisfies Record<ResultModuleType, readonly ResultModuleKey[]>;

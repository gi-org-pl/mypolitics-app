export const AXIS_MODERATE_COORDINATE = 1 / 3;
export const AXIS_EXTREME_COORDINATE = 1;

// The side of a row the taker does not lean to, when the leaning side is dark:
// the literal value of the palette token named beside it, lighter than the
// neutral fallback. A bar's colour check accepts no CSS variables, so the token
// cannot be referenced.
export const ROW_OTHER_SIDE_COLOR = "oklch(0.6057 0.0122 211.04)"; // --gi-gray-hover

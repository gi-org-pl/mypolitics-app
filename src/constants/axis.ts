export const MIN_AXIS_VALUE = 0;
export const MAX_AXIS_VALUE = 100;

export const DEFAULT_MARKER_POSITION = 50;

// The colour of the track's outline (`gi-primary` at 30% on the white track)
// as an opaque colour: a line or a border drawn in it looks the same on a
// fill, on a cap and on the empty track.
export const AXIS_LINE_BACKGROUND_CLASS_NAME =
  "bg-[color-mix(in_srgb,var(--gi-primary)_30%,white)]";
export const AXIS_LINE_BORDER_CLASS_NAME =
  "border-[color-mix(in_srgb,var(--gi-primary)_30%,white)]";

export const ONE_SIDED_FIT_THRESHOLD = 16;
export const DOUBLE_SIDED_FIT_THRESHOLD = 20;

// With a comparison a side shows its number only when the other party is drawn
// at least this share of the track away from the cap the number sits at. Fixed
// like the thresholds, never measured: room for the widest number ("100%") and
// half of the other party's image on the narrowest bar a module draws (a 320px
// viewport), with a few pixels to spare.
export const ONE_SIDED_COMPARISON_CLEARANCE = 26;
export const DOUBLE_SIDED_COMPARISON_CLEARANCE = 28;

// With a comparison ahead the band starts where the fill ends, so a one-sided
// number has to fit its fill on the narrowest bar as well. At the usual
// threshold it is about a pixel wider than the fill there, which nobody sees
// on the white track and which the hatching would cover.
export const ONE_SIDED_COMPARISON_FIT_THRESHOLD = 17;

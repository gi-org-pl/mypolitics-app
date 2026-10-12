export const MIN_AXIS_VALUE = 0;
export const MAX_AXIS_VALUE = 100;

export const DEFAULT_MARKER_POSITION = 50;

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

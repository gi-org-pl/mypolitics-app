import type { ScoreTotal } from "@/types/checkpoint";
import type { OrientationType } from "@/types/orientation";

// A time sample counts as this many seconds at most.
export const TIME_SAMPLE_CAP_SECONDS = 60;
// With fewer timed questions the taker's own pace is not used, and the time
// left comes from the survey's average finish time.
export const MIN_TIMED_QUESTIONS = 5;
export const MIN_MINUTES_LEFT = 1;
export const SECONDS_PER_MINUTE = 60;

// The share of done questions that makes a boundary the midpoint.
export const MIDPOINT_SHARE = 0.5;

// The types of an axis, as the API sends them.
export const AXIS_TYPE = "axis";
export const COMPASS_X_AXIS_TYPE = "compass_x_axis";
export const COMPASS_Y_AXIS_TYPE = "compass_y_axis";

// The lean of an axis with one orientation is measured from here.
export const SINGLE_AXIS_MIDPOINT = 50;

// The API has no mark for an archetype, so the type stands in for it.
export const ARCHETYPE_ORIENTATION_TYPE: OrientationType = "identity";

export const EMPTY_SCORE_TOTAL: ScoreTotal = { points: 0, maximum: 0 };

// The seed of every draw of a session that has none.
export const FALLBACK_SEED = "mypolitics";

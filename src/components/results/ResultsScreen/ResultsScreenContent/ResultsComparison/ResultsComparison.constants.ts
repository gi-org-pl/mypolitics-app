import { ComparisonMode } from "@/types/comparison";

import {
  type ChoosingState,
  ComparisonStatus,
  ComparisonView,
} from "./ResultsComparison.types";

// What the tab is in when it is first opened: the mode selector on the friend
// mode, with an empty field.
export const INITIAL_COMPARISON_STATE: ChoosingState = {
  status: ComparisonStatus.Choosing,
  mode: ComparisonMode.Friend,
  friendId: "",
};

// Whether the taker can choose the other side in a state: pick a mode, enter
// an identifier, pick an orientation. While a result is on the way nothing is
// possible, and a running comparison has to be ended first.
export const IS_CHOICE_OPEN: Record<ComparisonStatus, boolean> = {
  [ComparisonStatus.Choosing]: true,
  [ComparisonStatus.Fetching]: false,
  [ComparisonStatus.Refused]: true,
  [ComparisonStatus.Comparing]: false,
};

// The views of a comparison, by what kind the other side is, in the order of
// the switch. A friend has a result to lay over the modules, so it has both
// views, the results first; an orientation has no result, so it has the
// questions alone, and no switch.
export const COMPARISON_VIEWS: Record<ComparisonMode, ComparisonView[]> = {
  [ComparisonMode.Friend]: [ComparisonView.Results, ComparisonView.Questions],
  [ComparisonMode.Orientation]: [ComparisonView.Questions],
};

// The colour a friend is drawn in: a person has none of their own. A literal
// value of the Tailwind palette token named beside it - the token closest to
// the green of the design, whose bar is that green under the shade every
// fill of a bar has: the colour check of a bar accepts no CSS variables, so
// the token cannot be referenced.
export const FRIEND_COLOR = "oklch(76.5% 0.177 163.223)"; // --color-emerald-400

import {
  type ComparisonState,
  ComparisonStatus,
  type ComparisonView,
} from "../ResultsComparison.types";

// The taker picks a view of the running comparison. Only a view this
// comparison has can be shown.
export const chooseComparisonView = (
  state: ComparisonState,
  view: ComparisonView,
): ComparisonState =>
  state.status === ComparisonStatus.Comparing && state.views.includes(view)
    ? { ...state, view }
    : state;

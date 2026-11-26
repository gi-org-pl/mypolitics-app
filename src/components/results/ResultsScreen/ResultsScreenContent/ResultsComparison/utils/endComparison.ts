import {
  type ComparisonState,
  ComparisonStatus,
} from "../ResultsComparison.types";

// The taker ends the comparison: the mode selector again, with the mode last
// used. Nothing of the other side is kept - the field of the friend is empty.
export const endComparison = (state: ComparisonState): ComparisonState =>
  state.status === ComparisonStatus.Comparing
    ? {
        status: ComparisonStatus.Choosing,
        mode: state.other.mode,
        friendId: "",
      }
    : state;

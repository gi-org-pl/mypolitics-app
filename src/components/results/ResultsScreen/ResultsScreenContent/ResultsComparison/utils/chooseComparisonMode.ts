import type { ComparisonMode } from "@/types/comparison";

import {
  type ComparisonState,
  ComparisonStatus,
} from "../ResultsComparison.types";
import { isChoiceOpen } from "./isChoiceOpen";

// The taker picks a mode: the mode selector shows it. What was typed in the
// field of the friend is kept; a refusal is not, since it was about the
// identifier of the other mode.
export const chooseComparisonMode = (
  state: ComparisonState,
  mode: ComparisonMode,
): ComparisonState =>
  isChoiceOpen(state)
    ? { status: ComparisonStatus.Choosing, mode, friendId: state.friendId }
    : state;

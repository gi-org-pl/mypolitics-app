import type { ComparisonMode } from "@/types/comparison";

import {
  type ComparisonState,
  ComparisonStatus,
} from "../ResultsComparison.types";
import { isChoiceOpen } from "./isChoiceOpen";

// The taker picks a mode: the mode selector shows it. A text that was being
// typed in the field of the friend is kept. A refusal is not, and neither is
// the identifier it was about: kept without its refusal, that identifier
// would stand in the field as if nothing was wrong with it, and nothing would
// ask for it again.
export const chooseComparisonMode = (
  state: ComparisonState,
  mode: ComparisonMode,
): ComparisonState =>
  isChoiceOpen(state)
    ? {
        status: ComparisonStatus.Choosing,
        mode,
        friendId:
          state.status === ComparisonStatus.Refused ? "" : state.friendId,
      }
    : state;

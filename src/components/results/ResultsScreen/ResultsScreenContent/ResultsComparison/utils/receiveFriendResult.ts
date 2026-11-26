import { ComparisonMode } from "@/types/comparison";
import type { ResultLoadResult } from "@/types/survey";

import {
  type ComparisonContext,
  type ComparisonState,
  ComparisonStatus,
} from "../ResultsComparison.types";
import { readFriendResult } from "./readFriendResult";
import { toComparingState } from "./toComparingState";
import { toFriendSide } from "./toFriendSide";

// The read of the result of a friend ended: the comparison starts when the
// result can be used, and it is refused when it cannot. A read that was not
// waited for - the state moved on, or waits for another identifier - changes
// nothing.
export const receiveFriendResult = (
  state: ComparisonState,
  requestedId: string,
  load: ResultLoadResult,
  context: ComparisonContext,
  friendName: string,
): ComparisonState => {
  if (
    state.status !== ComparisonStatus.Fetching ||
    state.requestedId !== requestedId
  ) {
    return state;
  }

  const read = readFriendResult(load, context.survey.id);

  return read.result
    ? toComparingState(toFriendSide(read.result, friendName), context)
    : {
        status: ComparisonStatus.Refused,
        mode: ComparisonMode.Friend,
        friendId: state.friendId,
        refusal: read.refusal,
      };
};

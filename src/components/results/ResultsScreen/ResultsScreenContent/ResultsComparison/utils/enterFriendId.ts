import { ComparisonMode } from "@/types/comparison";
import { readResultId } from "@/utils/results/readResultId";

import {
  type ComparisonState,
  ComparisonStatus,
  FriendRefusal,
} from "../ResultsComparison.types";
import { isChoiceOpen } from "./isChoiceOpen";

// The field of the friend changed. The text is kept as typed. When it holds
// a result identifier - trimmed, in any letter case - that result is asked
// for, unless it is the identifier of the taker, which is refused without a
// request. A text that holds none asks for nothing.
export const enterFriendId = (
  state: ComparisonState,
  text: string,
  ownId: string,
): ComparisonState => {
  if (!isChoiceOpen(state)) return state;

  const choice = { mode: ComparisonMode.Friend, friendId: text };
  const requestedId = readResultId(text);

  if (requestedId === undefined) {
    return { status: ComparisonStatus.Choosing, ...choice };
  }

  return requestedId === readResultId(ownId)
    ? {
        status: ComparisonStatus.Refused,
        ...choice,
        refusal: FriendRefusal.Own,
      }
    : { status: ComparisonStatus.Fetching, ...choice, requestedId };
};

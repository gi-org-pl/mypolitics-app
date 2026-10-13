import { readResultId } from "@/utils/results/readResultId";

import {
  type ComparisonChoiceState,
  ComparisonStatus,
} from "../../ResultsComparison.types";
import { FriendNotice } from "../FriendForm/FriendForm.types";

type NoticeReader<Status extends ComparisonChoiceState["status"]> = (
  state: Extract<ComparisonChoiceState, { status: Status }>,
) => FriendNotice;

// What the field of the friend says in each state of the choice. While the
// taker chooses, a text that is not an identifier in form is said to be none;
// an empty field, and one that holds an identifier nothing was asked for yet,
// keep the hint.
const NOTICE_READERS: {
  [Status in ComparisonChoiceState["status"]]: NoticeReader<Status>;
} = {
  [ComparisonStatus.Choosing]: ({ friendId }) =>
    friendId.trim() !== "" && readResultId(friendId) === undefined
      ? FriendNotice.Invalid
      : FriendNotice.Hint,
  [ComparisonStatus.Fetching]: () => FriendNotice.Fetching,
  [ComparisonStatus.Refused]: ({ refusal }) => refusal,
};

// The line under the field of the friend, for a state of the choice: one
// lookup in the table by the state.
export const getFriendNotice = (state: ComparisonChoiceState): FriendNotice => {
  // Each row of the table reads the state of its own status. A lookup by the
  // status of a state that can be any of them cannot carry that pairing, so
  // it is restated here.
  const read = NOTICE_READERS[state.status] as NoticeReader<
    ComparisonChoiceState["status"]
  >;

  return read(state);
};

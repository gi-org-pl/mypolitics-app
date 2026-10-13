// What the line under the field of the friend says. An enum, written as a
// constant with a type of the same name - see ApiFailureKind in types/api.ts.
// The last three are the refusals of a result, under the names they have as
// refusals.
export const FriendNotice = {
  Hint: "hint", // how the two exchange identifiers
  Fetching: "fetching", // the result is on the way
  Invalid: "invalid", // the text is not a result identifier in form
  Own: "own", // it is the identifier of the taker
  OtherSurvey: "other-survey", // the result was handed in for another survey
  Unreadable: "unreadable", // the result does not exist, is not calculated, or cannot be read
} as const;

export type FriendNotice = (typeof FriendNotice)[keyof typeof FriendNotice];

export interface FriendFormProps {
  resultId: string; // the identifier of the taker's own result, to hand to the friend
  friendId: string; // the text of the field, as typed
  notice: FriendNotice;
  onFriendIdChange: (text: string) => void;
}

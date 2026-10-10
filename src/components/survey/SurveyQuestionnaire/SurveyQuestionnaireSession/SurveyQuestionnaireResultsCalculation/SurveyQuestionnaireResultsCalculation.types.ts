// How far the hand-in of a run got, and how it ended.
export const HandInState = {
  Sending: "sending", // step 1: the hand-in is on its way
  Created: "created", // the result is stored, and is being waited for
  Calculated: "calculated", // the result is there
  NotSaved: "not-saved", // the run ended: the answers could not be saved
  NotReady: "not-ready", // the run ended: the result was not calculated in time
} as const;

export type HandInState = (typeof HandInState)[keyof typeof HandInState];

// The link request of a session. It is made once at most, so it outlives the
// run it was made in.
export const ResultLinkState = {
  None: "none", // no link was asked for
  Pending: "pending", // the request is on its way
  Accepted: "accepted",
  NotSent: "not-sent", // the request ended in anything but accepted
} as const;

export type ResultLinkState =
  (typeof ResultLinkState)[keyof typeof ResultLinkState];

export interface LoaderLines {
  lines: string[]; // the lines of the run so far, oldest first
  hasStayedLongEnough: boolean; // the run owes no more of the minimum stay
}

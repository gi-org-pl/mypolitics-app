// How far the hand-in of a run got.
export type HandInState =
  | "sending" // step 1: the hand-in is on its way
  | "created" // the result is stored, and is being waited for
  | "calculated" // the result is there
  | "not-saved" // the run ended: the answers could not be saved
  | "not-ready"; // the run ended: the result was not calculated in time

// The link request of a session. It is made once at most, so it outlives the
// run it was made in.
export type ResultLinkState =
  | "none" // no link was asked for
  | "pending" // the request is on its way
  | "accepted"
  | "not-sent"; // the request ended in anything but "accepted"

export interface LoaderLines {
  lines: string[]; // the lines of the run so far, oldest first
  hasStayedLongEnough: boolean; // the run owes no more of the minimum stay
}

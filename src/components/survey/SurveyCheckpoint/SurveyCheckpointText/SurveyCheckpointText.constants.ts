import { PHASE_FOCUS_ATTRIBUTE } from "@/constants/focus";

// What stands between the lead-in and the statement: a long dash (U+2014),
// tied to the last word of the lead-in by a no-break space (U+00A0) so that
// it never starts a line, and a space the line may break at. The dash is the
// frame's and is part of no line.
export const LEAD_IN_END = " — ";

// The text is what the screen puts the focus on when a card appears.
export const FOCUS_TARGET_PROPS = { [PHASE_FOCUS_ATTRIBUTE]: true };

import { SURVEY_PHASES } from "@/constants/survey";
import type { SurveySession } from "@/types/survey";

import type { ChangeDirection } from "../../SurveyQuestionnaire.types";

// Which way the taker moved between two sessions. Backwards is a step back:
// a done question is open again, or an earlier phase is shown with the same
// questions done. Everything else is the way forwards - a new session after a
// reset as well, and the question that follows a card: a card interrupts the
// questions and returns to them.
export const getChangeDirection = (
  previous: SurveySession,
  next: SurveySession,
): ChangeDirection => {
  if (previous.id !== next.id) return "forwards";

  if (next.entries.length !== previous.entries.length) {
    return next.entries.length < previous.entries.length
      ? "backwards"
      : "forwards";
  }

  return previous.phase !== "checkpoints" &&
    SURVEY_PHASES.indexOf(next.phase) < SURVEY_PHASES.indexOf(previous.phase)
    ? "backwards"
    : "forwards";
};

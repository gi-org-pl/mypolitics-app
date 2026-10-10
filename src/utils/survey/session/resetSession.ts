import type { SurveySessionAction } from "@/types/survey";

import { canReset } from "./canReset";
import { createSession } from "./createSession";

// A new session replaces this one. Only the checkpoint opt-out is carried
// over.
export const resetSession: SurveySessionAction = (survey, session) =>
  canReset(session)
    ? createSession(survey, { areCheckpointsOff: session.areCheckpointsOff })
    : session;

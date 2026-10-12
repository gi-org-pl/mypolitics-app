import type { SurveySessionAction } from "@/types/survey";

// "Wyłącz checkpointy": off for the rest of the session and past a reset. The
// card that is up, if any, is left for the next question.
export const turnSessionCheckpointsOff: SurveySessionAction = (
  _survey,
  session,
) =>
  session.areCheckpointsOff && session.phase !== "checkpoints"
    ? session
    : {
        ...session,
        areCheckpointsOff: true,
        phase: session.phase === "checkpoints" ? "questions" : session.phase,
      };

import type { SurveySessionAction } from "@/types/survey";

// "Dalej" on a card: back to the questions, on the next one.
export const closeSessionCheckpoint: SurveySessionAction = (
  _survey,
  session,
) =>
  session.phase === "checkpoints"
    ? { ...session, phase: "questions" }
    : session;

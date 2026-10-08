import type { SurveySession } from "@/types/survey";

export const canReset = (session: SurveySession): boolean => {
  switch (session.phase) {
    case "questions":
      // Something to clear: a done question, or topics that were confirmed.
      return (
        session.entries.length > 0 ||
        (session.areTopicsConfirmed && session.topicIds.length > 0)
      );
    case "checkpoints":
    case "demographics":
    case "email-capture":
      return true;
    case "results-calculation":
      return session.resultState === "failed";
    default:
      return false;
  }
};

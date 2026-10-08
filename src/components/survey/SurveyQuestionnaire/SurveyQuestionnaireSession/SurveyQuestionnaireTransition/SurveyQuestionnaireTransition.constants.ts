import type { ChangeDirection } from "../SurveyQuestionnaireSession.types";

// Where the new content comes from: the side the taker is moving to.
export const CONTENT_ARRIVAL_CLASS_NAME: Record<ChangeDirection, string> = {
  forwards: "starting:translate-x-4 starting:opacity-0",
  backwards: "starting:-translate-x-4 starting:opacity-0",
};

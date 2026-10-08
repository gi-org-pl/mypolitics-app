import type {
  Survey,
  SurveySession,
  SurveySessionConfig,
} from "@/types/survey";

import { createSession } from "./createSession";
import { fitSession } from "./fitSession";
import { storedSessionSchema } from "./storedSessionSchema";

// `stored` is whatever storage held for the quiz. The result is always a
// session that fits the quiz as read now: the record is thrown away when it
// cannot be read or is for another quiz, and fitted part by part otherwise.
// The e-mail and the result state are never stored, so they start over.
export const restoreSession = (
  survey: Survey,
  stored: unknown,
  config: SurveySessionConfig,
): SurveySession => {
  const { success, data } = storedSessionSchema.safeParse(stored);

  if (!success || data.state.surveyId !== survey.id) {
    return createSession(survey);
  }

  return fitSession(
    survey,
    { ...data.state, email: null, resultState: "not-sent" },
    config,
  );
};

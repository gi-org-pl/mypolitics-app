import type { ResultInput, Survey, SurveySession } from "@/types/survey";
import { uniqueBy } from "@/utils/array/uniqueBy";

import { toResultDemographics } from "./toResultDemographics";

// The hand-in. The same session always gives the same input, which is what
// makes repeating the request safe. The e-mail is never part of it.
export const buildResultInput = (
  survey: Survey,
  session: SurveySession,
): ResultInput => {
  const demographics = session.areDemographicsGiven
    ? toResultDemographics(session.demographics)
    : undefined;

  return {
    surveyId: survey.id,
    sessionId: session.id,
    prioritizedCategories: session.areTopicsConfirmed
      ? [...session.topicIds]
      : [],
    ...(demographics ? { demographics } : {}),
    // The first entry of a question wins, and a skip has no answer to send.
    answers: uniqueBy(session.entries, ({ questionId }) => questionId).flatMap(
      ({ questionId, answerId }) =>
        answerId === undefined ? [] : [{ questionId, answerId }],
    ),
  };
};

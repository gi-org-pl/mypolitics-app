import type {
  Survey,
  SurveySession,
  SurveySessionConfig,
  UnfittedSurveySession,
} from "@/types/survey";
import { uniqueBy } from "@/utils/array/uniqueBy";

import { getFittingEntries } from "./getFittingEntries";
import { getFittingPhase } from "./getFittingPhase";
import { getValidCategoryIds } from "./getValidCategoryIds";
import { getValidDemographics } from "./getValidDemographics";
import { toResultDemographics } from "./toResultDemographics";

// Fits a session to the quiz as read now, part by part: what storage held, or
// a session that fitted an earlier reading of the same quiz - in another
// language, or before the quiz was changed. A session that fits already comes
// back with the same content; the identifier, the e-mail and the result state
// are never touched.
export const fitSession = (
  survey: Survey,
  session: UnfittedSurveySession,
  config: SurveySessionConfig,
): SurveySession => {
  const entries = getFittingEntries(survey, session.entries);
  const doneIds = new Set(entries.map(({ questionId }) => questionId));
  const demographics = getValidDemographics(session.demographics);
  const fittedSession: SurveySession = {
    id: session.id,
    surveyId: survey.id,
    entries,
    topicIds: getValidCategoryIds(survey, session.topicIds),
    areTopicsConfirmed: session.areTopicsConfirmed,
    phase: "questions",
    areCheckpointsOff: session.areCheckpointsOff,
    demographics,
    areDemographicsGiven:
      session.areDemographicsGiven &&
      toResultDemographics(demographics) !== undefined,
    checkpointRecord: {
      cardsShown: session.checkpointRecord.cardsShown,
      // One sample per done question: the first of a question is kept.
      timeSamples: uniqueBy(
        session.checkpointRecord.timeSamples.flatMap((sample) =>
          sample && doneIds.has(sample.questionId) ? [sample] : [],
        ),
        ({ questionId }) => questionId,
      ),
    },
    email: session.email,
    resultState: session.resultState,
  };
  // Entries were thrown away: the session continues from there, whatever
  // phase it was in.
  const isCut = entries.length < session.entries.length;
  const phase = getFittingPhase(
    survey,
    fittedSession,
    isCut ? undefined : session.phase,
    config,
  );

  return {
    ...fittedSession,
    phase,
    areTopicsConfirmed:
      session.areTopicsConfirmed && phase !== "category-select",
  };
};

import type {
  Survey,
  SurveySession,
  SurveySessionConfig,
} from "@/types/survey";
import { uniqueBy } from "@/utils/array/uniqueBy";

import { createSession } from "./createSession";
import { getFittingEntries } from "./getFittingEntries";
import { getRestoredPhase } from "./getRestoredPhase";
import { getValidDemographics } from "./getValidDemographics";
import { getValidTopics } from "./getValidTopics";
import { storedSessionSchema } from "./storedSessionSchema";
import { toResultDemographics } from "./toResultDemographics";

// `stored` is whatever storage held for the quiz. The result is always a
// session that fits the quiz as read now: the record is thrown away when it
// cannot be read or is for another quiz, and repaired part by part otherwise.
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

  const { state } = data;
  const entries = getFittingEntries(survey, state.entries);
  const doneIds = new Set(entries.map(({ questionId }) => questionId));
  const demographics = getValidDemographics(state.demographics);
  const session: SurveySession = {
    id: state.id,
    surveyId: survey.id,
    entries,
    topicIds: getValidTopics(survey, state.topicIds),
    areTopicsConfirmed: state.areTopicsConfirmed,
    phase: "questions",
    areCheckpointsOff: state.areCheckpointsOff,
    demographics,
    areDemographicsGiven:
      state.areDemographicsGiven &&
      toResultDemographics(demographics) !== undefined,
    checkpointRecord: {
      cardsShown: state.checkpointRecord.cardsShown,
      // One sample per done question: the first of a question is kept.
      timeSamples: uniqueBy(
        state.checkpointRecord.timeSamples.flatMap((sample) =>
          sample && doneIds.has(sample.questionId) ? [sample] : [],
        ),
        ({ questionId }) => questionId,
      ),
    },
    email: null,
    resultState: "not-sent",
  };
  // Entries were thrown away: the session continues from there, whatever
  // phase it was stored in.
  const isCut = entries.length < state.entries.length;
  const phase = getRestoredPhase(
    survey,
    session,
    isCut ? undefined : state.phase,
    config,
  );

  return {
    ...session,
    phase,
    areTopicsConfirmed: state.areTopicsConfirmed && phase !== "category-select",
  };
};

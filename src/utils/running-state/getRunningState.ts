import type {
  RunningState,
  RunningStateSession,
  RunningStateSources,
} from "@/types/checkpoint";
import type { Survey } from "@/types/survey";

import { getDoneQuestions } from "./getDoneQuestions";
import { getRunningArchetypes } from "./getRunningArchetypes";
import { getRunningAxes } from "./getRunningAxes";
import { getRunningCompass } from "./getRunningCompass";
import { getRunningProgress } from "./getRunningProgress";
import { getRunningScores } from "./getRunningScores";
import { getRunningTiming } from "./getRunningTiming";
import { getUnlockedTraits } from "./getUnlockedTraits";

// What the taker's answers add up to so far. It is derived: the same quiz,
// session and sources always give the same state, and nothing here is stored,
// sent or logged. It is null only for a quiz with no questions.
export const getRunningState = (
  survey: Survey,
  session: RunningStateSession,
  sources?: RunningStateSources,
): RunningState | null => {
  if (survey.questions.length === 0) return null;

  const { entries, prioritizedCategoryIds, checkpointRecord } = session;
  const doneQuestions = getDoneQuestions(survey, entries);
  const scores = getRunningScores(
    survey,
    doneQuestions,
    prioritizedCategoryIds,
  );

  return {
    progress: getRunningProgress(survey, doneQuestions),
    timing: getRunningTiming(
      survey,
      doneQuestions,
      checkpointRecord.timeSamples,
    ),
    scores,
    axes: getRunningAxes(survey, doneQuestions, scores),
    archetypes: getRunningArchetypes(survey, scores),
    unlockedTraits: getUnlockedTraits(survey, doneQuestions, sources?.traitIds),
    compass: getRunningCompass(survey, doneQuestions, prioritizedCategoryIds),
  };
};

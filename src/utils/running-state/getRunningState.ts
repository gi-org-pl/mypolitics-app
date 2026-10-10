import type {
  RunningState,
  RunningStateSession,
  RunningStateSources,
} from "@/types/checkpoint";
import type { Survey } from "@/types/survey";
import { getRunningAxes } from "@/utils/running-state/axes/getRunningAxes";
import { getRunningCompass } from "@/utils/running-state/compass/getRunningCompass";
import { getRunningArchetypes } from "@/utils/running-state/orientations/getRunningArchetypes";
import { getUnlockedTraits } from "@/utils/running-state/orientations/getUnlockedTraits";
import { getDoneQuestions } from "@/utils/running-state/progress/getDoneQuestions";
import { getRunningProgress } from "@/utils/running-state/progress/getRunningProgress";
import { getRunningScores } from "@/utils/running-state/scores/getRunningScores";
import { getRunningTiming } from "@/utils/running-state/timing/getRunningTiming";

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

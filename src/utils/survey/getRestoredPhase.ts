import type {
  Survey,
  SurveyPhase,
  SurveySession,
  SurveySessionConfig,
} from "@/types/survey";

import { isPhaseInSession } from "./isPhaseInSession";

// The phase a restored session is in. The stored phase is kept when the
// entries allow it and it is part of the session. Otherwise it is repaired by
// one rule - the questions when a question is open, demographics when none is
// - except that e-mail capture left out of the session gives way to
// demographics. The phase of the session it is handed is not read.
export const getRestoredPhase = (
  survey: Survey,
  session: SurveySession,
  storedPhase: SurveyPhase | undefined,
  config: SurveySessionConfig,
): SurveyPhase => {
  const hasEntries = session.entries.length > 0;
  const isQuestionOpen = session.entries.length < survey.questions.length;
  const repairedPhase = isQuestionOpen ? "questions" : "demographics";
  const isPhaseAllowed: Record<SurveyPhase, boolean> = {
    "category-select": !hasEntries,
    questions: isQuestionOpen,
    checkpoints:
      hasEntries &&
      isQuestionOpen &&
      session.checkpointRecord.cardsShown.length > 0,
    demographics: !isQuestionOpen,
    "email-capture": !isQuestionOpen,
    "results-calculation": !isQuestionOpen,
    "short-results": false,
  };

  if (storedPhase === undefined || !isPhaseAllowed[storedPhase]) {
    return repairedPhase;
  }

  if (isPhaseInSession(storedPhase, survey, session, config)) {
    return storedPhase;
  }

  return storedPhase === "email-capture" ? "demographics" : repairedPhase;
};

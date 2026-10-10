import { ADULT_AGE } from "@/constants/survey";
import type {
  Survey,
  SurveyPhase,
  SurveySession,
  SurveySessionConfig,
} from "@/types/survey";

import { getFirstPhase } from "./getFirstPhase";

export const isPhaseInSession = (
  phase: SurveyPhase,
  survey: Survey,
  session: SurveySession,
  config: SurveySessionConfig,
): boolean => {
  // No age picked is not a number, and so is not under the line.
  const isMinor =
    Number.parseInt(session.demographics.age ?? "", 10) < ADULT_AGE;
  const isPhaseIn: Record<SurveyPhase, boolean> = {
    "category-select": getFirstPhase(survey) === "category-select",
    questions: true,
    checkpoints: !session.areCheckpointsOff,
    demographics: true,
    "email-capture": config.isEmailSendingSetUp && !isMinor,
    "results-calculation": true,
    "short-results": false,
  };

  return isPhaseIn[phase];
};

import { msg } from "@lingui/core/macro";
import type { ComponentType } from "react";

import type { SurveyPhase, SurveyPhaseContentProps } from "@/types/survey";
import { SurveyQuestionnaireCategorySelect } from "./SurveyQuestionnaireCategorySelect/SurveyQuestionnaireCategorySelect";
import { SurveyQuestionnaireCheckpoints } from "./SurveyQuestionnaireCheckpoints/SurveyQuestionnaireCheckpoints";
import { SurveyQuestionnaireDemographics } from "./SurveyQuestionnaireDemographics/SurveyQuestionnaireDemographics";
import { SurveyQuestionnaireEmailCapture } from "./SurveyQuestionnaireEmailCapture/SurveyQuestionnaireEmailCapture";
import { SurveyQuestionnaireQuestions } from "./SurveyQuestionnaireQuestions/SurveyQuestionnaireQuestions";
import { SurveyQuestionnaireResultsCalculation } from "./SurveyQuestionnaireResultsCalculation/SurveyQuestionnaireResultsCalculation";

// What is drawn in each phase. A later phase is a component that takes
// `SurveyPhaseContentProps`, added here under its phase: the bar, the pill,
// back and reset of every phase are already in `getSurveyFrame`. A phase with
// nothing here is never left on screen: the session is moved on instead.
export const SURVEY_PHASE_CONTENT: Partial<
  Record<SurveyPhase, ComponentType<SurveyPhaseContentProps>>
> = {
  "category-select": SurveyQuestionnaireCategorySelect,
  questions: SurveyQuestionnaireQuestions,
  checkpoints: SurveyQuestionnaireCheckpoints,
  demographics: SurveyQuestionnaireDemographics,
  "email-capture": SurveyQuestionnaireEmailCapture,
  "results-calculation": SurveyQuestionnaireResultsCalculation,
};

// How long the movement between two contents lasts - the slide from one
// question to the next, the arrival of another phase and the change of
// height that goes with either: the 0.3 s of the legacy questionnaire. Never
// longer than the acknowledgement of an answer, 300 ms.
export const CONTENT_CHANGE_MS = 300;

// How long a lock that nothing answers holds the screen. Longer than the
// acknowledgement of an answer, so the change it waits for comes first.
export const SCREEN_LOCK_LIMIT_MS = 1000;

export const ALMOST_DONE_LABEL = msg`Prawie koniec!`;
export const ALMOST_READY_LABEL = msg`Prawie gotowe`;
export const GO_BACK_LABEL = msg`Wróć`;

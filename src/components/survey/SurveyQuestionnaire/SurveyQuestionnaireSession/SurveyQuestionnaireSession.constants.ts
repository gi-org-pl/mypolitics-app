import { msg } from "@lingui/core/macro";
import type { ComponentType, CSSProperties } from "react";

import type { SurveyPhase, SurveyPhaseContentProps } from "@/types/survey";

import type { ChangeDirection } from "../SurveyQuestionnaire.types";
import { SurveyQuestionnaireCategorySelect } from "./SurveyQuestionnaireCategorySelect/SurveyQuestionnaireCategorySelect";
import { SurveyQuestionnaireDemographics } from "./SurveyQuestionnaireDemographics/SurveyQuestionnaireDemographics";
import { SurveyQuestionnaireHandIn } from "./SurveyQuestionnaireHandIn/SurveyQuestionnaireHandIn";
import { SurveyQuestionnaireQuestions } from "./SurveyQuestionnaireQuestions/SurveyQuestionnaireQuestions";

// What is drawn in each phase. A later phase is a component that takes
// `SurveyPhaseContentProps`, added here under its phase: the bar, the pill,
// back and reset of every phase are already in `getSurveyFrame`. A phase with
// nothing here is never left on screen: the session is moved on instead.
export const SURVEY_PHASE_CONTENT: Partial<
  Record<SurveyPhase, ComponentType<SurveyPhaseContentProps>>
> = {
  "category-select": SurveyQuestionnaireCategorySelect,
  questions: SurveyQuestionnaireQuestions,
  demographics: SurveyQuestionnaireDemographics,
  "results-calculation": SurveyQuestionnaireHandIn, // stand-in until survey-results-calculation
};

// How long the movement between two contents lasts. Never longer than the
// acknowledgement of an answer, 300 ms.
export const CONTENT_CHANGE_MS = 200;

// How long a lock that nothing answers holds the screen. Longer than the
// acknowledgement of an answer, so the change it waits for comes first.
export const SCREEN_LOCK_LIMIT_MS = 1000;

// A class name cannot be built from a number, so the duration is a style.
export const CONTENT_CHANGE_STYLE: CSSProperties = {
  transitionDuration: `${CONTENT_CHANGE_MS}ms`,
};

// Where the new content comes from: the side the taker is moving to.
export const CONTENT_ARRIVAL_CLASS_NAME: Record<ChangeDirection, string> = {
  forwards: "starting:translate-x-4 starting:opacity-0",
  backwards: "starting:-translate-x-4 starting:opacity-0",
};

export const ALMOST_DONE_LABEL = msg`Prawie koniec!`;
export const ALMOST_READY_LABEL = msg`Prawie gotowe`;
export const GO_BACK_LABEL = msg`Wróć`;

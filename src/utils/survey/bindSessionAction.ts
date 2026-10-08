import type { StoreApi } from "zustand";

import { SURVEY_SESSION_CONFIG } from "@/constants/survey";
import type {
  Survey,
  SurveySession,
  SurveySessionAction,
} from "@/types/survey";

import { fitSession } from "./fitSession";

// Binds an action to a quiz and to the store of its session. The action is
// applied to the session the store holds at the moment of the call, so two
// calls in a row never work from the same session - and to that session as it
// fits the quiz, so an action never works from entries of an earlier reading.
// An action that does not apply leaves the store alone, and nothing is
// written.
export const bindSessionAction =
  <Arguments extends unknown[]>(
    store: StoreApi<SurveySession>,
    survey: Survey,
    action: SurveySessionAction<Arguments>,
  ) =>
  (...actionArguments: Arguments): void => {
    const session = fitSession(survey, store.getState(), SURVEY_SESSION_CONFIG);
    const nextSession = action(survey, session, ...actionArguments);

    if (nextSession !== session) {
      store.setState(nextSession, true);
    }
  };

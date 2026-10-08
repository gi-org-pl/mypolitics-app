import type { ComponentType } from "react";
import { vi } from "vitest";

import type {
  Survey,
  SurveyPhaseContentProps,
  SurveySession,
} from "@/types/survey";
import { getSurveySessionStore } from "@/utils/survey/getSurveySessionStore";
import { useSurveySession } from "@/utils/survey/useSurveySession";

import { renderWithI18n } from "./renderWithI18n";

// Renders the content of a phase the way the screen does: with the session of
// the quiz, read through the hook. The session is put in the store first; the
// store lives as long as the module, so a test takes a quiz of its own. What
// the session became is read with `getSession`.
export const renderPhaseContent = (
  Content: ComponentType<SurveyPhaseContentProps>,
  survey: Survey,
  session: SurveySession,
) => {
  const store = getSurveySessionStore(survey);
  const lock = vi.fn();
  const onLeave = vi.fn();
  const Screen = () => (
    <Content
      survey={survey}
      session={useSurveySession(survey)}
      lock={lock}
      onLeave={onLeave}
    />
  );

  store.setState(session, true);

  return {
    ...renderWithI18n(<Screen />),
    lock,
    onLeave,
    getSession: store.getState,
  };
};

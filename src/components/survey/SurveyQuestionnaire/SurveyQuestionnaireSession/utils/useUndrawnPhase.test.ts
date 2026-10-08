import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SURVEY_SESSION_CONFIG } from "@/constants/survey";
import type { Survey, SurveyPhase, SurveySession } from "@/types/survey";
import { getSurveySessionStore } from "@/utils/survey/getSurveySessionStore";
import { useSurveySession } from "@/utils/survey/useSurveySession";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { useUndrawnPhase } from "./useUndrawnPhase";

// The stores live as long as the module does, so every test takes a quiz of
// its own.
const createQuiz = (): Survey => createSurvey({ id: crypto.randomUUID() });

const renderPhase = (
  phase: SurveyPhase,
  done: number,
  isDrawn: boolean,
  overrides: Partial<SurveySession> = {},
) => {
  const survey = createQuiz();

  getSurveySessionStore(survey).setState(
    { ...createStartedSession(survey, done), phase, ...overrides },
    true,
  );

  return renderHook(() => {
    const session = useSurveySession(survey);

    useUndrawnPhase(session, isDrawn);

    return session.session;
  });
};

const ALL_DONE = createSurvey().questions.length;
const CARD = { cardsShown: [{ kind: "card" }], timeSamples: [] };

describe("useUndrawnPhase()", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  describe("given a card phase with nothing to draw", () => {
    it("closes the card: the next question is shown", () => {
      const { result } = renderPhase("checkpoints", 2, false, {
        checkpointRecord: CARD,
      });

      expect(result.current.phase).toBe("questions");
      expect(result.current.entries).toHaveLength(2);
    });
  });

  describe("given an e-mail phase with nothing to draw", () => {
    it("leaves it as skipped: results calculation, and no e-mail", () => {
      vi.spyOn(
        SURVEY_SESSION_CONFIG,
        "isEmailSendingSetUp",
        "get",
      ).mockReturnValue(true);

      const { result } = renderPhase("email-capture", ALL_DONE, false, {
        email: { address: "ktos@example.com", hasConsent: true },
      });

      expect(result.current.phase).toBe("results-calculation");
      expect(result.current.email).toBeNull();
    });
  });

  describe("given a phase that is drawn", () => {
    it("leaves a card phase alone", () => {
      const { result } = renderPhase("checkpoints", 2, true, {
        checkpointRecord: CARD,
      });

      expect(result.current.phase).toBe("checkpoints");
    });

    it("leaves an e-mail phase alone", () => {
      vi.spyOn(
        SURVEY_SESSION_CONFIG,
        "isEmailSendingSetUp",
        "get",
      ).mockReturnValue(true);

      const { result } = renderPhase("email-capture", ALL_DONE, true);

      expect(result.current.phase).toBe("email-capture");
    });
  });

  describe("given any other phase with nothing to draw", () => {
    it("changes nothing", () => {
      const { result } = renderPhase("questions", 1, false);

      expect(result.current.phase).toBe("questions");
      expect(result.current.entries).toHaveLength(1);
    });
  });
});

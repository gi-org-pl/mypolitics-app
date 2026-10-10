import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { Survey } from "@/types/survey";
import { getSurveySessionStore } from "@/utils/survey/session/getSurveySessionStore";
import { useSurveySession } from "@/utils/survey/session/useSurveySession";
import { createStartedSession } from "@/utils/vitest/survey/createStartedSession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";

import { useQuestionActions } from "./useQuestionActions";

const renderActions = (done = 0) => {
  // The stores live as long as the module does: a quiz of its own.
  const survey: Survey = createSurvey({ id: crypto.randomUUID() });

  const store = getSurveySessionStore(survey);

  store.setState(createStartedSession(survey, done), true);

  return {
    ...renderHook(() => {
      const session = useSurveySession(survey);

      return { session: session.session, actions: useQuestionActions(session) };
    }),
    getStoredSession: store.getState,
  };
};

describe("useQuestionActions()", () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  describe("when answer is called", () => {
    it("records the answer of the current question, without a time", () => {
      const { result } = renderActions();

      act(() => result.current.actions.answer("q1-agree"));

      expect(result.current.session.entries).toEqual([
        { questionId: "q1", answerId: "q1-agree" },
      ]);
      expect(result.current.session.checkpointRecord.timeSamples).toEqual([]);
      expect(result.current.session.phase).toBe("questions");
    });

    it("leads to demographics after the last question, and to no card", () => {
      const { result } = renderActions(4);

      act(() => result.current.actions.answer("q5-state"));

      expect(result.current.session.phase).toBe("demographics");
      expect(result.current.session.checkpointRecord.cardsShown).toEqual([]);
    });
  });

  describe("when skip is called", () => {
    it("records a skip of the current question, without a time", () => {
      const { result } = renderActions();

      act(() => result.current.actions.skip());

      expect(result.current.session.entries).toEqual([{ questionId: "q1" }]);
      expect(result.current.session.checkpointRecord.timeSamples).toEqual([]);
    });
  });

  describe("when answer is called after the question has left the screen", () => {
    it("records nothing", () => {
      const { result, unmount, getStoredSession } = renderActions();
      const { actions } = result.current;

      unmount();
      act(() => actions.answer("q1-agree"));

      expect(getStoredSession().entries).toEqual([]);
    });

    it("still records a skip, which is never late", () => {
      const { result, getStoredSession } = renderActions();

      act(() => result.current.actions.skip());

      expect(getStoredSession().entries).toEqual([{ questionId: "q1" }]);
    });
  });

  describe("between renders", () => {
    it("keeps the same actions", () => {
      const { result, rerender } = renderActions();
      const { actions } = result.current;

      rerender();

      expect(result.current.actions).toBe(actions);
    });
  });
});

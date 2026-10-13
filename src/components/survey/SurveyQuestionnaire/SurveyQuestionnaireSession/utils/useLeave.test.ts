import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Survey } from "@/types/survey";
import { getSessionStorageKey } from "@/utils/survey/session/getSessionStorageKey";
import { getSurveySessionStore } from "@/utils/survey/session/getSurveySessionStore";
import { useSurveySession } from "@/utils/survey/session/useSurveySession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";

import { useLeave } from "./useLeave";

const onResultOpen = vi.fn<(resultId: string) => void>();

// The stores live as long as the module does, so every test takes a quiz of
// its own.
const createQuiz = (): Survey => createSurvey({ id: crypto.randomUUID() });

const renderLeave = (survey: Survey) =>
  renderHook(() => {
    const session = useSurveySession(survey);

    return { session, leave: useLeave(session, onResultOpen) };
  });

describe("useLeave()", () => {
  afterEach(() => {
    vi.resetAllMocks();
    sessionStorage.clear();
  });

  describe("when onLeave is called", () => {
    it("removes the stored session, then opens the result of that session", () => {
      const survey = createQuiz();
      const storageKey = getSessionStorageKey(survey.id);
      const { result } = renderLeave(survey);
      const { id } = result.current.session.session;
      const stored: (string | null)[] = [];

      act(() => result.current.session.skipCategories());

      expect(sessionStorage.getItem(storageKey)).not.toBeNull();

      onResultOpen.mockImplementation(() => {
        stored.push(sessionStorage.getItem(storageKey));
      });
      act(() => result.current.leave());

      expect(onResultOpen).toHaveBeenCalledTimes(1);
      expect(onResultOpen).toHaveBeenCalledWith(id);
      expect(stored).toEqual([null]);
    });

    it("keeps the session in memory as it was", () => {
      const survey = createQuiz();
      const { result } = renderLeave(survey);

      act(() => result.current.session.skipCategories());

      const { session } = result.current.session;

      act(() => result.current.leave());

      expect(result.current.session.session).toEqual(session);
    });

    it("opens the result once when called twice", () => {
      const { result } = renderLeave(createQuiz());

      act(() => result.current.leave());
      act(() => result.current.leave());

      expect(onResultOpen).toHaveBeenCalledTimes(1);
    });

    it("keeps the same function between renders", () => {
      const { result, rerender } = renderLeave(createQuiz());
      const { leave } = result.current;

      rerender();

      expect(result.current.leave).toBe(leave);
    });
  });

  describe("when the screen is gone after leaving", () => {
    it("starts over: a taker who comes back finds a new session in the first phase", () => {
      const survey = createQuiz();
      const { result, unmount } = renderLeave(survey);

      act(() => result.current.session.skipCategories());

      const { id } = result.current.session.session;

      act(() => result.current.leave());
      unmount();

      const { result: next } = renderLeave(survey);

      expect(next.current.session.session.id).not.toBe(id);
      expect(next.current.session.session.phase).toBe("category-select");
      expect(next.current.session.session.entries).toEqual([]);
    });

    it("stores nothing of the new session", () => {
      const survey = createQuiz();
      const { result, unmount } = renderLeave(survey);

      act(() => result.current.leave());
      unmount();

      expect(
        sessionStorage.getItem(getSessionStorageKey(survey.id)),
      ).toBeNull();
    });

    it("can leave again from the new session", () => {
      const survey = createQuiz();
      const { result, unmount } = renderLeave(survey);

      act(() => result.current.leave());
      unmount();

      const { result: next } = renderLeave(survey);
      const { id } = next.current.session.session;

      act(() => next.current.leave());

      expect(onResultOpen).toHaveBeenCalledTimes(2);
      expect(onResultOpen).toHaveBeenLastCalledWith(id);
    });
  });

  describe("when the screen is gone and the taker never left", () => {
    it("keeps the session, in memory and in the storage of the tab", () => {
      const survey = createQuiz();
      const storageKey = getSessionStorageKey(survey.id);
      const { result, unmount } = renderLeave(survey);

      act(() => result.current.session.skipCategories());

      const { session } = result.current.session;
      const stored = sessionStorage.getItem(storageKey);

      unmount();

      expect(getSurveySessionStore(survey).getState()).toEqual(session);
      expect(sessionStorage.getItem(storageKey)).toBe(stored);
      expect(stored).not.toBeNull();
    });
  });
});

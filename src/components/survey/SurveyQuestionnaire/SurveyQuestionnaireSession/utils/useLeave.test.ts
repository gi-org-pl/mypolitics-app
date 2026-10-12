import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Survey } from "@/types/survey";
import { getResultsUrl } from "@/utils/survey/result/getResultsUrl";
import { getSessionStorageKey } from "@/utils/survey/session/getSessionStorageKey";
import { useSurveySession } from "@/utils/survey/session/useSurveySession";
import { openAddress } from "@/utils/url/openAddress";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { useLeave } from "./useLeave";

vi.mock("@/utils/url/openAddress");

// The stores live as long as the module does, so every test takes a quiz of
// its own.
const createQuiz = (): Survey => createSurvey({ id: crypto.randomUUID() });

const renderLeave = (survey: Survey) =>
  renderHook(() => {
    const session = useSurveySession(survey);

    return { session, leave: useLeave(session) };
  });

const showPage = (isFromMemory: boolean) =>
  act(() => {
    window.dispatchEvent(
      new PageTransitionEvent("pageshow", { persisted: isFromMemory }),
    );
  });

describe("useLeave()", () => {
  afterEach(() => {
    vi.resetAllMocks();
    sessionStorage.clear();
  });

  describe("when onLeave is called", () => {
    it("removes the stored session, then opens the results address of that session in the same tab", () => {
      const survey = createQuiz();
      const storageKey = getSessionStorageKey(survey.id);
      const { result } = renderLeave(survey);
      const { id } = result.current.session.session;
      const stored: (string | null)[] = [];

      act(() => result.current.session.skipCategories());

      expect(sessionStorage.getItem(storageKey)).not.toBeNull();

      vi.mocked(openAddress).mockImplementation(() => {
        stored.push(sessionStorage.getItem(storageKey));
      });
      act(() => result.current.leave());

      expect(openAddress).toHaveBeenCalledTimes(1);
      expect(openAddress).toHaveBeenCalledWith(getResultsUrl(id));
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

    it("navigates once when called twice", () => {
      const { result } = renderLeave(createQuiz());

      act(() => result.current.leave());
      act(() => result.current.leave());

      expect(openAddress).toHaveBeenCalledTimes(1);
    });

    it("keeps the same function between renders", () => {
      const { result, rerender } = renderLeave(createQuiz());
      const { leave } = result.current;

      rerender();

      expect(result.current.leave).toBe(leave);
    });
  });

  describe("when the page is shown again from the memory of the browser after leaving", () => {
    it("starts over: a new session in the first phase", () => {
      const survey = createQuiz();
      const { result } = renderLeave(survey);

      act(() => result.current.session.skipCategories());

      const { id } = result.current.session.session;

      act(() => result.current.leave());
      showPage(true);

      expect(result.current.session.session.id).not.toBe(id);
      expect(result.current.session.session.phase).toBe("category-select");
      expect(result.current.session.session.entries).toEqual([]);
    });

    it("can leave again from the new session", () => {
      const { result } = renderLeave(createQuiz());

      act(() => result.current.leave());
      showPage(true);

      const { id } = result.current.session.session;

      act(() => result.current.leave());

      expect(openAddress).toHaveBeenCalledTimes(2);
      expect(openAddress).toHaveBeenLastCalledWith(getResultsUrl(id));
    });
  });

  describe("when the page is shown again and the taker never left", () => {
    it("keeps the session", () => {
      const { result } = renderLeave(createQuiz());
      const { id } = result.current.session.session;

      showPage(true);

      expect(result.current.session.session.id).toBe(id);
    });
  });

  describe("when the page is shown by an ordinary load", () => {
    it("keeps the session, also after leaving", () => {
      const { result } = renderLeave(createQuiz());
      const { id } = result.current.session.session;

      act(() => result.current.leave());
      showPage(false);

      expect(result.current.session.session.id).toBe(id);
    });
  });

  describe("when unmounted", () => {
    it("stops listening for the page being shown", () => {
      const { result, unmount } = renderLeave(createQuiz());
      const removeListener = vi.spyOn(window, "removeEventListener");

      act(() => result.current.leave());
      unmount();

      expect(removeListener).toHaveBeenCalledWith(
        "pageshow",
        expect.any(Function),
      );

      removeListener.mockRestore();
    });
  });
});

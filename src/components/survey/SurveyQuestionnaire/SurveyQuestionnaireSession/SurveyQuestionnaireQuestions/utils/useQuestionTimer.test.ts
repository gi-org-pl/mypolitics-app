import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SURVEY_SESSION_VERSION } from "@/constants/survey";
import type { Survey, SurveySession } from "@/types/survey";
import { getSessionStorageKey } from "@/utils/survey/session/getSessionStorageKey";
import { getSurveySessionStore } from "@/utils/survey/session/getSurveySessionStore";
import { createStartedSession } from "@/utils/vitest/survey/createStartedSession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";

import { useQuestionTimer } from "./useQuestionTimer";

let now = 0;

// The stores live as long as the module does, so every test takes a quiz of
// its own.
const createQuiz = (): Survey => createSurvey({ id: crypto.randomUUID() });

// What a reload finds: the record of the session in the storage of the tab,
// before the store of the quiz exists.
const storeRecord = (survey: Survey, session: SurveySession): void => {
  const { email, resultState, ...state } = session;

  sessionStorage.setItem(
    getSessionStorageKey(survey.id),
    JSON.stringify({ state, version: SURVEY_SESSION_VERSION }),
  );
};

const renderTimer = (survey: Survey, questionId?: string) =>
  renderHook((props: { id?: string }) => useQuestionTimer(survey, props.id), {
    initialProps: { id: questionId },
  });

describe("useQuestionTimer()", () => {
  beforeEach(() => {
    now = 50_000;
    vi.spyOn(performance, "now").mockImplementation(() => now);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("gives the seconds since the question appeared", () => {
    const { result } = renderTimer(createQuiz(), "q1");

    expect(result.current()).toBe(0);

    now += 7250;

    expect(result.current()).toBe(7.25);
  });

  it("starts again when the question changes", () => {
    const { result, rerender } = renderTimer(createQuiz(), "q1");

    now += 9000;
    rerender({ id: "q2" });
    now += 1500;

    expect(result.current()).toBe(1.5);
  });

  it("keeps running while the same question is drawn again", () => {
    const { result, rerender } = renderTimer(createQuiz(), "q1");

    now += 2000;
    rerender({ id: "q1" });
    now += 1000;

    expect(result.current()).toBe(3);
  });

  it("gives nothing for the question on screen when the page loads onto a restored session", () => {
    const survey = createQuiz();

    storeRecord(survey, createStartedSession(survey, 1));

    const { result } = renderTimer(survey, "q2");

    now += 3000;

    expect(getSurveySessionStore(survey).getState().entries).toHaveLength(1);
    expect(result.current()).toBeUndefined();
  });

  it("times the question that appears once the restored session has changed", () => {
    const survey = createQuiz();

    storeRecord(survey, createStartedSession(survey, 1));

    const { result, rerender } = renderTimer(survey, "q2");

    getSurveySessionStore(survey).setState(
      createStartedSession(survey, 2),
      true,
    );
    rerender({ id: "q3" });
    now += 3000;

    expect(result.current()).toBe(3);
  });

  it("times the first question of a session created on this page", () => {
    const survey = createQuiz();
    const { result } = renderTimer(survey, "q1");

    now += 4000;

    expect(getSurveySessionStore(survey).restoredSession).toBeUndefined();
    expect(result.current()).toBe(4);
  });

  it("gives nothing while no question is open, and once the question has left the screen", () => {
    const { result, rerender, unmount } = renderTimer(createQuiz());

    now += 1000;

    expect(result.current()).toBeUndefined();

    rerender({ id: "q1" });
    now += 1000;

    expect(result.current()).toBe(1);

    unmount();

    expect(result.current()).toBeUndefined();
  });

  it("returns the same function between renders", () => {
    const { result, rerender } = renderTimer(createQuiz(), "q1");
    const getSeconds = result.current;

    rerender({ id: "q2" });

    expect(result.current).toBe(getSeconds);
  });
});

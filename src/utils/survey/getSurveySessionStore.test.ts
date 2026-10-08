import { afterEach, describe, expect, it, vi } from "vitest";

import { SURVEY_SESSION_VERSION } from "@/constants/survey";
import type { Survey, SurveySession } from "@/types/survey";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { answerQuestion } from "./answerQuestion";
import { getSessionStorageKey } from "./getSessionStorageKey";
import { getSurveySessionStore } from "./getSurveySessionStore";
import { skipSessionTopics } from "./skipSessionTopics";

// The stores live as long as the module does, so every test takes a quiz of
// its own.
const createQuiz = (): Survey => createSurvey({ id: crypto.randomUUID() });

const readRecord = (survey: Survey): unknown =>
  JSON.parse(sessionStorage.getItem(getSessionStorageKey(survey.id)) ?? "null");

const writeRecord = (survey: Survey, session: SurveySession): void => {
  const { email, resultState, ...state } = session;

  sessionStorage.setItem(
    getSessionStorageKey(survey.id),
    JSON.stringify({ state, version: SURVEY_SESSION_VERSION }),
  );
};

const refuse = () => {
  throw new DOMException("The operation is insecure.", "SecurityError");
};

describe("getSurveySessionStore()", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    sessionStorage.clear();
    localStorage.clear();
  });

  describe("when a quiz is asked for its store", () => {
    it("holds a new session in the first phase when nothing is stored", () => {
      const survey = createQuiz();
      const session = getSurveySessionStore(survey).getState();

      expect(session.surveyId).toBe(survey.id);
      expect(session.phase).toBe("category-select");
      expect(session.entries).toEqual([]);
    });

    it("returns the same store for the same quiz identifier", () => {
      const survey = createQuiz();
      const store = getSurveySessionStore(survey);

      expect(getSurveySessionStore(survey)).toBe(store);
      expect(
        getSurveySessionStore(createSurvey({ id: survey.id, name: "Quiz" })),
      ).toBe(store);
    });

    it("holds the session and nothing else", () => {
      const session = getSurveySessionStore(createQuiz()).getState();

      expect(Object.keys(session).sort()).toEqual(
        [
          "areCheckpointsOff",
          "areDemographicsGiven",
          "areTopicsConfirmed",
          "checkpointRecord",
          "demographics",
          "email",
          "entries",
          "id",
          "phase",
          "resultState",
          "surveyId",
          "topicIds",
        ].sort(),
      );
    });
  });

  describe("when the session changes", () => {
    it("writes nothing before the first change", () => {
      const survey = createQuiz();

      getSurveySessionStore(survey);

      expect(readRecord(survey)).toBeNull();
      expect(sessionStorage).toHaveLength(0);
    });

    it("writes every change to sessionStorage under the key of the quiz", () => {
      const survey = createQuiz();
      const store = getSurveySessionStore(survey);
      const started = skipSessionTopics(survey, store.getState());
      const answered = answerQuestion(survey, started, "q1-agree", 4);
      const { email, resultState, ...storedState } = answered;

      store.setState(started, true);

      expect(readRecord(survey)).toMatchObject({
        state: { id: started.id, phase: "questions", entries: [] },
        version: 1,
      });

      store.setState(answered, true);

      expect(readRecord(survey)).toEqual({ state: storedState, version: 1 });
      expect(sessionStorage.key(0)).toBe(
        `mypolitics:survey-session:${survey.id}`,
      );
      expect(sessionStorage).toHaveLength(1);
    });

    it("writes neither the e-mail nor the result state", () => {
      const survey = createQuiz();
      const store = getSurveySessionStore(survey);

      store.setState(
        {
          ...createStartedSession(survey, 5),
          phase: "results-calculation",
          email: { address: "jan@example.com", hasConsent: true },
          resultState: "failed",
        },
        true,
      );

      const text = sessionStorage.getItem(getSessionStorageKey(survey.id));
      const { state } = readRecord(survey) as { state: object };

      expect(store.getState().email?.address).toBe("jan@example.com");
      expect(Object.keys(state).sort()).toEqual(
        [
          "areCheckpointsOff",
          "areDemographicsGiven",
          "areTopicsConfirmed",
          "checkpointRecord",
          "demographics",
          "entries",
          "id",
          "phase",
          "surveyId",
          "topicIds",
        ].sort(),
      );
      expect(text).not.toContain("jan@example.com");
      expect(text).not.toContain("hasConsent");
      expect(text).not.toContain("failed");
    });

    it("never writes to the storage shared between tabs, nor to a cookie", () => {
      const survey = createQuiz();
      const store = getSurveySessionStore(survey);

      store.setState(createStartedSession(survey, 2), true);

      expect(localStorage).toHaveLength(0);
      expect(document.cookie).toBe("");
    });
  });

  describe("when a session is stored for the quiz", () => {
    it("restores the stored session when it is created", () => {
      const survey = createQuiz();
      const stored = answerQuestion(
        survey,
        createStartedSession(survey, 1),
        "q2-coal",
        6,
      );

      writeRecord(survey, stored);

      expect(getSurveySessionStore(survey).getState()).toEqual(stored);
    });

    it("restores it with no e-mail and result state not-sent", () => {
      const survey = createQuiz();

      writeRecord(survey, {
        ...createStartedSession(survey, 5),
        phase: "results-calculation",
      });

      const session = getSurveySessionStore(survey).getState();

      expect(session.phase).toBe("results-calculation");
      expect(session.email).toBeNull();
      expect(session.resultState).toBe("not-sent");
    });

    it("starts a new session when the record is not JSON", () => {
      const survey = createQuiz();

      sessionStorage.setItem(getSessionStorageKey(survey.id), "{broken");

      const session = getSurveySessionStore(survey).getState();

      expect(session.phase).toBe("category-select");
      expect(session.entries).toEqual([]);
    });

    it("starts a new session when the record is for another quiz", () => {
      const survey = createQuiz();
      const other = createQuiz();
      const stored = createStartedSession(other, 2);

      writeRecord(survey, stored);

      expect(getSurveySessionStore(survey).getState().id).not.toBe(stored.id);
    });

    it("restores once: a record written later does not reach the store", () => {
      const survey = createQuiz();
      const store = getSurveySessionStore(survey);
      const session = store.getState();

      writeRecord(survey, createStartedSession(survey, 3));

      expect(getSurveySessionStore(survey).getState()).toBe(session);
    });
  });

  describe("when two quizzes are taken in one tab", () => {
    it("keeps two quizzes in two records", () => {
      const first = createQuiz();
      const second = createQuiz();
      const firstStore = getSurveySessionStore(first);
      const secondStore = getSurveySessionStore(second);

      firstStore.setState(createStartedSession(first, 1), true);
      secondStore.setState(createStartedSession(second, 3), true);

      expect(firstStore).not.toBe(secondStore);
      expect(sessionStorage).toHaveLength(2);
      expect(readRecord(first)).toMatchObject({
        state: { surveyId: first.id, id: firstStore.getState().id },
      });
      expect(readRecord(second)).toMatchObject({
        state: { surveyId: second.id, id: secondStore.getState().id },
      });
      expect(firstStore.getState().entries).toHaveLength(1);
      expect(secondStore.getState().entries).toHaveLength(3);
    });
  });

  describe("when storage fails", () => {
    it("works in memory when storage throws on read, and when it throws on write", () => {
      const survey = createQuiz();

      writeRecord(survey, createStartedSession(survey, 2));
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(refuse);
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new DOMException("The quota is exceeded.", "QuotaExceededError");
      });

      const store = getSurveySessionStore(survey);
      const session = createStartedSession(survey, 4);

      expect(store.getState().entries).toEqual([]);
      expect(store.getState().phase).toBe("category-select");
      expect(() => store.setState(session, true)).not.toThrow();
      expect(store.getState()).toBe(session);
    });

    it("goes on in memory when the storage fills up mid-session", () => {
      const survey = createQuiz();
      const store = getSurveySessionStore(survey);
      const stored = createStartedSession(survey, 1);
      const unstored = createStartedSession(survey, 2);

      store.setState(stored, true);
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new DOMException("The quota is exceeded.", "QuotaExceededError");
      });

      expect(() => store.setState(unstored, true)).not.toThrow();
      expect(store.getState()).toBe(unstored);
      expect(readRecord(survey)).toMatchObject({ state: { id: stored.id } });
    });

    it("tells its listeners about a change that could not be written", () => {
      const survey = createQuiz();
      const store = getSurveySessionStore(survey);
      const listener = vi.fn();

      vi.spyOn(Storage.prototype, "setItem").mockImplementation(refuse);
      store.subscribe(listener);
      store.setState(createStartedSession(survey, 1), true);

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("works in memory when the browser refuses the storage itself", () => {
      const warn = vi.spyOn(console, "warn");
      const survey = createQuiz();

      vi.spyOn(globalThis, "sessionStorage", "get").mockImplementation(refuse);

      const store = getSurveySessionStore(survey);
      const session = createStartedSession(survey, 3);

      expect(store.getState().phase).toBe("category-select");
      expect(() => store.setState(session, true)).not.toThrow();
      expect(store.getState()).toBe(session);
      expect(warn).not.toHaveBeenCalled();
    });

    it("works in memory where there is no storage at all", () => {
      const survey = createQuiz();

      vi.stubGlobal("sessionStorage", undefined);

      const store = getSurveySessionStore(survey);

      store.setState(createStartedSession(survey, 3), true);

      expect(store.getState().entries).toHaveLength(3);
    });
  });
});

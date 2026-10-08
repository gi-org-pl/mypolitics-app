import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { DemographicsValues, Survey } from "@/types/survey";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { getSessionStorageKey } from "./getSessionStorageKey";
import { getSurveySessionStore } from "./getSurveySessionStore";
import { leaveSessionDemographics } from "./leaveSessionDemographics";
import { useSurveySession } from "./useSurveySession";

const COMPLETE: DemographicsValues = {
  age: "42",
  gender: "female",
  residenceAreaSize: "village",
  education: "higher",
};

// The stores live as long as the module does, so every test takes a quiz of
// its own.
const createQuiz = (): Survey => createSurvey({ id: crypto.randomUUID() });

const readRecord = (survey: Survey): string | null =>
  sessionStorage.getItem(getSessionStorageKey(survey.id));

const renderSession = (survey: Survey) =>
  renderHook(({ quiz }) => useSurveySession(quiz), {
    initialProps: { quiz: survey },
  });

describe("useSurveySession()", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  describe("when the screen takes a quiz", () => {
    it("returns the session of the quiz, in its first phase", () => {
      const survey = createQuiz();
      const { result } = renderSession(survey);

      expect(result.current.session).toBe(
        getSurveySessionStore(survey).getState(),
      );
      expect(result.current.session.phase).toBe("category-select");
    });

    it("returns the session and applies each action to it", () => {
      const survey = createQuiz();
      const { result } = renderSession(survey);

      act(() => result.current.setTopics(["ecology"]));
      expect(result.current.session.topicIds).toEqual(["ecology"]);

      act(() => result.current.confirmTopics());
      expect(result.current.session.phase).toBe("questions");
      expect(result.current.session.areTopicsConfirmed).toBe(true);

      act(() => result.current.answer("q1-agree", 4));
      expect(result.current.session.entries).toEqual([
        { questionId: "q1", answerId: "q1-agree" },
      ]);
      expect(result.current.session.checkpointRecord.timeSamples).toEqual([
        { questionId: "q1", seconds: 4 },
      ]);

      act(() => result.current.showCheckpoint({ type: "halfway" }));
      expect(result.current.session.phase).toBe("checkpoints");
      expect(result.current.session.checkpointRecord.cardsShown).toEqual([
        { type: "halfway" },
      ]);

      act(() => result.current.closeCheckpoint());
      expect(result.current.session.phase).toBe("questions");

      act(() => result.current.skip(2));
      expect(result.current.session.entries).toHaveLength(2);
      expect(result.current.session.entries[1]).toEqual({ questionId: "q2" });

      act(() => result.current.back());
      expect(result.current.session.entries).toHaveLength(1);

      act(() => result.current.turnCheckpointsOff());
      expect(result.current.session.areCheckpointsOff).toBe(true);

      act(() => {
        result.current.skip();
        result.current.skip();
        result.current.skip();
        result.current.answer("q5-state");
      });
      expect(result.current.session.entries).toHaveLength(5);
      expect(result.current.session.phase).toBe("demographics");

      act(() => result.current.setDemographics(COMPLETE));
      expect(result.current.session.demographics).toEqual(COMPLETE);

      act(() => result.current.leaveDemographics(true));
      expect(result.current.session.phase).toBe("results-calculation");
      expect(result.current.session.areDemographicsGiven).toBe(true);

      act(() => result.current.setResultState("failed"));
      expect(result.current.session.resultState).toBe("failed");

      const failedId = result.current.session.id;

      act(() => result.current.reset());
      expect(result.current.session.id).not.toBe(failedId);
      expect(result.current.session.phase).toBe("category-select");
      expect(result.current.session.entries).toEqual([]);
      expect(result.current.session.areCheckpointsOff).toBe(true);

      act(() => result.current.skipTopics());
      expect(result.current.session.phase).toBe("questions");
      expect(result.current.session.topicIds).toEqual([]);
    });

    it("applies the actions of the e-mail card", () => {
      const survey = createQuiz();
      const { result } = renderSession(survey);
      const email = { address: "jan@example.com", hasConsent: true };

      act(() =>
        getSurveySessionStore(survey).setState(
          leaveSessionDemographics(
            survey,
            createStartedSession(survey, 5),
            false,
            { isEmailSendingSetUp: true },
          ),
          true,
        ),
      );
      expect(result.current.session.phase).toBe("email-capture");

      act(() => result.current.setEmail(email));
      expect(result.current.session.email).toEqual(email);

      act(() => result.current.back());
      expect(result.current.session.phase).toBe("demographics");
      expect(result.current.session.email).toEqual(email);

      act(() =>
        getSurveySessionStore(survey).setState(
          { ...result.current.session, phase: "email-capture" },
          true,
        ),
      );
      act(() => result.current.leaveEmailCapture(true));
      expect(result.current.session.phase).toBe("results-calculation");
      expect(result.current.session.email).toEqual(email);

      act(() => result.current.setEmail(null));
      expect(result.current.session.email).toBeNull();
    });

    it("stores every change at once", () => {
      const survey = createQuiz();
      const { result } = renderSession(survey);

      expect(readRecord(survey)).toBeNull();

      act(() => result.current.skipTopics());
      expect(JSON.parse(readRecord(survey) ?? "{}").state.phase).toBe(
        "questions",
      );

      act(() => result.current.answer("q1-agree"));
      expect(JSON.parse(readRecord(survey) ?? "{}").state.entries).toEqual([
        { questionId: "q1", answerId: "q1-agree" },
      ]);
    });
  });

  describe("when an action is called twice", () => {
    it("applies an action once when it is called twice at a moment it applies once", () => {
      const survey = createQuiz();
      const { result } = renderSession(survey);

      act(() => {
        result.current.skipTopics();
        result.current.skipTopics();
        result.current.answer("q1-agree");
        result.current.answer("q1-agree");
      });

      expect(result.current.session.phase).toBe("questions");
      expect(result.current.session.entries).toEqual([
        { questionId: "q1", answerId: "q1-agree" },
      ]);

      act(() => {
        result.current.showCheckpoint("first");
        result.current.showCheckpoint("second");
      });

      expect(result.current.session.checkpointRecord.cardsShown).toEqual([
        "first",
      ]);

      act(() => {
        result.current.closeCheckpoint();
        result.current.closeCheckpoint();
      });

      expect(result.current.session.phase).toBe("questions");
      expect(result.current.session.entries).toHaveLength(1);
    });

    it("applies the second of two actions to what the first one left", () => {
      const survey = createQuiz();
      const { result } = renderSession(survey);

      act(() => {
        result.current.skipTopics();
        result.current.answer("q1-agree");
        result.current.showCheckpoint("card");
      });

      expect(result.current.session.phase).toBe("checkpoints");
      expect(result.current.session.entries).toHaveLength(1);
    });
  });

  describe("when the session changes", () => {
    it("keeps the actions the same functions", () => {
      const survey = createQuiz();
      const { result } = renderSession(survey);
      const { session, ...actions } = result.current;

      act(() => result.current.skipTopics());

      const { session: nextSession, ...nextActions } = result.current;

      expect(nextSession).not.toBe(session);
      expect(Object.keys(actions)).toHaveLength(17);

      for (const [name, action] of Object.entries(actions)) {
        expect(nextActions[name as keyof typeof actions]).toBe(action);
      }
    });

    it("returns the same object while nothing changes", () => {
      const survey = createQuiz();
      const { result, rerender } = renderSession(survey);
      const api = result.current;

      rerender({ quiz: survey });

      expect(result.current).toBe(api);
    });
  });

  describe("when leave is called", () => {
    it("removes the record of the quiz from storage", () => {
      const survey = createQuiz();
      const { result } = renderSession(survey);

      act(() => result.current.skipTopics());
      expect(readRecord(survey)).not.toBeNull();

      act(() => result.current.leave());

      expect(readRecord(survey)).toBeNull();
      expect(sessionStorage).toHaveLength(0);
    });

    it("leaves the record of another quiz where it is", () => {
      const survey = createQuiz();
      const other = createQuiz();
      const { result } = renderSession(survey);
      const { result: otherResult } = renderSession(other);

      act(() => result.current.skipTopics());
      act(() => otherResult.current.skipTopics());
      act(() => result.current.leave());

      expect(readRecord(survey)).toBeNull();
      expect(readRecord(other)).not.toBeNull();
    });

    it("leaves the session in memory as it is", () => {
      const survey = createQuiz();
      const { result } = renderSession(survey);

      act(() => result.current.skipTopics());
      act(() => result.current.answer("q1-agree"));

      const session = result.current.session;

      act(() => result.current.leave());

      expect(result.current.session).toBe(session);
      expect(getSurveySessionStore(survey).getState()).toBe(session);
    });

    it("writes nothing to storage afterwards", () => {
      const survey = createQuiz();
      const { result } = renderSession(survey);

      act(() => result.current.skipTopics());
      act(() => result.current.leave());
      act(() => {
        result.current.skipTopics();
        result.current.answer("unknown");
        result.current.closeCheckpoint();
        result.current.setResultState("calculated");
      });

      expect(readRecord(survey)).toBeNull();
    });

    it("writes again once the session changes", () => {
      const survey = createQuiz();
      const { result } = renderSession(survey);

      act(() => result.current.skipTopics());
      act(() => result.current.leave());
      act(() => result.current.answer("q1-agree"));

      expect(readRecord(survey)).not.toBeNull();
    });

    it("does not throw when the browser refuses storage", () => {
      const survey = createQuiz();
      const { result } = renderSession(survey);

      vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
        throw new DOMException("The operation is insecure.", "SecurityError");
      });

      expect(() => act(() => result.current.leave())).not.toThrow();
    });
  });

  describe("when startOver is called", () => {
    it("replaces the session with a new one in the first phase", () => {
      const survey = createQuiz();
      const { result } = renderSession(survey);

      act(() => result.current.skipTopics());
      act(() => result.current.answer("q1-agree", 3));
      act(() => result.current.showCheckpoint("card"));

      const oldId = result.current.session.id;

      act(() => result.current.startOver());

      expect(result.current.session).toEqual({
        id: result.current.session.id,
        surveyId: survey.id,
        entries: [],
        topicIds: [],
        areTopicsConfirmed: false,
        phase: "category-select",
        areCheckpointsOff: false,
        demographics: {},
        areDemographicsGiven: false,
        checkpointRecord: { cardsShown: [], timeSamples: [] },
        email: null,
        resultState: "not-sent",
      });
      expect(result.current.session.id).not.toBe(oldId);
    });

    it("turns checkpoints on again, even if they were off", () => {
      const survey = createQuiz();
      const { result } = renderSession(survey);

      act(() => result.current.turnCheckpointsOff());
      expect(result.current.session.areCheckpointsOff).toBe(true);

      act(() => result.current.startOver());

      expect(result.current.session.areCheckpointsOff).toBe(false);
    });

    it("works at any moment, also where a reset does not", () => {
      const survey = createQuiz();
      const { result } = renderSession(survey);
      const firstId = result.current.session.id;

      act(() => result.current.reset());
      expect(result.current.session.id).toBe(firstId);

      act(() => result.current.startOver());
      expect(result.current.session.id).not.toBe(firstId);
    });

    it("starts a new session after the taker left for the results", () => {
      const survey = createQuiz();
      const { result } = renderSession(survey);

      act(() => result.current.skipTopics());
      act(() => result.current.leave());
      act(() => result.current.startOver());

      expect(result.current.session.phase).toBe("category-select");
      expect(JSON.parse(readRecord(survey) ?? "{}").state.id).toBe(
        result.current.session.id,
      );
    });
  });

  describe("when the quiz is read again in another language", () => {
    it("keeps the session", () => {
      const survey = createQuiz();
      const { result, rerender } = renderSession(survey);

      act(() => result.current.skipTopics());
      act(() => result.current.answer("q1-agree"));

      const session = result.current.session;

      rerender({ quiz: createSurvey({ id: survey.id, name: "Test quiz" }) });

      expect(result.current.session).toBe(session);
    });

    it("applies the actions to the quiz as it is read now", () => {
      const survey = createQuiz();
      const { result, rerender } = renderSession(survey);
      const [first, second, ...rest] = survey.questions;
      const translated = createSurvey({
        id: survey.id,
        questions: [
          first,
          {
            ...second,
            possibleAnswers: [
              ...second.possibleAnswers,
              { id: "q2-gas", text: "From gas", weight: 1, orientationIds: [] },
            ],
          },
          ...rest,
        ],
      });

      act(() => result.current.skipTopics());
      act(() => result.current.answer("q1-agree"));
      act(() => result.current.answer("q2-gas"));
      expect(result.current.session.entries).toHaveLength(1);

      rerender({ quiz: translated });
      act(() => result.current.answer("q2-gas"));

      expect(result.current.session.entries).toEqual([
        { questionId: "q1", answerId: "q1-agree" },
        { questionId: "q2", answerId: "q2-gas" },
      ]);
    });
  });
});

import { describe, expect, it, vi } from "vitest";
import { createStore } from "zustand";

import type { SurveySession, SurveySessionAction } from "@/types/survey";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { answerQuestion } from "./answerQuestion";
import { bindSessionAction } from "./bindSessionAction";
import { skipQuestion } from "./skipQuestion";

describe("bindSessionAction()", () => {
  const survey = createSurvey();
  const createSessionStore = (session = createStartedSession(survey)) =>
    createStore<SurveySession>()(() => session);

  describe("when the bound action is called", () => {
    it("hands the action the quiz, the session of the store and the arguments", () => {
      const store = createSessionStore();
      const session = store.getState();
      const action = vi.fn<
        SurveySessionAction<[first: string, second?: number]>
      >((_survey, current) => current);

      bindSessionAction(store, survey, action)("answer", 4);

      expect(action).toHaveBeenCalledTimes(1);
      expect(action).toHaveBeenCalledWith(survey, session, "answer", 4);
    });

    it("puts the session the action returns in the store", () => {
      const store = createSessionStore();

      bindSessionAction(store, survey, answerQuestion)("q1-agree", 3);

      expect(store.getState().entries).toEqual([
        { questionId: "q1", answerId: "q1-agree" },
      ]);
      expect(store.getState().checkpointRecord.timeSamples).toEqual([
        { questionId: "q1", seconds: 3 },
      ]);
    });

    it("replaces the session, it does not merge into it", () => {
      const store = createSessionStore();
      const next = { ...createStartedSession(survey, 2) };

      bindSessionAction(store, survey, () => next)();

      expect(store.getState()).toBe(next);
    });

    it("returns nothing", () => {
      const store = createSessionStore();

      expect(bindSessionAction(store, survey, skipQuestion)()).toBeUndefined();
    });
  });

  describe("when the action is called twice in a row", () => {
    it("works from the session the first call left", () => {
      const store = createSessionStore();
      const skip = bindSessionAction(store, survey, skipQuestion);

      skip();
      skip();

      expect(store.getState().entries).toEqual([
        { questionId: "q1" },
        { questionId: "q2" },
      ]);
    });
  });

  describe("when the action does not apply", () => {
    it("leaves the store alone, so that nothing is told or written", () => {
      const store = createSessionStore();
      const session = store.getState();
      const setState = vi.spyOn(store, "setState");
      const listener = vi.fn();

      store.subscribe(listener);
      bindSessionAction(store, survey, answerQuestion)("unknown");

      expect(store.getState()).toBe(session);
      expect(setState).not.toHaveBeenCalled();
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("when the quiz was read again with other questions", () => {
    // The store holds three done questions of the quiz as it was read first;
    // the quiz as read now has lost the second one.
    const withoutSecond = createSurvey({
      questions: survey.questions.filter(({ id }) => id !== "q2"),
    });

    it("hands the action the session as it fits the quiz as read now", () => {
      const store = createSessionStore(createStartedSession(survey, 3));
      const action = vi.fn<SurveySessionAction>((_survey, current) => current);

      bindSessionAction(store, withoutSecond, action)();

      expect(action.mock.calls[0][1].entries).toEqual([{ questionId: "q1" }]);
      expect(action.mock.calls[0][1].phase).toBe("questions");
    });

    it("answers the question that is current in the quiz as read now", () => {
      const store = createSessionStore(createStartedSession(survey, 3));

      bindSessionAction(store, withoutSecond, answerQuestion)("q3-agree");

      expect(store.getState().entries).toEqual([
        { questionId: "q1" },
        { questionId: "q3", answerId: "q3-agree" },
      ]);
    });

    it("leaves the store alone when the action does not apply", () => {
      const session = createStartedSession(survey, 3);
      const store = createSessionStore(session);

      bindSessionAction(store, withoutSecond, answerQuestion)("q4-agree");

      expect(store.getState()).toBe(session);
    });
  });
});

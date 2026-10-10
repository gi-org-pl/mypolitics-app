import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Survey, SurveySession } from "@/types/survey";
import { getSessionCheckpoint } from "@/utils/checkpoint/engine/getSessionCheckpoint";
import { getSurveySessionStore } from "@/utils/survey/session/getSurveySessionStore";
import { useSurveySession } from "@/utils/survey/session/useSurveySession";
import { createNineQuestionSurvey } from "@/utils/vitest/survey/createNineQuestionSurvey";
import { createStartedSession } from "@/utils/vitest/survey/createStartedSession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";

import { CHECKPOINT_CARDS } from "../../../SurveyQuestionnaire.constants";
import { useQuestionActions } from "./useQuestionActions";

vi.mock("../../../SurveyQuestionnaire.constants", () => ({
  CHECKPOINT_CARDS: {},
}));
vi.mock("@/utils/checkpoint/engine/getSessionCheckpoint", { spy: true });

const StubCard = () => null;

let now = 0;

const renderActions = (
  done = 0,
  // The stores live as long as the module does: a quiz of its own.
  survey: Survey = createSurvey({ id: crypto.randomUUID() }),
  overrides: Partial<SurveySession> = {},
) => {
  const store = getSurveySessionStore(survey);

  store.setState({ ...createStartedSession(survey, done), ...overrides }, true);

  return {
    ...renderHook(() => {
      const session = useSurveySession(survey);

      return {
        session: session.session,
        actions: useQuestionActions(survey, session),
      };
    }),
    survey,
    getStoredSession: store.getState,
  };
};

// A quiz in which the halfway card fires after the fifth question.
const renderNineQuestions = (
  done: number,
  overrides: Partial<SurveySession> = {},
) =>
  renderActions(
    done,
    createNineQuestionSurvey({ id: crypto.randomUUID() }),
    overrides,
  );

describe("useQuestionActions()", () => {
  beforeEach(() => {
    now = 10_000;
    vi.spyOn(performance, "now").mockImplementation(() => now);
  });

  afterEach(() => {
    CHECKPOINT_CARDS.halfway = undefined;
    vi.restoreAllMocks();
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  describe("when answer is called", () => {
    it("records the answer of the current question", () => {
      const { result } = renderActions();

      act(() => result.current.actions.answer("q1-agree"));

      expect(result.current.session.entries).toEqual([
        { questionId: "q1", answerId: "q1-agree" },
      ]);
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
    it("records a skip of the current question", () => {
      const { result } = renderActions();

      act(() => result.current.actions.skip());

      expect(result.current.session.entries).toEqual([{ questionId: "q1" }]);
    });
  });

  describe("when answer is called after the question has left the screen", () => {
    it("records nothing and asks for no card", () => {
      const { result, unmount, getStoredSession } = renderActions();
      const { actions } = result.current;

      unmount();
      act(() => actions.answer("q1-agree"));

      expect(getStoredSession().entries).toEqual([]);
      expect(getSessionCheckpoint).not.toHaveBeenCalled();
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

  describe("checkpoints", () => {
    describe("when a question is answered", () => {
      it("passes the seconds of the timer to answer", () => {
        const { result } = renderActions();

        now += 4500;
        act(() => result.current.actions.answer("q1-agree"));

        expect(result.current.session.checkpointRecord.timeSamples).toEqual([
          { questionId: "q1", seconds: 4.5 },
        ]);
      });

      it("times the next question from the moment it appears", () => {
        const { result } = renderActions();

        now += 4500;
        act(() => result.current.actions.answer("q1-agree"));
        now += 2000;
        act(() => result.current.actions.answer("q2-coal"));

        expect(result.current.session.checkpointRecord.timeSamples).toEqual([
          { questionId: "q1", seconds: 4.5 },
          { questionId: "q2", seconds: 2 },
        ]);
      });

      it("asks for a card with the session as it stands after the answer", () => {
        const { result, survey } = renderNineQuestions(4);

        CHECKPOINT_CARDS.halfway = StubCard;
        act(() => result.current.actions.answer("q5-a1"));

        expect(getSessionCheckpoint).toHaveBeenCalledTimes(1);
        expect(getSessionCheckpoint).toHaveBeenCalledWith(
          survey,
          expect.objectContaining({
            entries: expect.arrayContaining([
              { questionId: "q5", answerId: "q5-a1" },
            ]),
          }),
          ["halfway"],
        );
        expect(
          vi.mocked(getSessionCheckpoint).mock.calls[0][1].entries,
        ).toHaveLength(5);
      });

      it("asks for nothing when the answer is not one of the question", () => {
        const { result } = renderNineQuestions(5);

        CHECKPOINT_CARDS.halfway = StubCard;
        act(() => result.current.actions.answer("q1-a1"));

        expect(result.current.session.entries).toHaveLength(5);
        expect(getSessionCheckpoint).not.toHaveBeenCalled();
        expect(result.current.session.phase).toBe("questions");
      });
    });

    describe("when a question is skipped", () => {
      it("passes the seconds of the timer to skip", () => {
        const { result } = renderActions();

        now += 1250;
        act(() => result.current.actions.skip());

        expect(result.current.session.checkpointRecord.timeSamples).toEqual([
          { questionId: "q1", seconds: 1.25 },
        ]);
      });

      it("asks for a card", () => {
        const { result, survey } = renderNineQuestions(4);

        CHECKPOINT_CARDS.halfway = StubCard;
        act(() => result.current.actions.skip());

        expect(getSessionCheckpoint).toHaveBeenCalledTimes(1);
        expect(getSessionCheckpoint).toHaveBeenCalledWith(
          survey,
          expect.objectContaining({ id: result.current.session.id }),
          ["halfway"],
        );
        expect(result.current.session.phase).toBe("checkpoints");
      });
    });

    describe("when a card comes back", () => {
      it("calls showCheckpoint with the card wrapped as a shown card", () => {
        const { result } = renderNineQuestions(4);

        CHECKPOINT_CARDS.halfway = StubCard;
        act(() => result.current.actions.answer("q5-a2"));

        expect(result.current.session.phase).toBe("checkpoints");
        expect(result.current.session.entries).toHaveLength(5);
        expect(result.current.session.checkpointRecord.cardsShown).toEqual([
          {
            card: {
              type: "halfway",
              boundary: 5,
              line: { pool: "halfway", index: expect.any(Number) },
              percent: 55,
              minutes: 4,
            },
          },
        ]);
      });
    });

    describe("when nothing comes back", () => {
      it("does not call showCheckpoint", () => {
        const { result } = renderNineQuestions(3);

        CHECKPOINT_CARDS.halfway = StubCard;
        act(() => result.current.actions.answer("q4-a1"));

        expect(getSessionCheckpoint).toHaveBeenCalledTimes(1);
        expect(result.current.session.phase).toBe("questions");
        expect(result.current.session.checkpointRecord.cardsShown).toEqual([]);
      });

      it("shows no card while no card type is registered", () => {
        const { result } = renderNineQuestions(4);

        act(() => result.current.actions.answer("q5-a1"));

        expect(getSessionCheckpoint).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          [],
        );
        expect(result.current.session.phase).toBe("questions");
        expect(result.current.session.checkpointRecord.cardsShown).toEqual([]);
      });

      it("shows no card while checkpoints are off", () => {
        const { result } = renderNineQuestions(4, { areCheckpointsOff: true });

        CHECKPOINT_CARDS.halfway = StubCard;
        act(() => result.current.actions.skip());

        expect(result.current.session.phase).toBe("questions");
        expect(result.current.session.checkpointRecord.cardsShown).toEqual([]);
      });
    });
  });
});

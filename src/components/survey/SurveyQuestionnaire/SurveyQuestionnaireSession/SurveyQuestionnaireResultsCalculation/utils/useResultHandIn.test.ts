import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createResult } from "@/services/api/client/createResult";
import { getResult } from "@/services/api/client/getResult";
import type { CreateResultOutcome, Survey, SurveyResult } from "@/types/survey";
import { buildResultInput } from "@/utils/survey/buildResultInput";
import { getSurveySessionStore } from "@/utils/survey/getSurveySessionStore";
import { useSurveySession } from "@/utils/survey/useSurveySession";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";

import {
  CREATE_RESULT_TIMEOUT_MS,
  RESULT_READ_INTERVAL_MS,
  RESULT_WAIT_MS,
} from "../SurveyQuestionnaireResultsCalculation.constants";
import { useResultHandIn } from "./useResultHandIn";

vi.mock("@/services/api/client/createResult");
vi.mock("@/services/api/client/getResult");

const createResultMock = vi.mocked(createResult);
const getResultMock = vi.mocked(getResult);

const toResult = (isCalculated: boolean): SurveyResult => ({
  id: "result",
  isCalculated,
});

// A hand-in that the test answers by hand.
const holdHandIn = () => {
  let answer: (outcome: CreateResultOutcome) => void = () => undefined;

  createResultMock.mockImplementationOnce(
    () =>
      new Promise<CreateResultOutcome>((resolve) => {
        answer = resolve;
      }),
  );

  return (outcome: CreateResultOutcome) =>
    act(async () => {
      answer(outcome);
      await vi.advanceTimersByTimeAsync(0);
    });
};

const pass = (milliseconds: number) =>
  act(() => vi.advanceTimersByTimeAsync(milliseconds));

const renderHandIn = () => {
  // The stores live as long as the module does: a quiz of its own.
  const survey: Survey = createSurvey({ id: crypto.randomUUID() });
  const session = {
    ...createStartedSession(survey, survey.questions.length),
    phase: "results-calculation" as const,
  };

  getSurveySessionStore(survey).setState(session, true);

  const view = renderHook(
    ({ run }) => {
      const api = useSurveySession(survey);

      return {
        session: api.session,
        handIn: useResultHandIn({ survey, session: api }, run),
      };
    },
    { initialProps: { run: 0 } },
  );

  return { ...view, input: buildResultInput(survey, session) };
};

describe("useResultHandIn()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    createResultMock.mockResolvedValue("stored");
    getResultMock.mockResolvedValue(toResult(false));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    sessionStorage.clear();
  });

  describe("when a run starts", () => {
    it("sends the hand-in of the session once, with a time limit of 10 seconds", async () => {
      const answer = holdHandIn();
      const { input, rerender } = renderHandIn();

      rerender({ run: 0 });

      expect(CREATE_RESULT_TIMEOUT_MS).toBe(10_000);
      expect(createResultMock).toHaveBeenCalledTimes(1);
      expect(createResultMock).toHaveBeenCalledWith(input, {
        signal: expect.any(AbortSignal),
        timeoutMs: CREATE_RESULT_TIMEOUT_MS,
      });
      expect(getResultMock).not.toHaveBeenCalled();

      await answer("stored");
    });

    it("sets the result state to sending", async () => {
      const answer = holdHandIn();
      const { result } = renderHandIn();

      expect(result.current.handIn).toBe("sending");
      expect(result.current.session.resultState).toBe("sending");

      await answer("stored");
    });
  });

  describe("given a stored result", () => {
    it("sets the result state to created and reads the result at once", async () => {
      const answer = holdHandIn();
      const { result, input } = renderHandIn();

      await answer("stored");

      expect(result.current.handIn).toBe("created");
      expect(result.current.session.resultState).toBe("created");
      expect(getResultMock).toHaveBeenCalledTimes(1);
      expect(getResultMock).toHaveBeenCalledWith(input.sessionId, {
        signal: expect.any(AbortSignal),
      });
    });

    it("reads again a second after each read has answered, never two at a time", async () => {
      let answerRead: (result: SurveyResult) => void = () => undefined;

      getResultMock.mockImplementationOnce(
        () =>
          new Promise<SurveyResult>((resolve) => {
            answerRead = resolve;
          }),
      );
      renderHandIn();
      await pass(RESULT_READ_INTERVAL_MS * 3);

      expect(getResultMock).toHaveBeenCalledTimes(1);

      answerRead(toResult(false));
      await pass(RESULT_READ_INTERVAL_MS - 1);

      expect(getResultMock).toHaveBeenCalledTimes(1);

      await pass(1);

      expect(RESULT_READ_INTERVAL_MS).toBe(1000);
      expect(getResultMock).toHaveBeenCalledTimes(2);
    });

    it("keeps reading while the result is not calculated", async () => {
      const { result } = renderHandIn();

      await pass(RESULT_READ_INTERVAL_MS * 5);

      expect(getResultMock).toHaveBeenCalledTimes(6);
      expect(result.current.handIn).toBe("created");
      expect(result.current.session.resultState).toBe("created");
    });

    it("sets the result state to calculated and stops reading", async () => {
      getResultMock
        .mockResolvedValueOnce(toResult(false))
        .mockResolvedValueOnce(toResult(true));

      const { result } = renderHandIn();

      await pass(RESULT_READ_INTERVAL_MS);

      expect(result.current.handIn).toBe("calculated");
      expect(result.current.session.resultState).toBe("calculated");
      expect(vi.getTimerCount()).toBe(0);

      await pass(RESULT_WAIT_MS);

      expect(getResultMock).toHaveBeenCalledTimes(2);
      expect(result.current.handIn).toBe("calculated");
    });
  });

  describe("given an unreachable API", () => {
    it("sends the same hand-in once more by itself", async () => {
      const answerFirst = holdHandIn();
      const answerSecond = holdHandIn();
      const { result } = renderHandIn();

      await answerFirst("unreachable");

      expect(result.current.handIn).toBe("sending");
      expect(result.current.session.resultState).toBe("sending");
      expect(createResultMock).toHaveBeenCalledTimes(2);
      expect(createResultMock.mock.calls[1]).toEqual(
        createResultMock.mock.calls[0],
      );

      await answerSecond("stored");
    });

    it("carries on when the second try is stored", async () => {
      createResultMock.mockResolvedValueOnce("unreachable");

      const { result } = renderHandIn();

      await pass(0);

      expect(createResultMock).toHaveBeenCalledTimes(2);
      expect(result.current.handIn).toBe("created");
      expect(result.current.session.resultState).toBe("created");
      expect(getResultMock).toHaveBeenCalledTimes(1);
    });

    it("ends not-saved and sets the result state to failed when the second try fails", async () => {
      createResultMock.mockResolvedValue("unreachable");

      const { result } = renderHandIn();

      await pass(RESULT_WAIT_MS);

      expect(createResultMock).toHaveBeenCalledTimes(2);
      expect(result.current.handIn).toBe("not-saved");
      expect(result.current.session.resultState).toBe("failed");
      expect(getResultMock).not.toHaveBeenCalled();
    });
  });

  describe("given a refused hand-in", () => {
    it("ends not-saved with no second try", async () => {
      createResultMock.mockResolvedValue("refused");

      const { result } = renderHandIn();

      await pass(RESULT_WAIT_MS);

      expect(createResultMock).toHaveBeenCalledTimes(1);
      expect(result.current.handIn).toBe("not-saved");
      expect(result.current.session.resultState).toBe("failed");
      expect(getResultMock).not.toHaveBeenCalled();
    });
  });

  describe("given a result that is not calculated within RESULT_WAIT_MS", () => {
    it("ends not-ready, sets the result state to failed and stops reading", async () => {
      const { result } = renderHandIn();

      await pass(RESULT_WAIT_MS - 1);

      expect(result.current.handIn).toBe("created");

      await pass(1);

      const reads = getResultMock.mock.calls.length;

      expect(RESULT_WAIT_MS).toBe(30_000);
      expect(result.current.handIn).toBe("not-ready");
      expect(result.current.session.resultState).toBe("failed");
      expect(vi.getTimerCount()).toBe(0);

      await pass(RESULT_WAIT_MS);

      expect(getResultMock).toHaveBeenCalledTimes(reads);
    });
  });

  describe("when a new run starts after a failure", () => {
    it("is sending from the render that starts it", async () => {
      createResultMock.mockResolvedValueOnce("refused");

      const { result, rerender } = renderHandIn();

      await pass(0);

      expect(result.current.handIn).toBe("not-saved");

      const answer = holdHandIn();

      rerender({ run: 1 });

      expect(result.current.handIn).toBe("sending");
      expect(result.current.session.resultState).toBe("sending");

      await answer("stored");

      expect(result.current.handIn).toBe("created");
    });

    it("sends the same hand-in again", async () => {
      createResultMock.mockResolvedValueOnce("refused");

      const { result, input, rerender } = renderHandIn();

      await pass(0);
      rerender({ run: 1 });
      await pass(0);

      expect(createResultMock).toHaveBeenCalledTimes(2);
      expect(createResultMock.mock.calls[1][0]).toBe(
        createResultMock.mock.calls[0][0],
      );
      expect(createResultMock.mock.calls[1][0]).toEqual(input);
      expect(result.current.handIn).toBe("created");
    });

    it("waits another RESULT_WAIT_MS", async () => {
      const { result, rerender } = renderHandIn();

      await pass(RESULT_WAIT_MS);

      expect(result.current.handIn).toBe("not-ready");

      rerender({ run: 1 });
      await pass(RESULT_WAIT_MS - 1);

      // The result exists already: the hand-in is answered "stored" again.
      expect(createResultMock).toHaveBeenCalledTimes(2);
      expect(result.current.handIn).toBe("created");
      expect(result.current.session.resultState).toBe("created");

      await pass(1);

      expect(result.current.handIn).toBe("not-ready");
      expect(result.current.session.resultState).toBe("failed");
    });
  });

  describe("when unmounted during a run", () => {
    it("cancels the hand-in and ignores its outcome", async () => {
      const answer = holdHandIn();
      const { result, unmount } = renderHandIn();
      const signal = createResultMock.mock.calls[0][1]?.signal;

      expect(signal?.aborted).toBe(false);

      unmount();

      expect(signal?.aborted).toBe(true);

      await answer("stored");

      expect(result.current.session.resultState).toBe("sending");
      expect(getResultMock).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    });

    it("cancels the hand-in and the reads and leaves no timer running", async () => {
      const { result, unmount } = renderHandIn();

      await pass(RESULT_READ_INTERVAL_MS);

      const reads = getResultMock.mock.calls.length;
      const signal = getResultMock.mock.calls[0][1]?.signal;

      expect(vi.getTimerCount()).toBeGreaterThan(0);

      unmount();

      expect(createResultMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
      expect(signal?.aborted).toBe(true);
      expect(vi.getTimerCount()).toBe(0);

      await pass(RESULT_WAIT_MS);

      expect(getResultMock).toHaveBeenCalledTimes(reads);
      expect(result.current.session.resultState).toBe("created");
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getResult } from "@/services/api/client/getResult";
import type { SurveyResult } from "@/types/survey";

import {
  RESULT_READ_INTERVAL_MS,
  RESULT_WAIT_MS,
} from "../SurveyQuestionnaireResultsCalculation.constants";
import { waitForResult } from "./waitForResult";

vi.mock("@/services/api/client/getResult");

const RESULT_ID = "0b9f3c1e-5a7d-4e2b-9c41-7f6a2d8e1b35";
const NOT_CALCULATED: SurveyResult = { id: RESULT_ID, isCalculated: false };
const CALCULATED: SurveyResult = { id: RESULT_ID, isCalculated: true };

const getResultMock = vi.mocked(getResult);

// A read that the test answers by hand.
const holdRead = () => {
  let answer: (result: SurveyResult) => void = () => undefined;

  getResultMock.mockImplementationOnce(
    () =>
      new Promise<SurveyResult>((resolve) => {
        answer = resolve;
      }),
  );

  return async (result: SurveyResult) => {
    answer(result);
    await vi.advanceTimersByTimeAsync(0);
  };
};

// What the wait ended with, or nothing while it goes on.
const watch = (wait: Promise<boolean>) => {
  const outcome: { value?: boolean } = {};

  wait.then((value) => {
    outcome.value = value;
  });

  return outcome;
};

describe("waitForResult()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    getResultMock.mockResolvedValue(NOT_CALCULATED);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  describe("when the wait starts", () => {
    it("reads the result of the session at once", () => {
      waitForResult(RESULT_ID, new AbortController().signal);

      expect(getResultMock).toHaveBeenCalledTimes(1);
      expect(getResultMock).toHaveBeenCalledWith(RESULT_ID, {
        signal: expect.any(AbortSignal),
      });
    });
  });

  describe("given a result that is not calculated yet", () => {
    it("reads again a second after each read has answered, never two at a time", async () => {
      const answerFirst = holdRead();

      waitForResult(RESULT_ID, new AbortController().signal);

      // A slow read holds the next one back, however long it takes.
      await vi.advanceTimersByTimeAsync(RESULT_READ_INTERVAL_MS * 5);

      expect(getResultMock).toHaveBeenCalledTimes(1);

      const answerSecond = holdRead();

      await answerFirst(NOT_CALCULATED);
      await vi.advanceTimersByTimeAsync(RESULT_READ_INTERVAL_MS - 1);

      expect(getResultMock).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(1);

      expect(getResultMock).toHaveBeenCalledTimes(2);

      await answerSecond(NOT_CALCULATED);
      await vi.advanceTimersByTimeAsync(RESULT_READ_INTERVAL_MS);

      expect(getResultMock).toHaveBeenCalledTimes(3);
    });

    it("keeps reading while the result is not calculated", async () => {
      const outcome = watch(
        waitForResult(RESULT_ID, new AbortController().signal),
      );

      await vi.advanceTimersByTimeAsync(RESULT_READ_INTERVAL_MS * 4);

      expect(getResultMock).toHaveBeenCalledTimes(5);
      expect(outcome.value).toBeUndefined();
    });
  });

  describe("given a calculated result", () => {
    it("ends with true and stops reading", async () => {
      getResultMock
        .mockResolvedValueOnce(NOT_CALCULATED)
        .mockResolvedValueOnce(CALCULATED);

      const outcome = watch(
        waitForResult(RESULT_ID, new AbortController().signal),
      );

      await vi.advanceTimersByTimeAsync(RESULT_READ_INTERVAL_MS);

      expect(outcome.value).toBe(true);
      expect(vi.getTimerCount()).toBe(0);

      await vi.advanceTimersByTimeAsync(RESULT_WAIT_MS);

      expect(getResultMock).toHaveBeenCalledTimes(2);
    });
  });

  describe("given a result that is not calculated within RESULT_WAIT_MS", () => {
    it("ends with false and stops reading", async () => {
      const outcome = watch(
        waitForResult(RESULT_ID, new AbortController().signal),
      );

      await vi.advanceTimersByTimeAsync(RESULT_WAIT_MS - 1);

      expect(outcome.value).toBeUndefined();

      await vi.advanceTimersByTimeAsync(1);

      const reads = getResultMock.mock.calls.length;

      expect(RESULT_WAIT_MS).toBe(30_000);
      expect(outcome.value).toBe(false);
      expect(vi.getTimerCount()).toBe(0);

      await vi.advanceTimersByTimeAsync(RESULT_WAIT_MS);

      expect(getResultMock).toHaveBeenCalledTimes(reads);
    });

    it("cancels the read on its way and ignores its answer", async () => {
      const answer = holdRead();
      const outcome = watch(
        waitForResult(RESULT_ID, new AbortController().signal),
      );
      const signal = getResultMock.mock.calls[0][1]?.signal;

      expect(signal?.aborted).toBe(false);

      await vi.advanceTimersByTimeAsync(RESULT_WAIT_MS);

      expect(signal?.aborted).toBe(true);
      expect(outcome.value).toBe(false);

      await answer(CALCULATED);
      await vi.advanceTimersByTimeAsync(RESULT_WAIT_MS);

      expect(outcome.value).toBe(false);
      expect(getResultMock).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe("when the run is left during the wait", () => {
    it("ends with false, cancels the read on its way and leaves no timer running", async () => {
      const controller = new AbortController();
      const answer = holdRead();
      const outcome = watch(waitForResult(RESULT_ID, controller.signal));
      const signal = getResultMock.mock.calls[0][1]?.signal;

      controller.abort();
      await vi.advanceTimersByTimeAsync(0);

      expect(outcome.value).toBe(false);
      expect(signal?.aborted).toBe(true);
      expect(vi.getTimerCount()).toBe(0);

      await answer(NOT_CALCULATED);
      await vi.advanceTimersByTimeAsync(RESULT_WAIT_MS);

      expect(getResultMock).toHaveBeenCalledTimes(1);
    });

    it("stops between two reads too", async () => {
      const controller = new AbortController();

      waitForResult(RESULT_ID, controller.signal);
      await vi.advanceTimersByTimeAsync(0);

      expect(vi.getTimerCount()).toBe(2);

      controller.abort();

      expect(vi.getTimerCount()).toBe(0);

      await vi.advanceTimersByTimeAsync(RESULT_WAIT_MS);

      expect(getResultMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("given a run that was left before the wait started", () => {
    it("ends with false and reads nothing", async () => {
      const controller = new AbortController();

      controller.abort();

      await expect(waitForResult(RESULT_ID, controller.signal)).resolves.toBe(
        false,
      );
      expect(getResultMock).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RESULT_READ_INTERVAL_MS, RESULT_WAIT_MS } from "@/constants/survey";
import { getResult } from "@/services/api/client/getResult";
import { type ResultLoadResult, ResultLoadStatus } from "@/types/survey";
import { createResultLoad } from "@/utils/vitest/survey/createResultLoad";

import { readCalculatedResult } from "./readCalculatedResult";

vi.mock("@/services/api/client/getResult");

const RESULT_ID = "0b9f3c1e-5a7d-4e2b-9c41-7f6a2d8e1b35";
const NOT_CALCULATED = createResultLoad({ id: RESULT_ID });
const CALCULATED = createResultLoad({ id: RESULT_ID, isCalculated: true });

const getResultMock = vi.mocked(getResult);

// What the wait ended with, or "going on" while it does.
const watch = (wait: Promise<ResultLoadResult | undefined>) => {
  const outcome: { value: ResultLoadResult | undefined | "going on" } = {
    value: "going on",
  };

  wait.then((value) => {
    outcome.value = value;
  });

  return outcome;
};

const read = (signal = new AbortController().signal) =>
  watch(readCalculatedResult(RESULT_ID, signal));

describe("readCalculatedResult()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    getResultMock.mockResolvedValue(NOT_CALCULATED);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  describe("when it starts", () => {
    it("asks for the result at once, by its identifier", () => {
      read();

      expect(getResultMock).toHaveBeenCalledTimes(1);
      expect(getResultMock).toHaveBeenCalledWith(RESULT_ID, {
        signal: expect.any(AbortSignal),
      });
    });
  });

  describe("given a calculated result", () => {
    it("answers with it after one read", async () => {
      getResultMock.mockResolvedValue(CALCULATED);

      const outcome = read();

      await vi.advanceTimersByTimeAsync(0);

      expect(outcome.value).toEqual(CALCULATED);
      expect(getResultMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("given a result that exists and is not calculated yet", () => {
    it("asks again every second until it is calculated", async () => {
      getResultMock
        .mockResolvedValueOnce(NOT_CALCULATED)
        .mockResolvedValueOnce(NOT_CALCULATED)
        .mockResolvedValueOnce(CALCULATED);

      const outcome = read();

      await vi.advanceTimersByTimeAsync(RESULT_READ_INTERVAL_MS);

      expect(outcome.value).toBe("going on");
      expect(getResultMock).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(RESULT_READ_INTERVAL_MS);

      expect(outcome.value).toEqual(CALCULATED);
      expect(getResultMock).toHaveBeenCalledTimes(3);
    });

    it("answers with nothing after 30 seconds, and stops asking", async () => {
      const outcome = read();

      await vi.advanceTimersByTimeAsync(RESULT_WAIT_MS - 1);

      expect(outcome.value).toBe("going on");

      await vi.advanceTimersByTimeAsync(1);

      const reads = getResultMock.mock.calls.length;

      expect(RESULT_READ_INTERVAL_MS).toBe(1000);
      expect(RESULT_WAIT_MS).toBe(30_000);
      expect(outcome.value).toBeUndefined();

      await vi.advanceTimersByTimeAsync(RESULT_WAIT_MS);

      expect(getResultMock).toHaveBeenCalledTimes(reads);
    });
  });

  describe("given a read that finds no result, or fails", () => {
    it.each([
      [ResultLoadStatus.NotFound],
      [ResultLoadStatus.Failed],
    ] as const)("answers with that read at once and asks no more: %s", async (status) => {
      getResultMock.mockResolvedValue({ status });

      const outcome = read();

      await vi.advanceTimersByTimeAsync(0);

      expect(outcome.value).toEqual({ status });

      await vi.advanceTimersByTimeAsync(RESULT_WAIT_MS);

      expect(getResultMock).toHaveBeenCalledTimes(1);
    });

    it("answers with a read that fails after the result was found", async () => {
      getResultMock
        .mockResolvedValueOnce(NOT_CALCULATED)
        .mockResolvedValueOnce({ status: ResultLoadStatus.Failed });

      const outcome = read();

      await vi.advanceTimersByTimeAsync(RESULT_READ_INTERVAL_MS);

      expect(outcome.value).toEqual({ status: ResultLoadStatus.Failed });
    });
  });

  describe("when the wait is left", () => {
    it("answers with nothing, cancels the read on its way and asks no more", async () => {
      const controller = new AbortController();
      const outcome = read(controller.signal);
      const signal = getResultMock.mock.calls[0][1]?.signal;

      controller.abort();
      await vi.advanceTimersByTimeAsync(RESULT_WAIT_MS);

      expect(outcome.value).toBeUndefined();
      expect(signal?.aborted).toBe(true);
      expect(getResultMock).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});

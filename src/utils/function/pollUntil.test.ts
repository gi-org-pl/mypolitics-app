import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { pollUntil } from "./pollUntil";

const INTERVAL_MS = 1000;
const LIMIT_MS = 30_000;

const read = vi.fn<(signal: AbortSignal) => Promise<number>>();
const isFinal = (value: number): boolean => value >= 10;

const poll = (signal: AbortSignal = new AbortController().signal) =>
  pollUntil(read, isFinal, {
    intervalMs: INTERVAL_MS,
    limitMs: LIMIT_MS,
    signal,
  });

// A read that the test answers by hand.
const holdRead = () => {
  let answer: (value: number) => void = () => undefined;

  read.mockImplementationOnce(
    () =>
      new Promise<number>((resolve) => {
        answer = resolve;
      }),
  );

  return async (value: number) => {
    answer(value);
    await vi.advanceTimersByTimeAsync(0);
  };
};

// What the wait ended with, or "going on" while it does.
const watch = (wait: Promise<number | undefined>) => {
  const outcome: { value: number | undefined | "going on" } = {
    value: "going on",
  };

  wait.then((value) => {
    outcome.value = value;
  });

  return outcome;
};

describe("pollUntil()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    read.mockResolvedValue(1);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  describe("when the wait starts", () => {
    it("reads at once, with a signal of its own", () => {
      poll();

      expect(read).toHaveBeenCalledTimes(1);
      expect(read).toHaveBeenCalledWith(expect.any(AbortSignal));
      expect(read.mock.calls[0][0].aborted).toBe(false);
    });
  });

  describe("given a first read that is final", () => {
    it("ends with that read and reads no more", async () => {
      read.mockResolvedValueOnce(12);

      const outcome = watch(poll());

      await vi.advanceTimersByTimeAsync(0);

      expect(outcome.value).toBe(12);
      expect(vi.getTimerCount()).toBe(0);

      await vi.advanceTimersByTimeAsync(LIMIT_MS);

      expect(read).toHaveBeenCalledTimes(1);
    });
  });

  describe("given reads that are not final", () => {
    it("reads again an interval after each read has answered, never two at a time", async () => {
      const answerFirst = holdRead();

      poll();

      // A slow read holds the next one back, however long it takes.
      await vi.advanceTimersByTimeAsync(INTERVAL_MS * 5);

      expect(read).toHaveBeenCalledTimes(1);

      await answerFirst(1);
      await vi.advanceTimersByTimeAsync(INTERVAL_MS - 1);

      expect(read).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(1);

      expect(read).toHaveBeenCalledTimes(2);
    });

    it("goes on until a read is final, and ends with it", async () => {
      read.mockResolvedValueOnce(1).mockResolvedValueOnce(2);
      read.mockResolvedValueOnce(10);

      const outcome = watch(poll());

      await vi.advanceTimersByTimeAsync(INTERVAL_MS);

      expect(outcome.value).toBe("going on");

      await vi.advanceTimersByTimeAsync(INTERVAL_MS);

      expect(outcome.value).toBe(10);
      expect(read).toHaveBeenCalledTimes(3);
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe("given no final read within the limit", () => {
    it("ends with nothing and stops reading", async () => {
      const outcome = watch(poll());

      await vi.advanceTimersByTimeAsync(LIMIT_MS - 1);

      expect(outcome.value).toBe("going on");

      await vi.advanceTimersByTimeAsync(1);

      const reads = read.mock.calls.length;

      expect(outcome.value).toBeUndefined();
      expect(vi.getTimerCount()).toBe(0);

      await vi.advanceTimersByTimeAsync(LIMIT_MS);

      expect(read).toHaveBeenCalledTimes(reads);
    });

    it("cancels the read on its way and ignores its answer", async () => {
      const answer = holdRead();
      const outcome = watch(poll());
      const [signal] = read.mock.calls[0];

      await vi.advanceTimersByTimeAsync(LIMIT_MS);

      expect(signal.aborted).toBe(true);
      expect(outcome.value).toBeUndefined();

      await answer(12);
      await vi.advanceTimersByTimeAsync(LIMIT_MS);

      expect(outcome.value).toBeUndefined();
      expect(read).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe("when the wait is left", () => {
    it("ends with nothing, cancels the read on its way and leaves no timer running", async () => {
      const controller = new AbortController();
      const answer = holdRead();
      const outcome = watch(poll(controller.signal));
      const [signal] = read.mock.calls[0];

      controller.abort();
      await vi.advanceTimersByTimeAsync(0);

      expect(outcome.value).toBeUndefined();
      expect(signal.aborted).toBe(true);
      expect(vi.getTimerCount()).toBe(0);

      await answer(12);
      await vi.advanceTimersByTimeAsync(LIMIT_MS);

      expect(read).toHaveBeenCalledTimes(1);
    });

    it("stops between two reads too", async () => {
      const controller = new AbortController();

      poll(controller.signal);
      await vi.advanceTimersByTimeAsync(0);

      expect(vi.getTimerCount()).toBe(2);

      controller.abort();

      expect(vi.getTimerCount()).toBe(0);

      await vi.advanceTimersByTimeAsync(LIMIT_MS);

      expect(read).toHaveBeenCalledTimes(1);
    });
  });

  describe("given a wait that was left before it started", () => {
    it("ends with nothing and reads nothing", async () => {
      const controller = new AbortController();

      controller.abort();

      await expect(poll(controller.signal)).resolves.toBeUndefined();
      expect(read).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
